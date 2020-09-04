const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const { generateRandomString, validateURL, findUserByEmail, findLongURLByShortURL, sendErrorMessage, isUserLoggedIn, isShortURLValid } = require('./helpers');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['superSecretKey']
}));

app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

let urlDatabase = {};
let users = {};
let shortURLVisits = {};

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  let templateVars = { urls: urlDatabase[userID], user: users[userID] };

  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  const userID = req.session.userID;
  let templateVars = { user: users[userID] };
  
  if (userID) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  const userID = req.session.userID;
  let templateVars = { user: users[userID] };
  
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const userID = req.session.userID;
  let templateVars = { user: users[userID] };
  
  res.render('urls_login', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;

  isShortURLValid(userID, shortURL, urlDatabase, res, () => {
    let templateVars = { shortURL, longURL: urlDatabase[userID][shortURL], user: users[userID], shortURLVisits };
    res.render('urls_show', templateVars);
  });
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = findLongURLByShortURL(shortURL, urlDatabase);
  let visitorID = req.session.visitorID;
  const currentShortURLVisits = shortURLVisits[shortURL];
  const date = String(new Date());

  if (longURL) {

    if (!visitorID) {
      req.session.visitorID = generateRandomString();
      visitorID = req.session.visitorID;
    }

    if (!currentShortURLVisits.uniqueVisits.includes(visitorID)) {
      currentShortURLVisits.uniqueVisits.push(visitorID);
    }

    currentShortURLVisits.visitTimeAndID.push({ date, visitorID });
    res.redirect(longURL);
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    sendErrorMessage('400', 'Email and/or Password cannot be empty', res);
  } else if (findUserByEmail(email, users)) {
    sendErrorMessage('400', 'Email already in use', res);
  } else {
    users[userID] = {
      userID,
      email,
      'password': bcrypt.hashSync(password, 3)
    };
    
    urlDatabase[userID] = {};
    req.session.userID = userID;
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = findUserByEmail(email, users);
  
  if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
    req.session.userID = foundUser.userID;
    res.redirect('/urls');
  } else {
    sendErrorMessage('403', 'Email or Password is incorrect', res);
  }
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.userID;
  let longURL = req.body.longURL;
  
  if (isUserLoggedIn(userID)) {
    urlDatabase[userID][shortURL] = validateURL(longURL);
    shortURLVisits[shortURL] = { uniqueVisits: [], visitTimeAndID: [] };
    res.redirect(`/urls/${shortURL}`);
  } else {
    sendErrorMessage('403', 'Access denied', res);
  }
});

app.put("/urls/:shortURL", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  
  isShortURLValid(userID, shortURL, urlDatabase, res, () => {
    urlDatabase[userID][shortURL] = validateURL(newURL);
    res.redirect('/urls');
  });
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  
  isShortURLValid(userID, shortURL, urlDatabase, res, () => {
    delete urlDatabase[userID][shortURL];
    res.redirect('/urls');
  });
});