var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var User       = require("../models/user");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var multer = require('multer');


//findById, findByIdAndUpdate, findByIdAndRemove全部为mongoose自带方法

//用于文件上传初始化
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

//使用cloudinary库，可以为本地图片添加url，并使用环境变量加密apikey
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dzpwprdsf', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});



//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        //Fuzzy Search， 通过字符匹配进行查找
        const regex = new RegExp(escapeRegex(req.query.search),'gi');
        //Campground即模板中导出的名字
         Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1){
                  noMatch = "No campgrounds match that query, please search another one."
                   
              }
             res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds', noMatch:noMatch});
           }
         });
    } else{
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds',noMatch:noMatch});
       }
    });
    }
});

//CREATE - add new campground to DB
//执行回调函数之前，先判断middleware
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var like = 0;
  var price = req.body.price;
  geocoder.geocode(req.body.location, function (err, data) {
      //handle google map invalid address or error
      if (err || data.status === 'ZERO_RESULTS'|| !data ) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }else{
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
   
    // Create a new campground and save to DB
   
    cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
      req.body.image = result.secure_url;
      var image =  req.body.image;
      // add author to campground

      var newCampground = {name: name, image: image, description: desc, price: price, like:like, author:author, location: location, lat: lat, lng: lng};
      //create相当于push+save
      Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
   });
    }
  });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn,  function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID, and make it display comments on show.ejs using populate, otherwiese the comment is only ID but not the content
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
           req.flash("error","Campground not found");
           res.redirect("back");
        } else {
            console.log(foundCampground);
            var user;
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, user:user});
        }
    });
});

router.get("/:id/:userid/like", middleware.isLoggedIn, function(req, res){
    
    //find the campground with provided ID, and make it display comments on show.ejs using populate, otherwiese the comment is only ID but not the content
     Campground.findById(req.params.id, function(err, foundCampground){
         if(err || !foundCampground){
         req.flash("error","Campground not found");
         res.redirect("back");
        } else{
             User.findById(req.params.userid, function(err, foundUser){
                 if(err || !foundUser){
                      req.flash("error","User not found");
                      res.redirect("back");
                 }else{
                         console.log(req.params.userid);
                         foundUser.likes.push(foundCampground);
                         foundUser.save();
                         console.log("!!!!");
                         console.log(foundUser);
                         foundCampground.like = foundCampground.like + 1;
                         foundCampground.save();
                        var like = true;
                               // render show template with that campground
                        res.render("campgrounds/show", {campground: foundCampground, user:foundUser, like:like});
                        }
            });
        }
    });
});

router.get("/:id/:userid/dislike", middleware.isLoggedIn, function(req, res){
    
    //find the campground with provided ID, and make it display comments on show.ejs using populate, otherwiese the comment is only ID but not the content
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
           req.flash("error","Campground not found");
           res.redirect("back");
        } else {
          User.findById(req.params.userid, function(err, foundUser){
             if(err || !foundUser){
               req.flash("error","DIUser not found");
               res.redirect("back");
            } else{
                    foundUser.likes.remove(foundCampground);
                    foundUser.save();
                    console.log("#####");
                    console.log(foundUser);
                    foundCampground.like = foundCampground.like - 1;
                    foundCampground.save();
                    var like = false;
                    //render show template with that campground
                    res.render("campgrounds/show", {campground: foundCampground, user:foundUser, like:like});
            }
         });
        }
    });
});
//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
         Campground.findById(req.params.id,function(err, foundCampground){
             if(err){
                  req.flash("error","You need to be logged in to do that");
                  res.redirect("back");
             }
            else{
                 res.render("campgrounds/edit",{campground:foundCampground});
            }
    });
    
});

//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    geocoder.geocode(req.body.location, function (err, data) {
     if (err || data.status === 'ZERO_RESULTS' || !data) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }else{
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    //获取表单数据req.body....
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
     Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err,updatedCampground){
         if(err){
             req.flash("error", err.message);
             res.redirect("back");
         }else{
             req.flash("success","Succesfully updated!");
             res.redirect("/campgrounds/" + req.params.id);
         }
     });
    }
});
});

//Destroy route
router.delete("/:id",middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
          User.find({}, function(err, foundUser) {
              if(err){
                  res.redirect("/campgrounds");
              }else{
                  console.log("RESULT");
                  console.log(foundUser);
                  if(foundUser.likes){
                       foundUser.likes.forEach(function(campground){
                         if(campground._id.equals(req.params.id)){
                          foundUser.likes.remove(campground);
                      }
                    });
                  }
              }
              
          });    
            req.flash("success","Campground deleted");
            res.redirect("/campgrounds");
        }
    })
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}

//导出该route，用于app.js调用
module.exports = router;