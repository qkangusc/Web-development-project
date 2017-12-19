var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment =require("./models/comment");

var data = [
    {
        name: "Cloud's Reset",
        image:"https://farm7.staticflickr.com/6105/6381606819_df560e1a51.jpg",
        description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
        
    },
    {
        name: "Desert Mesa",
        image:"https://farm3.staticflickr.com/2116/2164766085_0229ac3f08.jpg",
        description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
        
    },
    {
        name: "Canyan Floor",
        image:"https://farm8.staticflickr.com/7179/6927088769_cc14a7c68e.jpg",
        description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
        
    }
    
]


function seedDB(){
    Campground.remove({},function(err){
        if(err){
            console.log(err);
        }
            console.log("removed!!");
            data.forEach(function(seed){
            Campground.create(seed, function(err,campground){
               if(err){
                      console.log(err);
                } else{
                    console.log("added a campground");
                    
                    Comment.create({
                        text:"This place is great!",
                        author: "Max"
                    }, function(err,comment){
                        if(err){
                            console.log(err);
                        }
                        else{
                             campground.comments.push(comment);
                             campground.save();
                             console.log("created new comment");
                        }
                       
                    });
             }
         });
    });

});
 
 
}


module.exports = seedDB;