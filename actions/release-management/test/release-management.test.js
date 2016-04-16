var assert = require('assert')
  , releaseManagement = require('../index')()

describe('release-management', function () {

  it('should have a name property', function () {
    assert.equal(releaseManagement.name, 'release-management')
  })

  it('should handle webhooks of type "pull_request" and "issue_comment"', function () {
    var actionNames = Object.keys(releaseManagement.actions)
    assert.equal(actionNames.length, 2)
    assert.equal(actionNames[0], 'issue_comment')
    assert.equal(actionNames[1], 'pull_request')
  })

})
