/** 
 * tiny-app helper function test
 * 
 * Author: Jordan Cronier
 */

/**
 * Test dependencies
 */
const { assert } = require('chai');
const { getUserByEmail } = require('../scripts/helpers');


/**
 * Test data
 */

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

/**
 * Test functions
 */

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.deepEqual(user, testUsers[expectedOutput]);
  });

  it('should return undefined if email is not in database', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});