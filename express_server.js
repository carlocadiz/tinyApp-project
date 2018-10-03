var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser')
app.use(cookieParser())



app.set("view engine", "ejs");

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

  console.log(req.body.username);
  let cookies = req.body.username;
  res.cookie("username",cookies);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username : req.signedCookies.username};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {  console.log(req.params.id);
  let templateVars = { shortURL : req.params.id,
                       longURL :  urlDatabase[req.params.id],
                       username : req.signedCookies.username};
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
                       username : req.signedCookies.username};
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
