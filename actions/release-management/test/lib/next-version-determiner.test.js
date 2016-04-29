var assert = require('assert')
  , determineNextVersion = require('../../lib/next-version-determiner')

describe('release-management next version determiner', function () {

  it('should work when there are no current tags', function () {
    var tags = []
    assert.equal(determineNextVersion(tags, 'major'), 'v1.0.0')
    assert.equal(determineNextVersion(tags, 'minor'), 'v0.1.0')
    assert.equal(determineNextVersion(tags, 'patch'), 'v0.0.1')
    assert.equal(determineNextVersion(tags, 'premajor'), 'v1.0.0-0')
    assert.equal(determineNextVersion(tags, 'preminor'), 'v0.1.0-0')
    assert.equal(determineNextVersion(tags, 'prepatch'), 'v0.0.1-0')
  })

  it('should work when there are tags', function () {
    var tags =
          [ 'v2.1.0-2', 'v2.0.1-0', 'v2.0.1-0'
          , 'v2.0.0', 'v2.0.0-0', 'v1.1.0', 'v1.1.0-2', 'v1.0.1-0'
          ]
    assert.equal(determineNextVersion(tags, 'major'), 'v3.0.0')
    assert.equal(determineNextVersion(tags, 'minor'), 'v2.1.0')
    assert.equal(determineNextVersion(tags, 'patch'), 'v2.0.1')
    assert.equal(determineNextVersion(tags, 'premajor'), 'v3.0.0-0')
    assert.equal(determineNextVersion(tags, 'preminor'), 'v2.1.0-3')
    assert.equal(determineNextVersion(tags, 'prepatch'), 'v2.0.1-1')
  })

  it('should work when there are no pre tags', function () {
    var tags = [ 'v2.0.0' ]
    assert.equal(determineNextVersion(tags, 'major'), 'v3.0.0')
    assert.equal(determineNextVersion(tags, 'minor'), 'v2.1.0')
    assert.equal(determineNextVersion(tags, 'patch'), 'v2.0.1')
    assert.equal(determineNextVersion(tags, 'premajor'), 'v3.0.0-0')
    assert.equal(determineNextVersion(tags, 'preminor'), 'v2.1.0-0')
    assert.equal(determineNextVersion(tags, 'prepatch'), 'v2.0.1-0')
  })

})
