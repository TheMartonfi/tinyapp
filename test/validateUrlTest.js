const { assert } = require('chai');

const { validateURL } = require('../helpers.js');

describe('validateURL', () => {
  it('should return a url with http:// prefix if not present', () => {
    const url = validateURL('www.example.com');
    const expectedOutput = 'http://www.example.com';
    
    assert.equal(url, expectedOutput);
  });

  it('should return the same url if http:// or https:// is present', () => {
    const url = validateURL('https://www.example.com');
    const expectedOutput = 'https://www.example.com';
    
    assert.deepEqual(url, expectedOutput);
  });
});