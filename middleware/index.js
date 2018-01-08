//middleware
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User  = require("../models/user");

var middlewareObj = {};


//检查该campgro是否为当前用户所有
middlewareObj.checkCampgroundOwnership = function(req,res,next){
     if(req.isAuthenticated()){
         //从mongoDB中寻找含对应id的campground
             Campground.findById(req.params.id,function(err,foundCampground){
            //处理删改url中campgro id的bug
            if(err || !foundCampground){
                req.flash("error","Campground Not Found!");
                res.redirect("back");
            }else{
                 //does uer own the campground?
                 if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                 //next执行后续代码，不然会卡住
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
             //处理删改url中comment id的bug
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
            }else{
                 //does user own the comment? or 是否为管理员？
                 
                 //foundComment.author.id是一个string， 但是req.user._id是一个mongoose对象，所以不能用===
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

//只要该用户id的所有者才能进行user profile更改
middlewareObj.checkUserOwnership = function(req,res,next){
      if(req.isAuthenticated()){
         User.findById(req.params.id,function(err,foundUser){
            if(err || !foundUser ){
                req.flash("error","User not found");
                res.redirect("back");
            }else{
                 if(foundUser._id.equals(req.user._id)){
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


//判断用户是否登录
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}


//注册时确认密码
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
