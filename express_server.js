var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser')
app.use(cookieParser())



app.set("view engine", "ejs");

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

 currentUser = {};
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
var urlDatabase = {
                   "b2Vn2"  : { "long" : "htttp://www.lighthouselabs.ca", "user_id" : "userRandomID"},
                   "9sm5xK" : { "long" : "http://www.google.com", "user_id" : "userRandomID"},
                   "111111" : { "long" : "http://www.reddit.com", "user_id" : "11111"}
}

function generateRandomString() {
  let randomURL = "";
  randomURL = Math.random().toString(36).substring(2,8); // console.log(randomURL);
  return randomURL
}

function urlsForUser(userID){
  var urlList = {};
  //console.log(userID);

  for (let element in urlDatabase){
    console.log(element);
    if (urlDatabase[element].user_id === userID){
      urlList[element] = {"long" : urlDatabase[element].long,
                          "user_id": urlDatabase[element].long}
     }
   }
   return urlList;
}



// Login
app.post("/login", (req, res) => {
  let emailExist = false;
  let passwordExist =false;
  for (let element in users){
    if (users[element].email === req.body.email){
      emailExist = true;
      if (users[element].password === req.body.password){
        passwordExist = true;
        res.cookie("user_id", users[element].id);
        currentUser["user"] = users[element];
      }
    }
  }
  if (!emailExist || !passwordExist){
    res.send("ERROR: 403");
  }
  res.redirect("/urls");
});

// logout
app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  currentUser = {};
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let exist = false;

  if (password === "" || email === ""){
    res.send("400 Error");
  }
  for ( let element in users){
    if (users[element].email === email){
      exist = true;
    }
  }
  if (!exist){
    let randomUserID = generateRandomString(); // users[randomUserID] = randomUserID;
    users[randomUserID] = {"id" : randomUserID,
                           "email" : email,
                           "password" : password};
    res.cookie("user_id", randomUserID);
    currentUser["user"] = users[randomUserID];
 } else {
    res.send("400 Error - EMAIL EXIST");
 }
  console.log(users);
  res.redirect("/urls");
});


// opens new url to logged users
app.get("/urls/new", (req, res) => {

  let templateVars = { currentUser};
  if (req.cookies.user_id) {
  res.render("urls_new", templateVars);
  } else {
      res.redirect("/login");
  }
});
//Creates a new random short URL
app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = { "long" : req.body.longURL ,
                             "user_id" : req.cookies.user_id};
  console.log(urlDatabase);
  //res.redirect("http://localhost:8080/urls/" + randomURL);
  res.redirect("/urls");
});



// Show updated URL screen
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL : req.params.id,
                       longURL :  urlDatabase[req.params.id].long,
                       username : req.cookies.user_id};
  res.render("urls_show", templateVars);
});

//updates an URL
app.post("/urls/:id", (req, res) => {

 if (req.cookies.user_id) {
   urlDatabase[req.params.id].long = req.body.longURL;
   console.log(urlDatabase[req.params.id]);
   console.log(req.body.longURL);
 }
   res.redirect("/urls");
});

//Prints out the complete list of URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls : urlsForUser(req.cookies.user_id),
                       currentUser};
  console.log(templateVars)
  res.render("urls_index", templateVars);
});


//Deletes a short and long URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.user_id) {
    console.log("ready to delete" , req.params.id);
    console.log(urlDatabase[req.params.id]);
    delete urlDatabase[req.params.id];
  } else {
  res.redirect("/login");
  }
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {  //console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;//let longURL = urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});


app.get("/", (req, res) => {
  res.send("Hello. Welcome to TinyApp");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
