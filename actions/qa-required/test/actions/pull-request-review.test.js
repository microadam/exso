var assert = require('assert')
  , createAction = require('../../actions/pull-request-review')
  , serviceLocator = { config: { qaWhitelist: [] } }

describe('qa-required pull-request-review action', function () {

  it('should pass check when github action is "submitted", and state is "approved"', function (done) {

    var prReview = { review: { state: 'approved' } }
    createAction(serviceLocator).check('submitted', prReview, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "submitted"', function (done) {
    var prReview = { review: { state: 'approved' } }
    createAction(serviceLocator).check('bla', prReview, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when state is not "approved"', function (done) {
    var prReview = { review: { state: 'denied' } }
    createAction(serviceLocator).check('submitted', prReview, function (error, shouldExec) {
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
              assert.equal(label, 'qa-required')
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
              function getPull (number, cb) {
                assert.equal(number, 11)
                cb(null, pr)
              }
              return { getPull: getPull }
            }
          }
      , action = createAction(sl)
      , prReview =
          { repository: { name: 'repo-name', owner: { login: 'repo-owner' } }
          , 'pull_request': { number: 11 }
          }

    action.exec(prReview, function (error) {
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
              assert.equal(label, 'qa-required')
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
              function getPull (number, cb) {
                assert.equal(number, 11)
                cb(null, pr)
              }
              return { getPull: getPull }
            }
          }
      , action = createAction(sl)
      , prReview =
          { repository: { name: 'repo-name', owner: { login: 'repo-owner' } }
          , 'pull_request': { number: 11 }
          }

    action.exec(prReview, function (error) {
      if (error) return done(error)
      assert.equal(removeLabelsCalled, false, 'label should not have been removed')
      assert.equal(addStatusCalled, false, 'status should not have been added')
      done()
    })
  })

})
