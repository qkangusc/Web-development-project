var mongoose = require("mongoose");

//为campground定义一个模板
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   like: Number,
   description: String,
   location: String,
   lat: Number,
   lng: Number,
   //当前创建的时间
   createdAt: { type: Date, default: Date.now },
   
   //上传者
   author: {                        
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref:"User"             //链接到user.js中的User model
      },
      username: String
   },
   
   //评论
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"       //链接到 comment.js中的Comment model
      }
   ]
});

//导出该模板，名字为Campground
module.exports = mongoose.model("Campground", campgroundSchema);