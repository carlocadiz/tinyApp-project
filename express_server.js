// Dependancies and middleware activation

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

// database declaratons, currentUser stores the user information of the currently logged in user
const users = {};
var currentUser = {};
var urlDatabase = {};

// Function to return a 6 character random alpha-numeric string. Used to store short URL code and
// userID token.
function generateRandomString() {
  let randomURL = "";
  randomURL = Math.random().toString(36).substring(2,8); // console.log(randomURL);
  return randomURL
}

// Function to return all urls based on user ID parameter
function urlsForUser(userID){

  let urlList = {};

    for (let element in urlDatabase){    //  console.log(element);
      if (urlDatabase[element].user_id === userID){
        urlList[element] = {"long" : urlDatabase[element].long,
                            "user_id": urlDatabase[element].long}
       };
     };
     return urlList;
}

// Verifies if a url exists in the database dependent on short url code.
function urlExist(shortURL){
    for (let element in urlDatabase){
      if (shortURL === element){
        return true;
      };
    };
   return false;
  }

// Verifies is the short url belongs to a different based on the parameter userID
function urlDifferentUser(shortURL, userID){
  for (let element in urlDatabase){
      if (shortURL === element && urlDatabase[element].user_id !== userID){
        return true;
      };
    };
   return false;
}



// Login method.  Will check if the email received from login form exists in the user database. If email does
// exist, the encryped password is compared to the provided password. If successful, a cookie session is created.
// If password or email is not correct, a 403 error message is provided.
app.post("/login", (req, res) => {
  let emailExist = false;
  let passwordExist =false;

    for (let element in users){
      if (users[element].email === req.body.email){
        emailExist = true;
        if (bcrypt.compareSync(req.body.password, users[element].password)){
          passwordExist = true;
          req.session.user_id = users[element].id;
          currentUser["user"] = users[element];
        };
      };
    };
    if (!emailExist || !passwordExist){
      res.send("ERROR: 403");
    } else {
      res.redirect("/urls");
    };
});

// Logout handler. When logout is submitted, the cookie session is deleted, the currentUSer is set to blank object
// and redirect is sent to /url.
app.post("/logout", (req, res) => {

  req.session = null;
  currentUser = {};
  res.redirect("/urls");
});

// Register handler. When a new user is registered, verification is performed to ensure email and password are enetered.
// Verificaton is also performed to ensure if email already exist or password is incorrect.
// When verified, hashed password is created through bcrypt middleware and a random user id is generated.
// The user database is updated.

app.post("/register", (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  let exist = false;
  let hashedPassword = bcrypt.hashSync(password, 10);
 if (password === ""){
    res.send("400 ERROR - MISSING PASSWORD")
  } else if ( email === ""){
    res.send("400 ERROR - MISSING EMAIL");
  } else {
    for ( let element in users){
      if (users[element].email === email){
        exist = true;
      };
    };
    if (!exist){
      let randomUserID = generateRandomString();
      users[randomUserID] = {"id" : randomUserID,
                           "email" : email,
                           "password" : hashedPassword};
      req.session.user_id = randomUserID;
      currentUser["user"] = users[randomUserID];
    } else {
      res.send("400 Error - EMAIL ALREADY EXIST");
   };
    res.redirect("/urls");
  };
});


// New url screen is rendered for logged in users. Non logged users are redirected to login screen.
app.get("/urls/new", (req, res) => {
  let templateVars = { user : currentUser};
  if (req.session.isPopulated) {
    res.render("urls_new", templateVars);
  } else {
      res.redirect("/login");
  };
});

// When a new url is sent, a random short url is generated, and url database is updated with short URL, long URL
// and user ID information.

app.post("/urls", (req, res) => {
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = { "long" : req.body.longURL ,
                             "user_id" : req.session.user_id};
  res.redirect("/urls/" + randomURL);
});

// An individual short URl is dispayed to logged in users. Inforamtion including current short URL and corresponding
// long URL along with current user information is rendered to ejs files. Verification is performed to ensure a logged
// user cannot access the URL's of another user or a non existant URL. If no user is logged on, a message is sent.
app.get("/urls/:id", (req, res) => {

  if(req.session.isPopulated){
    if (urlDifferentUser(req.params.id, req.session.user_id)) {
        res.send("THE REQUESTED URL BELONGS TO A DIFFERENT USER");
        res.redirect("/urls");
    } else if (urlExist(req.params.id)){
      let templateVars = { shortURL : req.params.id,
                       longURL :  urlDatabase[req.params.id].long,
                       user : currentUser};
      res.render("urls_show", templateVars);
    } else {
      res.send("THAT URL DOES NOT EXIST");
    }
  }else {
    res.send("YOU ARE NOT LOGGED IN. PLEASE LOG IN TO EDIT URLS");
  }
});

//Update URL handler. When a request is sent to update an URL, the database is updated to reflect the updated long URL.
// If user is not logged, they ae redirected to the login form.
app.post("/urls/:id", (req, res) => {

 if (req.session.user_id) {
   urlDatabase[req.params.id].long = req.body.longURL;
   res.redirect("/urls");
 } else {
   res.send("Please log in");
 }
});


// Display handler. When get /url is called, information for the logged user is retrieved ( for urlsForUser function )
//from the database and sent to be rendered through ejs files. If no user is logged, the entire listing of short URL's will be diplayed.
// The current user is set to null.
app.get("/urls", (req, res) => {

  if (req.session.isPopulated){
    let templateVars = { urls : urlsForUser(req.session.user_id),
                         user : currentUser};
    res.render("urls_index", templateVars);
  } else {
      res.render("urls_index", {urls : urlDatabase,
                                user : false});
  };
});

// Delete handler. When a delete request is sent, the record is deleted from the database and redirect is sent
// to /url screen. If a non logged in user attempts to delete a record, an appropriate message is sent.
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.isPopulated) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
      res.send("PLEASE LOGIN TO DELETE URL");
  }
});

// When a short URL is requested, the corresponding long URL is obtained and redirected to the website.
// If short URL is not valed, the appropriate message is displayed.
app.get("/u/:shortURL", (req, res) => {

  if(urlExist(req.params.shortURL)){
    let longURL = urlDatabase[req.params.shortURL].long;
    res.redirect(longURL);
  } else {
      res.send("That URL DOES NOT EXIST")
  }
});

// Register screen is rendered for non logged in users. Logged in users are redirected to the main URL screeen.
app.get("/register", (req, res) => {
  if (req.session.isPopulated){
    res.redirect("/urls");
  } else {
      res.render("register");
  }
});

// Login screen is rendered for non logged in users. Logged in users are redirected to the main URL screen.
app.get("/login", (req, res) => {
  if (req.session.isPopulated){
    res.redirect("/urls");
  } else {
    res.render("login")
  }
});

// Root folder is redirected the main URL screen for logged in users. Non logged useres will be directed the login
// screen
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
