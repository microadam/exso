var assert = require('assert')
  , qaRequired = require('../index')()

describe('qa-required', function () {

  it('should have a name property', function () {
    assert.equal(qaRequired.name, 'qa-required')
  })

  it('should handle webhooks of type "pull_request", "issue_comment" and "pull_request_review"', function () {
    var actionNames = Object.keys(qaRequired.actions)
    assert.equal(actionNames.length, 3)
    assert.equal(actionNames[0], 'pull_request')
    assert.equal(actionNames[1], 'pull_request_review')
    assert.equal(actionNames[2], 'issue_comment')
  })

})
