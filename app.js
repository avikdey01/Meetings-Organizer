//importing packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//mongoose mongoDB setup
mongoose.connect("mongodb://localhost:27017/meetsDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  meets: []
});

const User = mongoose.model("User", userSchema);

const meetSchema = new mongoose.Schema({
  name: String,
  link: {
    type: String,
    required: [true, "Meeting Link is required!"]
  },
  date: String,
  time: String
});

const Meet = mongoose.model("Meet", meetSchema);




app.get("/", function(req, res) {
  Meet.find({},function(err, meets) {
    if(err) {
      console.log(err);
    } else {
      res.render("index",{meets: meets});
    }
  })

});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/add", function(req, res) {
  res.render("add_meet");
});

app.get("meets/:route", function(req, res) {
  const customRoute = req.params.route;
  User.findOne({email: customRoute}, function(err, foundUser) {
    if(!err) {
      res.render("index", {username: foundUser.name, usermeets: foundUser.meets});
    }
  });
});

app.post("/", function(req,res) {
  res.redirect("/add");
});

app.post("/register", function(req, res) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      meets: []
    });
    user.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.render("login", {meets: user.meets});
      }
    });
  });
});

app.post("/login", function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email}, function(err, foundUser) {
    if(err) {
      console.log(err);
    } else {
      if(foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result === true) {
            res.render("index", {meets: foundUser.meets});
          }
        });
      }
    }
  });
});

app.post("/add", function(req, res) {
  var meetName = req.body.meetName;
  var meetLink = req.body.meetLink;
  var meetDate = req.body.meetDate;
  var meetTime = req.body.meetTime;

  const meet = new Meet({
    name: meetName,
    link: meetLink,
    date: meetDate,
    time: meetTime
  });

  meet.save();
  res.redirect("/");
});

app.post("/delete", function(req, res) {
  const deleteId = req.body.deleteBtnId;
  Meet.findByIdAndRemove(deleteId, function(err) {
    if(err) {
      console.log(err);
    }
  });
  res.redirect("/");
});



app.post("/join", function(req, res) {
  const url = req.body.joinBtn;
  res.redirect(url);
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
