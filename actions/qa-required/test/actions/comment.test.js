var assert = require('assert')
  , createAction = require('../../actions/comment')

describe('qa-required comment action', function () {

  it('should pass check when github action is "created", contains '
    + 'a thumbs up and author is not QAer', function (done) {

    var comment = { body: ':+1:', author: 'dave', issueAuthor: 'steve' }
    createAction().check('created', comment, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "created"', function (done) {
    var comment = { body: ':+1:', author: 'dave', issueAuthor: 'steve' }
    createAction().check('not-created', comment, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when body does not contain thumbs up', function (done) {
    var comment = { body: 'message', author: 'dave', issueAuthor: 'steve' }
    createAction().check('created', comment, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when author is the same as QAer', function (done) {
    var comment = { body: ':+1:', author: 'dave', issueAuthor: 'dave' }
    createAction().check('created', comment, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof createAction().exec, 'function')
  })

  it('should remove the label and add a status if it has the "qa-required" label', function (done) {
    var removeLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: [ 'qa-required' ]
          , removeLabel: function (label, cb) {
              removeLabelsCalled = true
              assert.equal(label,'qa-required')
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options, { context: 'QA Check', description: 'has been QAed?', state: 'success' })
              cb()
            }
          }
      , sl =
          { repoManager: function (owner, repo) {
              assert.equal(owner, 'repo-owner')
              assert.equal(repo, 'repo-name')
              function getPull(number, cb) {
                assert.equal(number, 11)
                cb(null, pr)
              }
              return { getPull: getPull }
            }
          }
      , action = createAction(sl)
      , comment = { issueNumber: 11, repoName: 'repo-name', repoOwner: 'repo-owner' }

    action.exec(comment, function (error) {
      if (error) return done(error)
      assert.equal(removeLabelsCalled, true, 'label should have been removed')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should not remove the label nor add a status if it does not have the "qa-required" label', function (done) {
    var removeLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: []
          , removeLabel: function (label, cb) {
              removeLabelsCalled = true
              assert.equal(label,'qa-required')
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              cb()
            }
          }
      , sl =
          { repoManager: function (owner, repo) {
              assert.equal(owner, 'repo-owner')
              assert.equal(repo, 'repo-name')
              function getPull(number, cb) {
                assert.equal(number, 11)
                cb(null, pr)
              }
              return { getPull: getPull }
            }
          }
      , action = createAction(sl)
      , comment = { issueNumber: 11, repoName: 'repo-name', repoOwner: 'repo-owner' }

    action.exec(comment, function (error) {
      if (error) return done(error)
      assert.equal(removeLabelsCalled, false, 'label should not have been removed')
      assert.equal(addStatusCalled, false, 'status should not have been added')
      done()
    })
  })

})
