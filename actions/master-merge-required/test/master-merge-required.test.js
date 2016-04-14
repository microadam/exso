var assert = require('assert')
  , masterMergeRequiredAction = require('../index')()

describe('master-merge-required', function () {

  it('should have a name property', function () {
    assert.equal(masterMergeRequiredAction.name, 'master-merge-required')
  })

  it('should handle webhooks of type "pull_request", and "push"', function () {
    var actionNames = Object.keys(masterMergeRequiredAction.actions)
    assert.equal(actionNames.length, 2)
    assert.equal(actionNames[0], 'push')
    assert.equal(actionNames[1], 'pull_request')
  })

})
