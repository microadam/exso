var assert = require('assert')
  , sl =
      { repoManager: function () {
          return { getOpenPulls: function (cb) {
              cb(null, [])
            }
          }
        }

      }
  , action = require('../../actions/pull-request')(sl)

describe('release-management pull request action', function () {

  it('should pass check when github action is "opened" and is a release PR', function (done) {
    action.check('opened', { branch: 'release/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "opened"', function (done) {
    action.check('closed', { branch: 'release/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when it is not release PR', function (done) {
    action.check('opened', { branch: 'feature/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof action.exec, 'function')
  })

  it('should add the "release" label', function (done) {
    var addLabelsCalled = false
      , pr =
          { labels: []
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'release' ])
              cb()
            }
          }

    action.exec(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      done()
    })
  })

})
