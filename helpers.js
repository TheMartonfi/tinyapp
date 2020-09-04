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

const findUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const findLongURLByShortURL = (shortURL, urlDatabase) => {
  for (const url in urlDatabase) {
    const longURL = urlDatabase[url][shortURL];

    if (urlDatabase[url][shortURL]) {
      return longURL;
    }
  }
  return null;
};

const sendErrorMessage = (status, message, res) => {
  let templateVars = { status, message, user: null };
  return res.status(status).render('error', templateVars);
};

const isUserLoggedIn = (userID) => {
  if (userID) {
    return true;
  } else {
    return false;
  }
};

const doesUserOwnURL = (userID, shortURL, urlDatabase) => {
  if (urlDatabase[userID][shortURL]) {
    return true;
  } else {
    return false;
  }
};

const isAccessAllowed = (userID, shortURL, urlDatabase, res) => {
  if (isUserLoggedIn(userID, res) && doesUserOwnURL(userID, shortURL, urlDatabase)) {
    return true;
  } else {
    return false;
  }
};

const isShortURLValid = (userID, shortURL, urlDatabase, res, cb) => {
  if (findLongURLByShortURL(shortURL, urlDatabase)) {
    if (isAccessAllowed(userID, shortURL, urlDatabase, res)) {
      cb();
    } else {
      sendErrorMessage('403', 'Access denied', res);
    }
  } else {
    sendErrorMessage('404', 'Page not found', res);
  }
};

module.exports = { generateRandomString, validateURL, findUserByEmail, findLongURLByShortURL, sendErrorMessage, isUserLoggedIn, doesUserOwnURL, isAccessAllowed, isShortURLValid };