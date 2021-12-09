const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");



app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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

const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

const getUserURLs = (user,databaseobj) => {
  let resultURL = {};
 for(const shortURL in databaseobj){
    if(databaseobj[shortURL].userID === user){
     resultURL[shortURL] = databaseobj[shortURL];
    }
 }
 return resultURL;
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
 
  //const templateVarss = { display: users[req.cookies.user_id], urls: urlDatabase };
  const templateVarss = { display: users[req.cookies.user_id], urls: getUserURLs(req.cookies.user_id,urlDatabase) };
  console.log(templateVarss);
  if(req.cookies.user_id) {
  res.render("urls_index", templateVarss);
  } else {
    res.send('To access urls you must <a href= "/login"> login </a>  or  <a href= "/register"> register </a>');
  }
  // if(users[req.cookies.user_id] === urlDatabase[req.params][userID]){
  // }
  // else{
  //   res.redirect("/login")
  // }
 
}); 


app.get("/urls/new", (req, res) => {
  const templateVarss = { display: users[req.cookies.user_id], urls: urlDatabase };
  const temp = "urls_new";
  if(!users[req.cookies.user_id]){
    res.redirect("/login")
  }
  else{
    res.render("urls_new", templateVarss);
  }
});

//get u
app.get("/urls/:shortURL", (req, res) => {
  if(req.cookies.user_id === urlDatabase[req.params.shortURL].userID)
  {
  const templateVars = { display: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  console.log(templateVars);
  res.render("urls_show", templateVars);
  } else {
    res.send("Can't access urls not under your account");
  }
});

//to make new URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURLs = req.body.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.send(`Your shortlink: ${shortURL}, Your longlink: ${longURLs}, Your ID: ${req.cookies.user_id}`);         // Respond with 'Ok' (we will replace this)

  urlDatabase[shortURL] = {
    longURL: longURLs,
    userID: req.cookies.user_id
  };
  
  console.log(urlDatabase);
});

//req.params for GET 
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  //for(let i = 0; i < )
  const first8 = longURL.substr(0,7);
  const first9 = longURL.substr(0,8);
console.log(first8,first9); 
  http://https//github.com/expressjs/cookie-parser

  if(first8 === "http://" || first9 === "https://"){
  res.redirect(longURL);
  } else {
    longURL = "http://" + longURL;
    res.redirect(longURL);
  }

});

//delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL)
  if(!urlDatabase[req.params.shortURL]){
    res.send("URL doesn't exist");
    return
  }

  if(req.cookies.user_id === urlDatabase[req.params.shortURL].userID)
  {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  } else {
    res.send("Can't delete urls not under your account");
  }

});

//edit button
app.post("/urls/:shortURL", (req, res) => {
  //console.log(req.params.shortURL)

  if(req.cookies.user_id === urlDatabase[req.params.shortURL].userID)
  {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  console.log(urlDatabase)
  res.redirect("/urls");
  } else {
    res.send("Can't edit urls not under your account");
  }

});

//updateed login to check if the username and password exist or match
app.post('/login', (req, res) => {
  // console.log('req.body', req.body);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);
  console.log('user', user);
  
  if(!user){
    return res.status(400).send("a user with that email does not exist")
  }

  if(user.password !== password) {
    return res.status(400).send('password does not match')
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls')
})


app.get("/login", (req, res) => {
  console.log(req.body)
 
  const templateVarss = { display: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_login",templateVarss);
});


app.post("/logout", (req, res) => {
  console.log(users[req.cookies.user_id])
  res.clearCookie("user_id");
  res.redirect("/urls");
  console.log(users);
});


app.get("/register", (req, res) => {
  const templateVarss = { display: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_registration",templateVarss);
});

//add a new user object to the global users object
app.post("/register", (req, res) => {
  userID = generateRandomString();
  console.log(req.body.email,req.body.password)
  email = req.body.email;
  password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);

  if(user) {
    return res.status(400).send("a user already exists with that email")
  }

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