const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let shortURL = "";
  let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; 
  let randomNum = "0123456789"
  for (let i = 0; i < 3; i++){
    shortURL += randomChars.charAt(Math.floor(Math.random() * randomChars.length)) + randomNum.charAt(Math.floor(Math.random() * randomNum.length - 1));
  }
    return  shortURL;
}

//global object for storing users
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


//Home page 
app.get("/", (req, res) => {
  res.send("Hello!");
});
//json page fordatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVarss = { display: req.cookies.username, urls: urlDatabase };
  console.log(templateVarss);
  res.render("urls_index", templateVarss);
}); 

app.get("/urls/new", (req, res) => {
  const templateVarss = { display: req.cookies.username, urls: urlDatabase };
  res.render("urls_new",templateVarss);
});

//get u
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { display: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//req.body for POST 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send(`Your shortlink: ${shortURL}, Your longlink: ${longURL}`);         // Respond with 'Ok' (we will replace this)
  urlDatabase[shortURL] = longURL;
  //if username
});

//req.params for GET 
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit button
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.params.shortURL)
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(req.body)
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log(req.cookies.username)
  res.clearCookie("username");
  res.redirect("/urls");
});


app.get("/register", (req, res) => {
  const templateVarss = { display: req.cookies.username, urls: urlDatabase };
  res.render("urls_registration",templateVarss);
});

//add a new user object to the global users object
app.post("/register", (req, res) => {
  userID = generateRandomString();
  console.log(req.body.email,req.body.password)
  email = req.body.email;
  password = req.body.password;
  users[userID] = {
    id: userID,
    email: email,
    password: password
  };
  
  console.log('users', users);

  res.cookie("user_id", userID);
  console.log(req.cookies.user_id);
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});