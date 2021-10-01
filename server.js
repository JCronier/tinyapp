/**
 * tiny-app server
 *
 * Author: Jordan Cronier
 */


/**
 * Module dependencies
 */

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const favicon = require("serve-favicon");
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require("./scripts/helpers");
const { urlDatabase, users } = require("./database/database");

const app = express();
const PORT = 8080;

/**
 * Middleware for express
 */

app.use(favicon(__dirname + "/images/favicon.ico"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"]
}));

/**
 * View Engine for express
 */

app.set("view engine", "ejs");

/**
 * GET request methods
 */

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
    error: req.query.error
  };

  // Show URLs if logged in
  if (req.session.user_id) return res.render("urls_index", templateVars);

  res.render("urls_home", templateVars);
});

// Create new URL if logged in
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };

    return res.render("urls_new", templateVars);
  }

  res.status(401).redirect("/login?error=You+must+be+logged+in+to+create+URLs");
});

app.get("/urls/:id", (req, res) => {
  // not logged in
  if (!req.session.user_id) return res.status(401).redirect("/urls");

  // URL not found
  if (!urlDatabase[req.params.id]) {
    return res.status(404).redirect("/urls?error=That+URL+does+not+exist");
  }

  // URL ID tag doesn't match user
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.status(401).redirect("/urls?error=You+do+not+own+that+URL");
  }

  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };

  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  // already logged in
  if (req.session.user_id) return res.redirect("/urls");

  const templateVars = { user: users[req.session.user_id] , error: req.query.error};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  // already logged in
  if (req.session.user_id) return res.redirect("/urls");

  const templateVars = {
    user: users[req.session.user_id],
    error: req.query.error
  };

  res.render("login", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).redirect("/urls?error=That+URL+does+not+exist");
  }

  res.redirect(urlDatabase[req.params.id].longURL);
});

/**
 * POST request methods
 */

// Create new url if user logged in
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();

    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };

    return res.redirect(`/urls/${shortURL}`);
  }
  
  res.status(401).redirect("/login?error=You+must+be+logged+in+to+creat+URLs");
});

// Only owners of URLs can view and edit them
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const id = req.params.id;
    urlDatabase[id].longURL = req.body.longURL;

    return res.redirect("/urls");
  }

  res.status(403).redirect("/urls?error=You+cannot+edit+URLs+you+do+not+own");
});

// Only owners of URLs can delete them
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];

    return res.redirect("/urls");
  }

  res.status(403).redirect("/urls?error=You+cannot+delete+URLs+you+do+not+own.");
});

// Login with valid credentials
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // empty fields
  if (!email || !password) {
    return res.status(403).redirect("/login?error=Email+and%2For+password+fields+empty");
  }

  // not a user
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).redirect("/login?error=That+email+does+not+exist");
  }

  // passwords don't match
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).redirect("/login?error=Invalid+credentials");
  }

  // login
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // empty fields
  if (!email || !password) {
    return res.status(400).redirect("/register?error=Email+and%2For+password+fields+empty");
  }

  // account exists
  if (getUserByEmail(email, users)) {
    return res.status(400).redirect("/register?error=Email+address+already+in+use");
  }

  // create new user
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  // login
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/**
 * Server listen port 8080
 */

app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});