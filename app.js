require("dotenv").config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect(process.env.URI);

const Schema = mongoose.Schema;
const userSchema = new Schema ({
    email: String,
    password: String
})


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});


const User = new mongoose.model("user", userSchema);

app.get("/", function(req, res){
    res.render("home");
})

app.get("/register", function(req, res){
    res.render("register");
})

app.get("/login", function(req, res){
    res.render("login");
})


app.post("/register", function(req, res){
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save().then(()=>{
        res.render("secrets");
    })
    .catch(err => {
        console.error("Error saving user", err);
        res.status(500).send("An error occurred while saving the user");
    })
})

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}).then((foundUser) => {
        if(foundUser.password === password){
            res.render("secrets")
        }else{
            res.send("Password incorrect");
        }
        
    })
    .catch(err => {
        console.error("Error finding user", err);
        res.status(404).send("User not found");
    })
})






app.listen(3000, function(){
    console.log("Server running on port 3000");
})