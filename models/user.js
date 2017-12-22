 var mongoose    = require("mongoose");
 //用于验证
 var passportLocalMongoose = require("passport-local-mongoose");
 
 var UserSchema = new mongoose.Schema({
     username: {type: String, unique: true, required: true},
     password: String,
     firstName:{type: String, required: true},
     lastName:{type: String, required: true},
     email: {type: String, unique: true, required: true},
     resetPasswordToken: String,
     resetPasswordExpires: Date,
     avatar: String,
     isAdmin: {type:Boolean, default: false},
     likes: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Campground"       
      }
   ]
 });
 
 UserSchema.plugin(passportLocalMongoose);
 
 module.exports = mongoose.model("User",UserSchema);