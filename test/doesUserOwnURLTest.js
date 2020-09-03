const { assert } = require('chai');

const { doesUserOwnURL } = require('../helpers.js');

const testURLDatabase = {
  'dF43yt': { "b2xVn2": "http://www.lighthouselabs.ca" },
  'gH73D8': { "9sm5xK": "http://www.google.com" }
};

describe('doesUserOwnURL', () => {
  it('should return true if a user owns the shortURL', () => {
    const input = doesUserOwnURL('dF43yt', 'b2xVn2', testURLDatabase);
    const expectedOutput = true;
    
    assert.equal(input, expectedOutput);
  });

  it(`should return false if a user doesn't own the shortURL`, () => {
    const input = doesUserOwnURL('gH73D8', 'b2xVn2', testURLDatabase);
    const expectedOutput = false;
    
    assert.equal(input, expectedOutput);
  });
});