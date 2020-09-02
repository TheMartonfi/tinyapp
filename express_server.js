const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'ejs');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {};

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const validateURL = (URL) => {
  return URL.substring(0,7) !== 'http://' && URL.substring(0,8) !== 'https://' ? URL = 'http://' + URL : URL;
};

const findUserEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { urls: urlDatabase, user: users[userID] };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = validateURL(longURL);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { user: users[userID] };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { user: users[userID] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('ERROR 400: Email and/or Password cannot be empty.');
  }

  if (findUserEmail(email)) {
    return res.status(400).send('ERROR 400: Email already in use.');
  }

  users[id] = {
    id,
    email,
    password
  };

  res.cookie('userID', id);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  //Should redirect to login page but goes to register for now.
  res.redirect('/register');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = validateURL(newURL);
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userID] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});