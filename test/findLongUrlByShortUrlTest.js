const { assert } = require('chai');

const { findLongURLByShortURL } = require('../helpers.js');

const testURLDatabase = {
  'dF43yt': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'gH73D8': { "9sm5xK": "http://www.google.com" }
};

describe('findLongURLByShortURL', () => {
  it('should return a longURL matching shortURL', () => {
    const url = findLongURLByShortURL('b2xVn2', testURLDatabase);
    const expectedOutput = 'http://www.lighthouselabs.ca';
    
    assert.equal(url, expectedOutput);
  });

  it('should return null if longURL does not match shortURL', () => {
    const url = findLongURLByShortURL('dJs34H', testURLDatabase);
    const expectedOutput = null;
    
    assert.equal(url, expectedOutput);
  });
});