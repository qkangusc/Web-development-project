var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")

//requiring routes    
var commonRoutes       = require("./routes/comments"),
    campgroundsRoutes  = require("./routes/campgrounds"),
    indexRoutes        = require("./routes/index");
    
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v7";
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

app.use(require("express-session")({
    secret:"Kobe is the best NBA player!!",
    resave: false,
    saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





//middleware，根据currentUser的值判断用户是否已经登录，应用于所有包含navbar的route
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/comments",commonRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});