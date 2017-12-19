var express = require("express");
var router  = express.Router({mergeParams:true});     //与campgrounds.js中的id绑定，确保req.params.id不为空
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {   //middleware先判断是否登录，若登录才调用之后的callback
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{campground:campground});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req,res){      //middleware先判断是否登录，若登录才调用之后的callback
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }
                else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    console.log(comment);
                    req.flash("success","Succesfully added comment!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
            
        }
    });
});

//Edit Comment
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            return res.redirect("back");
        } else{
             Comment.findById(req.params.comment_id,function(err, foundComment) {
                if(err){
                    res.redirect("back");
                }else{
                     res.render("comments/edit",{campground_id: req.params.id, comment: foundComment});
                }
            });
        }
    });
   
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedCampground){
         if(err){
             res.redirect("back");
         }else{
             req.flash("success","Succesfully posted!");
             res.redirect("/campgrounds/" + req.params.id);
         }
     });
});


//Destroy route
router.delete("/:comment_id",middleware.checkCommentOwnership,  function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Comment deleted");
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
});


module.exports = router;