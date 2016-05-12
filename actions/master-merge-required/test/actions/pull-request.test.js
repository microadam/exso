var assert = require('assert')
  , createAction = require('../../actions/pull-request')

describe('master-merge-required pull request action', function () {

  var sl =
        { authedUser: { username: 'test' }
        , repoManager: function () {
           var repoManager =
                { getCommit: function (sha, cb) {
                    cb(null, { author: { name: 'dave' } })
                  }
                }
            return repoManager
          }
        }

  it('should pass check when github action is "opened"', function (done) {
    createAction(sl).check('opened', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should pass check when github action is "synchronize" and commit not by bot', function (done) {
    createAction(sl).check('synchronize', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "opened" or "synchronize"', function (done) {
    createAction(sl).check('closed', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when github action is "synchronize" and commit is by bot', function (done) {
    var sl =
          { authedUser: { username: 'bot' }
          , repoManager: function () {
             var repoManager =
                  { getCommit: function (sha, cb) {
                      cb(null, { author: { name: 'bot' } })
                    }
                  }
              return repoManager
            }
          }
    createAction(sl).check('synchronize', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof createAction().exec, 'function')
  })

})
