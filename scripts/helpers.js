// helpers.js

const { urlDatabase, users } = require("../database/database");

const generateRandomString = function() {
  let newString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const newStringLength = 6;

  for (let i = 0; i < newStringLength; i++) {
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return newString;
};

const checkEmail = function(email) {
  for (const userId in users) {
    if (users[userId].email === email) return users[userId];
  }

  return null;
};

const urlsForUser = function(id) {
  const userUrls = {};

  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }

  return userUrls;
};

module.exports = {
  generateRandomString,
  checkEmail,
  urlsForUser
};