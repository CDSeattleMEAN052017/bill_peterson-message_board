// ------------------SETUP-----------------------------

var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Schema = mongoose.Schema;
var session = require("express-session");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));
app.use(session({secret: "slayeroneproductions"}))
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/message_board");

//--------------------------DB  SCHEMAS--------------------

var MessageSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2},
  message: { type: String, required: true, minlength: 10},
  comments: {type: Array}
}, {timestamps: true});

mongoose.model("Message", MessageSchema);
var Message = mongoose.model("Message");

// --------------------------------------------------------


app.get("/", function(req, res) {
  Message.find({}, function(err, messages){
    if(err){
      console.log("something went wrong");
      console.log(err);
      req.session.errors = Message.errors;
      res.render("index", {errors: req.session.errors});
    }
    else{
      console.log("getting messages");
      console.log(messages);
      console.log(req.session.errors);
      res.render("index", {messages: messages, errors: req.session.errors});
    }
  })

})


app.post("/message", function(req, res) {
 console.log("POST DATA", req.body);

 var message = new Message({name: req.body.name, message: req.body.message});

 message.save(function(err){
   if(err){
     console.log("something went wrong");
     console.log(err);
     req.session.errors = message.errors;
     res.redirect("/");
   }
   else{
     console.log("message created");
     req.session.errors = {};
     res.redirect("/");
   }
 })
})

app.post("/comment", function(req, res) {
 console.log("POST DATA", req.body);

 req.session.errors = {};

 if(req.body.name.length < 2 || req.body.comment.length < 10){
   console.log(req.session.errors);
   if(req.body.name.length < 2){
     req.session.errors.name = {message: "Name length must be two or more characters."};
     console.log(req.session.errors);
   }
   if(req.body.comment.length < 10){
     req.session.errors.comment = {message: "Comment length must be 10 or more characters."};
     console.log(req.session.errors);
   }
   res.redirect("/");
 }
 else{
   Message.update({_id: req.body.messageId}, {$push: {comments: {name:req.body.name, comment: req.body.comment}}}, function(err){
     if(err){
       console.log("something went wrong");
       console.log(err);
       req.session.errors = Message.errors;
       res.redirect("/");
     }
     else{
       console.log("comment added");
       req.session.errors = {};
       res.redirect("/");
     }
   })

 }

})

//--------------------LISTEN-----------------
app.listen(8000, function() {
 console.log("listening on port 8000");
});
