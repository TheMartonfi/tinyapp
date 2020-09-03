// (Stretch) the date the short URL was created
// (Stretch) the number of times the short URL was visited
// (Stretch) the number of unique visits for the short URL

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { generateRandomString, validateURL, findUserByEmail, findLongURLByShortURL, sendErrorMessage, isUserLoggedIn, isAccessAllowed } = require('./helper_functions');

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
    userID: 'dF43yt',
    email: 'test@mail.com',
    password: '1234'
  },
  'gH73D8': {
    userID: 'gH73D8',
    email: 'test2@mail.com',
    password: '1234'
  }
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

  if (isUserLoggedIn(userID)) {
    urlDatabase[userID][shortURL] = validateURL(longURL);
    res.redirect(`/urls/${shortURL}`);
  } else {
    sendErrorMessage('403', 'Access denied', res);
  }
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
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return sendErrorMessage('400', 'Email and/or Password cannot be empty', res);
  } else if (findUserByEmail(email, users)) {
    return sendErrorMessage('400', 'Email already in use', res);
  }

  users[userID] = {
    userID,
    email,
    password
  };

  urlDatabase[userID] = {};
  res.cookie('userID', userID);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email, users);

  if (foundUser && foundUser.password === password) {
    res.cookie('userID', foundUser.userID);
    res.redirect('/urls');
  } else {
    sendErrorMessage('403', 'Email or Password is incorrect', res);
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


  if (findLongURLByShortURL(shortURL, urlDatabase)) {
    isAccessAllowed(userID, shortURL, urlDatabase, res, () => {
      urlDatabase[userID][shortURL] = validateURL(newURL);
      res.redirect('/urls');
    });
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.userID;

  if (findLongURLByShortURL(shortURL, urlDatabase)) {
    isAccessAllowed(userID, shortURL, urlDatabase, res, () => {
      delete urlDatabase[userID][shortURL];
      res.redirect('/urls');
    });
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.userID;
  const shortURL = req.params.shortURL;

  if (findLongURLByShortURL(shortURL, urlDatabase)) {
    isAccessAllowed(userID, shortURL, urlDatabase, res, () => {
      let templateVars = { shortURL, longURL: urlDatabase[userID][shortURL], user: users[userID] };
      res.render('urls_show', templateVars);
    });
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = findLongURLByShortURL(shortURL, urlDatabase);

  if (longURL) {
    res.redirect(longURL);
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
});