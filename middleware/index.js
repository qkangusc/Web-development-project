//middleware
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next){
     if(req.isAuthenticated()){
             Campground.findById(req.params.id,function(err,foundCampground){
            if(err || !foundCampground){
                req.flash("error","Campground Not Found!");
                res.redirect("back");
            }else{
                 //does uer own the campground?
                 if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                 }else{
                     req.flash("error","You don't have permission to do that");
                     res.redirect("back");
                 }
            }
        });
        }else{
            req.flash("error","You need to be logged in to do that");
            res.redirect("back");
        }
}


//防止通过其他途径post，比如postman
middlewareObj.checkCommentOwnership = function(req,res,next){
      if(req.isAuthenticated()){
         Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            }else{
                 //does uer own the comment?
                 if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                 }else{
                      req.flash("error","You don't have permission to do that");
                      res.redirect("back");
                 }
            }
        });
        }else{
            res.redirect("back");
        }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}


middlewareObj.confirmPassword = function(req,res,next){
    if(req.body.confirm_password !== req.body.password){
         req.flash("error","Passwords do not match.");
         res.redirect("/register");
    }else{
        next();
    }
}

/*middlewareObj.checkInfo = function(req,res,next){
    if(!req.body.firstName || !req.body.lastName || !req.body.email ){
         req.flash("error","Please fill all the required information.");
          res.redirect("/register");
    }else{
           next();
    }
     
    
}*/


module.exports = middlewareObj;
