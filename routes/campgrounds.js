var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require('geocoder');



//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search),'gi');
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
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var price = req.body.price;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
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
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn,  function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID, and make it display on show.ejs using populate, otherwiese it is only ID.
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
           req.flash("error","Campground not found");
           res.redirect("back");
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
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
});
});

//Destroy route
router.delete("/:id",middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            req.flash("success","Campground deleted");
            res.redirect("/campgrounds");
        }
    })
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}


module.exports = router;