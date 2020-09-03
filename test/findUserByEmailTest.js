const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

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

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = { id: "userRandomID", email: "user@example.com", password: "purple-monkey-dinosaur"};
    
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null with an invalid email', () => {
    const user = findUserByEmail("test@mail.com", testUsers);
    const expectedOutput = null;
    
    assert.deepEqual(user, expectedOutput);
  });
});