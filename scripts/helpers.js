/**
 * tiny-app helper functions
 *
 * Author: Jordan Cronier
 */

/**
 * Module dependencies
 */
const { urlDatabase } = require("../database/database");

/**
 * Functions
 */

const generateRandomString = function() {
  let newString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const newStringLength = 6;

  for (let i = 0; i < newStringLength; i++) {
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return newString;
};

const getUserByEmail = function(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) return database[userId];
  }

  return undefined;
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
  getUserByEmail,
  urlsForUser
};