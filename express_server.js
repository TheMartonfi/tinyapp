// Add function that checks if user is logged in and can access certain GET / POST requests

// (Stretch) the date the short URL was created
// (Stretch) the number of times the short URL was visited
// (Stretch) the number of unique visits for the short URL

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('view engine', 'ejs');

let urlDatabase = {
  'dF43yt': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'gH73D8': { "9sm5xK": "http://www.google.com" }
};

let users = {
  'dF43yt': {
    id: 'dF43yt',
    email: 'test@mail.com',
    password: '1234'
  },
  'gH73D8': {
    id: 'gH73D8',
    email: 'test2@mail.com',
    password: '1234'
  }
};

const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const validateURL = (URL) => {
  return URL.substring(0,7) !== 'http://' && URL.substring(0,8) !== 'https://' ? URL = 'http://' + URL : URL;
};

const findUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const findLongURLByShortURL = (shortURL) => {

  for (const url in urlDatabase) {
    const longURL = urlDatabase[url][shortURL];

    if (urlDatabase[url][shortURL]) {
      return longURL;
    }
  }
  return null;
};

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { urls: urlDatabase[userID], user: users[userID] };

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.cookies.userID;
  let longURL = req.body.longURL;

  urlDatabase[userID][shortURL] = validateURL(longURL);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { user: users[userID] };

  if (userID) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { user: users[userID] };

  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { user: users[userID] };

  res.render('urls_login', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('ERROR 400: Email and/or Password cannot be empty');
  }

  if (findUserByEmail(email)) {
    return res.status(400).send('ERROR 400: Email already in use');
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
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email)

  if (foundUser && foundUser.password === password) {
    res.cookie('userID', foundUser.id);
    res.redirect('/urls');
  } else {
    res.status(403).send('ERROR 403: Email or Password is incorrect');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  const userID = req.cookies.userID;

  urlDatabase[userID][shortURL] = validateURL(newURL);
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.userID;

  delete urlDatabase[userID][shortURL];
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.userID;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[userID][req.params.shortURL], user: users[userID] };

  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const userID = req.cookies.userID;
  const shortURL = req.params.shortURL;
  const longURL = findLongURLByShortURL(shortURL);

  res.redirect(longURL);
});