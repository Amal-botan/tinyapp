const generateRandomString = ()  => {
  let shortURL = "";
  let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomNum = "0123456789";
  for (let i = 0; i < 3; i++) {
    shortURL += randomChars.charAt(Math.floor(Math.random() * randomChars.length)) + randomNum.charAt(Math.floor(Math.random() * randomNum.length - 1));
  }
  return  shortURL;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password:"purple-monkey-dinosaur"
    
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

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



const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const getUserURLs = (user,databaseobj) => {
  let resultURL = {};
  for (const shortURL in databaseobj) {
    if (databaseobj[shortURL].userID === user) {
      resultURL[shortURL] = databaseobj[shortURL];
    }
  }
  return resultURL;
};

module.exports = {
  generateRandomString,
  findUserByEmail,
  getUserURLs,
  users,
  urlDatabase
};