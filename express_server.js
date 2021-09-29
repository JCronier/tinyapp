// express_server.js

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const app = express();
const PORT = 8080; // default port 8080

app.use(favicon(__dirname + "/images/favicon.ico"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("tiny"));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    user: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
   };
  if (urlDatabase[req.params.shortURL] === undefined) {
    
    setTimeout(() => {
      res.redirect("/urls");
    }, 2000);
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  //res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) return res.status(400).redirect("/register");
  if (checkEmail(email)) return res.status(400).redirect("/register");

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password
  };

  res.cookie("user_id", id);
  console.log(users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let newString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const newStringLength = 6;

  for(let i = 0; i < newStringLength; i++) {
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return newString;
}

function checkEmail(email) {
  for(const userId in users) {
    if (users[userId].email === email) return users[userId];
  }

  return null;
}