var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  secret: "purple-monkey-dinosaur"
}))

const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 10);


app.set("view engine", "ejs");
/*
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "11111" : {
    id: "11111",
    email: "carlocadiz@yahoo.com",
    password: "111"
  }
}
*/
 const users = {};
 var currentUser = {};
/*
var urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "111111" : "http//wwww/this.is.me"
};
/*
var urlDatabase = {
                   "userRandomID" :  [{ "short" : "b2xVn2"  , "long" : "www.lighthouselabs.ca"},
                                     { "short" : "9sm5xK"  , "long" : "http://www.google.com"}],
                   "user2RandomID" : [{ "short" : "111111"  , "long" : "http//www.reddit.com"}]

                }
*/
/*
var urlDatabase = {
                   "b2Vn2"  : { "long" : "htttp://www.lighthouselabs.ca", "user_id" : "userRandomID"},
                   "9sm5xK" : { "long" : "http://www.google.com", "user_id" : "userRandomID"},
                   "111111" : { "long" : "http://www.reddit.com", "user_id" : "11111"}
}
*/
var urlDatabase = {};

function generateRandomString() {
  let randomURL = "";
  randomURL = Math.random().toString(36).substring(2,8); // console.log(randomURL);
  return randomURL
}

function urlsForUser(userID){
  var urlList = {};
  //console.log(userID);

  for (let element in urlDatabase){
  //  console.log(element);
    if (urlDatabase[element].user_id === userID){
      urlList[element] = {"long" : urlDatabase[element].long,
                          "user_id": urlDatabase[element].long}
     }
   }
     return urlList;
}

function urlExist(shortURL){
    for (let element in urlDatabase){
      if (shortURL === element){
        return true;
      }
    }
   return false;
  }

function urlDifferentUser(shortURL, userID){
  for (let element in urlDatabase){
      if (shortURL === element && urlDatabase[element].user_id !== userID){
        return true;
      }
    }
   return false;
}



// Login
app.post("/login", (req, res) => {
  let emailExist = false;
  let passwordExist =false;
  console.log(req.session.user_id);




    for (let element in users){
      if (users[element].email === req.body.email){
        emailExist = true;
     // if (users[element].password === req.body.password){

        if (bcrypt.compareSync(req.body.password, users[element].password)){
          passwordExist = true;
          req.session.user_id = users[element].id;
          currentUser["user"] = users[element];
        }
      }
    }
    if (!emailExist || !passwordExist){
      res.send("ERROR: 403");
    } else {
      res.redirect("/urls");
    }


});

// logout
app.post("/logout", (req, res) => {

  req.session = null;
  currentUser = {};
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let exist = false;
  let hashedPassword = bcrypt.hashSync(password, 10);

  if (password === "" || email === ""){
    res.send("400 Error - MISSING EMAIL OR PASSWORD");
  }
  for ( let element in users){
    if (users[element].email === email){
      exist = true;
    }
  }
  if (!exist){
    let randomUserID = generateRandomString();
    users[randomUserID] = {"id" : randomUserID,
                           "email" : email,
                           "password" : hashedPassword};
    req.session.user_id = randomUserID;
   // res.cookie("user_id", randomUserID);
    currentUser["user"] = users[randomUserID];
 } else {
    res.send("400 Error - EMAIL ALREADY EXIST");
 }
 // console.log(users);
  res.redirect("/urls");
});


// opens new url to logged users
app.get("/urls/new", (req, res) => {
  console.log("current user:",currentUser);
  let templateVars = { user : currentUser};
  if (req.session.user_id) {
    console.log("going to render urls new");
    res.render("urls_new", templateVars);
  } else {
      res.redirect("/login");
  }
});
//Creates a new random short URL
app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = { "long" : req.body.longURL ,
                             "user_id" : req.session.user_id};
 // console.log(urlDatabase);

  console.log(" in post/urls created userid and updated database, going to get urls/:id");
  res.redirect("/urls/" + randomURL);
  //res.redirect("/urls");
});



// Show updated URL screen
app.get("/urls/:id", (req, res) => {


  if(req.session.isPopulated){
    if (urlDifferentUser(req.params.id, req.session.user_id)) {
        res.send("THE REQUESTED URL BELONGS TO A DIFFERENT USER");
        res.redirect("/urls");
    } else if (urlExist(req.params.id)){
      console.log("i am in get:urls:id");
      let templateVars = { shortURL : req.params.id,
                       longURL :  urlDatabase[req.params.id].long,
                       username : req.session.user_id,
                       user : currentUser};
      console.log("i am in urls show")
      res.render("urls_show", templateVars);
    } else {
      res.send("THAT URL DOES NOT EXIST");
      //res.redirect("/urls");
    }
  }else {
    res.send("YOU ARE NOT LOGGED IN. PLEASE LOG IN TO VIEW URLS");
  }
});

//updates an URL
app.post("/urls/:id", (req, res) => {

 if (req.session.user_id) {
   urlDatabase[req.params.id].long = req.body.longURL;
   res.redirect("/urls");
 } else {
   res.send("Please log in");
 }
});

//Prints out the complete list of URLs
app.get("/urls", (req, res) => {

  //console.log(templateVars)
  if (req.session.isPopulated){
    let templateVars = { urls : urlsForUser(req.session.user_id),
                         user : currentUser};
    res.render("urls_index", templateVars);
  } else {
      res.render("urls_index", {urls : undefined,
                                user : false});

  }
});


//Deletes a short and long URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.isPopulated) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
      res.send("PLEASE LOGIN TO DELETE URL");
  }
});


app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {


  if(urlExist(req.params.shortURL)){
    let longURL = urlDatabase[req.params.shortURL].long;
    res.redirect(longURL);
  } else {
      res.send("That URL DOES NOT EXIST")
  }
});


app.get("/register", (req, res) => {
  if (req.session.isPopulated){
    res.redirect("/urls");
  } else {
      res.render("register");
  }
});

app.get("/login", (req, res) => {
  if (req.session.isPopulated){
    res.redirect("/urls");
  } else {
    res.render("login")
  }

});


app.get("/", (req, res) => {
  if (req.session.isPopulated){
    res.redirect("/urls");
  } else {
    res.redirect("/login")
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
