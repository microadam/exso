var assert = require('assert')
  , baseNotMasterAction = require('../index')()

describe('base-not-master', function () {

  it('should have a name property', function () {
    assert.equal(baseNotMasterAction.name, 'base-not-master')
  })

  it('should only handle webhooks of type "pull_request"', function () {
    var actionNames = Object.keys(baseNotMasterAction.actions)
    assert.equal(actionNames.length, 1)
    assert.equal(actionNames[0], 'pull_request')
  })

  it('should pass check function if github action is "opened" and PR base is not "master"', function (done) {
    var prAction = baseNotMasterAction.actions['pull_request']
    prAction.check('opened', { baseRef: 'not-master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check function if github action is not "opened"', function (done) {
    var prAction = baseNotMasterAction.actions['pull_request']
    prAction.check('closed', { baseRef: 'not-master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check function if PR base is "master"', function (done) {
    var prAction = baseNotMasterAction.actions['pull_request']
    prAction.check('opened', { baseRef: 'master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should run exec function', function (done) {
    var prAction = baseNotMasterAction.actions['pull_request']
      , closeCalled = false
      , addCommentCalled = false
      , pr =
          { author: 'dave'
          , close: function (cb) {
              closeCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              var expectedComment = '@dave All PRs should be based off of `master`. ' +
                    'Please open a new PR with `master` as the base. Closing.'
              assert.equal(comment, expectedComment)
              cb()
            }
          }
    prAction.exec(pr, function (error) {
      if (error) return done(error)
      assert.equal(closeCalled, true, 'close should have been called')
      assert.equal(addCommentCalled, true, 'addComment should have been called')
      done()
    })
  })

})
