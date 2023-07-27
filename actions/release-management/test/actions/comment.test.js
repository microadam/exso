var assert = require('assert')
  , rewire = require('rewire')
  , createAction = rewire('../../actions/comment')

describe('release-management comment action', function () {

  it('should pass check when github action is "created" comment contains trigger phrase', function (done) {
    var sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
        }
      }
      , action = createAction(sl)
    action.check('created', { body: '@test add to release' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "created"', function (done) {
    var action = createAction({ authedUser: { username: 'test' } })
    action.check('opened', { body: '@test add to release' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check comment includes bot and is created by bot and contains trigger phrase', function (done) {
    var sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
        }
      }
      , action = createAction(sl)
    action.check('created', { body: '@test add to release', author: 'test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it(
    'should not pass check comment includes bot and is created by bot' +
    ' and contains trigger phrase in the middle of comment body'
    , function (done) {
    var sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
        }
      }
      , action = createAction(sl)
    action.check(
      'created'
      , { body: '@test foobar baz @test merged into release', author: 'test' }
      , function (error, shouldExec) {
        if (error) return done(error)
        assert.equal(shouldExec, false, 'shouldExec should be false')
        done()
      })
  })

  it(
    'should not pass check comment includes bot and is created by bot' +
    ' and contains trigger phrase in the middle of comment body' +
    'and is the unknown command message'
    , function (done) {
    var sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
        }
      }
      , action = createAction(sl)
    action.check(
      'created'
        , { body: '@test Unknown command: foobar baz @test merged into release', author: 'test' }
      , function (error, shouldExec) {
        if (error) return done(error)
        assert.equal(shouldExec, false, 'shouldExec should be false')
        done()
      })
  })

  it(
    'should not pass check comment includes bot and is created by bot' +
      ' and does not contain trigger phrase'
    , function (done) {
    var sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
        }
      }
      , action = createAction(sl)
    action.check('created', { body: '@test foobar baz WITH HASTE', author: 'test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when comment does not contain trigger phrase', function (done) {
    var addCommentCalled = false
      , sl =
      { authedUser: { username: 'test' }
        , repoManager: function () {
          return {
            getPull: function (_, cb) {
              cb(null, {
                addComment: function (commentText, cb) {
                  addCommentCalled = true
                  assert.equal(commentText, '@jack Unknown command: `bla`')
                  cb()
                }
              })
            }
          }
        }
      }
      , action = createAction(sl)

    action.check('created', { body: '@test bla', author: 'jack' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      assert.equal(addCommentCalled, true, 'comment not added')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof createAction().exec, 'function')
  })

  it('should do nothing if no corresponding action is defined for a trigger phrase', function (done) {

    var reset = createAction.__set__('triggerPhraseChecker', function () {
      return function checkTriggerPhrase () {
        return 'fakeAction'
      }
    })
    , sl =
          { repoManager: function () {
              function getPull (issueNumber, cb) {
                cb(null, {})
              }
              return { getPull: getPull }
            }
          }
      , action = createAction(sl)
      , comment = { body: '@test add to release test' }

    action.exec(comment, function (error) {
      if (error) return done(error)
      reset()
      done()
    })
  })

  it('should execute the "addToRelease" action', function (done) {
    var addToReleaseCalled = false
      , sl = null
      , action = null
      , comment = null

    createAction.__set__('createAddToRelease', function () {
      return function addToRelease (pr, comment, actionValue, skipStatusChecks, cb) {
        addToReleaseCalled = true
        assert.equal(actionValue, 'test')
        cb()
      }
    })

    sl =
        { authedUser: { username: 'test' }
        , repoManager: function () {
            function getPull (issueNumber, cb) {
              cb(null, {})
            }
            return { getPull: getPull }
          }
        }
    action = createAction(sl)
    comment = { body: '@test add to release test' }

    action.exec(comment, function (error) {
      if (error) return done(error)
      assert.equal(addToReleaseCalled, true, 'addToRelease was not called')
      done()
    })
  })

})
