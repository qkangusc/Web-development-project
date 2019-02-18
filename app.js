var express     = require("express"),       //Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
    app         = express(),
    //读取表单数据
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    //用于弹出提示信息
    flash       = require("connect-flash"),
    //用于authentication
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    //用于兼容put和delete
    methodOverride = require("method-override"),
    //引用models
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds")

//requiring routes    
var commonRoutes       = require("./routes/comments"),
    campgroundsRoutes  = require("./routes/campgrounds"),
    indexRoutes        = require("./routes/index");
 
//environment variable   
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v7";
mongoose.connect(url);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//permit visit /public
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

app.use(require("express-session")({
    secret:"Kobe is the best NBA player!!",
    resave: false,
    saveUninitialized: false
}));
//moment.js  set time format
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//res.locals和app.locals是express中两个可以用于模板渲染的对象，
//所以res.locals下的currentUser，success，error等可以在不同的模板中直接使用而不用被当做参数传入
//middleware，根据currentUser的值判断用户是否已经登录，应用于所有包含navbar的route
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//简化routes，比如routes/campground.js中的route默认以"/campgrounds"开头
app.use("/", indexRoutes);
app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id/comments",commonRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});
