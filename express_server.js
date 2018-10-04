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
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomURL = "";
  randomURL = Math.random().toString(36).substring(2,8); // console.log(randomURL);
  return randomURL
}

app.post("/login", (req, res) => {

  let cookies = req.body.username;
  res.cookie("username",cookies);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  //let cookies = req.body.username;
 // console.log(req.cookies.username);
  res.clearCookie("username");
 // console.log(req.cookies.username);
//  res.cookie("username",cookies);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
 // console.log(req.signedCookies.username);
  let templateVars = { username : req.cookies.username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {  console.log(req.params.id);
  let templateVars = { shortURL : req.params.id,
                       longURL :  urlDatabase[req.params.id],
                       username : req.cookies.username};
  res.render("urls_show", templateVars);
});

//update an URL
app.post("/urls/:id", (req, res) => {
 // console.log(req.params.id)
  urlDatabase[req.params.id] = req.body.longURL;//let longURL = urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Prints out the complete list of URLs
app.get("/urls", (req, res) => {
  let templateVars = { urls : urlDatabase ,
                       username : req.cookies.username};
  res.render("urls_index", templateVars);
});

//Creates a new random short URL
app.post("/urls", (req, res) => {
//  console.log(req.body);  // debug statement to see POST parameters
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;   // Respond with 'Ok' (we will replace this)
  res.redirect("http://localhost:8080/urls/" + randomURL);
});

//Deletes a short and long URL
app.post("/urls/:id/delete", (req, res) => {  //console.log(req.params.id);
  delete urlDatabase[req.params.id];//let longURL = urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {  //console.log(req.params.id);
//  console.log(req.params.id)
  urlDatabase[req.params.id] = req.body.longURL;//let longURL = urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});



app.get("/u/:shortURL", (req, res) => {
   let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  let randomUserID = generateRandomString(); // users[randomUserID] = randomUserID;
  users[randomUserID] = {"id" : randomUserID,
                               "email" : req.body.email,
                               "password" : req.body.password};
  res.cookie("user_id", randomUserID);
  res.redirect("/urls");
});


app.get("/register", (req, res) => {

  res.render("register");
});


app.get("/", (req, res) => {
  res.send("Hello!");
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
