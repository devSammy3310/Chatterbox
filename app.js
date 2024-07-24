require("dotenv").config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.URI);

const Schema = mongoose.Schema;
const userSchema = new Schema ({
    email: String,
    name: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
})

app.get("/register", function(req, res){
    res.render("register");
})

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/secrets", function(req, res){
    if(req.isAuthenticated){
        res.render("secrets");
    }else{
        res.redirect("login")
    }
})






app.post("/register", function(req, res){
   User.register({username: req.body.username, name:req.body.name}, req.body.password, function(err, user){
    if(err){
        console.log(err);
        res.redirect("/");
    }else {
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
        })
    }
   })
})

app.post("/login", function(req, res, next){
   passport.authenticate("local", function(err, user, info){
    if(err){
       return next(err);
    }
    if(!user){
        return res.send("unauthorized")
    }
    req.login(user, function(err){
        if(err){
           return next(err)
        }
        return res.redirect("/secrets")
    })
   })(req, res, next);
})






app.listen(3000, function(){
    console.log("Server running on port 3000");
})







// const bcryptjs = require("bcryptjs");
// const saltRounds = 12;


// const username = req.body.username;
//     const password = req.body.password;
//     User.findOne({email: username}).then((foundUser) => {
//         if(foundUser){
//             const result = bcryptjs.compareSync(password, foundUser.password)
//             if(result=== true){
//                 res.render("secrets")
//             }else{
//                 res.send(" Password incorrect");
//             }
//         }else{
//             res.send("You don't have an account, please register")
//         }
        
//     })
//     .catch(err => {
//         console.error("Error finding user", err);
//         res.status(404).send("User not found");
//     })



// const salt = bcryptjs.genSaltSync(saltRounds);
// const hash = bcryptjs.hashSync(req.body.password, salt);
// const newUser = new User ({
//     email: req.body.username,
//     password: hash
// })

// User.findOne({email: req.body.username}).then((foundUser) => {
//     if(foundUser){
//         res.send("User already exist");
//     }else{
//         newUser.save().then(()=>{
//             res.render("secrets");
//     })}

// })
// .catch(err => {
//     console.error("Error saving user", err);
//     res.status(500).send("An error occurred while saving the user");
// })