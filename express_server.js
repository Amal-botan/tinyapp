const express = require("express");
const cookieParser = require('cookie-parser');
const  cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const {generateRandomString, findUserByEmail,getUserURLs, users, urlDatabase }   = require("./helpers.js");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["I like potatoes, cheese and gravy", "key"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

//GET
//Home page
app.get("/", (req, res) => {
  const templateVarss = { display: users[req.session.user_ID], urls: urlDatabase };
  if (!users[req.session.user_ID]) {
    res.redirect("/login");
  } else {
    res.render("urls", templateVarss);
  }
});

//json page fordatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVarss = { display: users[req.session.user_ID], urls: getUserURLs(req.session.user_ID,urlDatabase) };

  if (req.session.user_ID) {
    res.render("urls_index", templateVarss);
  } else {
    res.send('To access urls you must <a href= "/login"> login </a>  or  <a href= "/register"> register </a>');
  }
});


app.get("/urls/new", (req, res) => {
  const templateVarss = { display: users[req.session.user_ID], urls: urlDatabase };
 
  if (!users[req.session.user_ID]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVarss);
  }
});

//get u
app.get("/urls/:id", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.send("No long link for this short URL");
  }
 

  if (req.session.user_ID === urlDatabase[req.params.id].userID) {
    const templateVars = { display: users[req.session.user_ID], shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL};
   
    res.render("urls_show", templateVars);
  } else {
    res.send("Can't access urls not under your account");
  }
});


app.get("/register", (req, res) => {
  const templateVarss = { display: users[req.session.user_ID], urls: urlDatabase };
 
  if (!users[req.session.user_ID]) {
    res.render("urls_registration",templateVarss);
  } else {
    res.redirect("/urls");
  }

  
});


app.get("/login", (req, res) => {
 
 
  const templateVarss = { display: users[req.cookies.user_ID], urls: urlDatabase };
  if (!users[req.session.user_ID]) {
    res.render("urls_login",templateVarss);
  } else {
    res.redirect("/urls");
  }
  

});



//req.params for GET
app.get("/u/:id", (req, res) => {

  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;
  const first8 = longURL.substr(0,7);
  const first9 = longURL.substr(0,8);

 
  if (!urlDatabase[req.params.id] ){
    res.send("URL does not exist");
  }

  if (first8 === "http://" || first9 === "https://") {
    res.redirect(longURL);
  } else {
    longURL = "http://" + longURL;
    res.redirect(longURL);
  }

});



//POST
//to make new URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURLs = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURLs,
    userID: req.session.user_ID
  };
  

  res.redirect(`/urls/${shortURL}`);
});

//delete button
app.post("/urls/:id/delete", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    res.send("URL doesn't exist");
    return;
  }

  if (req.session.user_ID === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("Can't delete urls not under your account");
  }

});

//edit button
app.post("/urls/:id", (req, res) => {
  if (req.session.user_ID === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID
    };

    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.send("Can't edit urls not under your account");
  }

});

//updateed login to check if the username and password exist or match
app.post('/login', (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, salt);
  
  if (!email || !hashedPassword) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);

  
  if (!user) {
    return res.status(400).send("a user with that email does not exist");
  }

  if (user.password !== hashedPassword) {
    return res.status(400).send('password does not match');
  }

  req.session.user_ID = user.id;
  res.redirect('/urls');
});


//logout 
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls");

});


//add a new user object to the global users object
app.post("/register", (req, res) => {
  let userID = generateRandomString();

  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, salt);

  if (!bcrypt.compareSync(password, hashedPassword)) {
    return  res.send("Password isn't hashed");
  }

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send("a user already exists with that email");
  }

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };
  



  req.session.user_ID = userID;

  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});