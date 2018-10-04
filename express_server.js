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

 currentUser = {};

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
 // emailExist = false;
 // passwordExist = false;
  res.redirect("/");
});

app.post("/logout", (req, res) => {

  res.clearCookie("user-id");
  currentUser = {};
  res.redirect("/login");
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
                       currentUser};
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
  //  console.log(currentUser);

 } else {
    res.send("400 Error - EMAIL EXIST");
 }
  console.log(users);
  res.redirect("/urls");
});


app.get("/register", (req, res) => {

  res.render("register");
});

app.get("/login", (req, res) => {

  res.render("login");
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
