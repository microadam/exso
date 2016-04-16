var assert = require('assert')
  , action = require('../../actions/pull-request')()

describe('qa-required pull request action', function () {

  it('should pass check when github action is "opened" and not release PR', function (done) {
    action.check('opened', { branch: 'feature/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should pass check when github action is "synchronize" and not release PR', function (done) {
    action.check('synchronize', { branch: 'feature/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "opened" or "synchronize"', function (done) {
    action.check('closed', { branch: 'feature/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should not pass check when is release PR', function (done) {
    action.check('synchronize', { branch: 'release/test' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof action.exec, 'function')
  })

  it('should add a label and a status if it does not have the "qa-required" label', function (done) {
    var addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: []
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'qa-required' ])
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options, { context: 'QA Check', description: 'has been QAed?', state: 'pending' })
              cb()
            }
          }

    action.exec(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should only add a status and not a label if it already has the "qa-required" label', function (done) {
    var addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: [ 'qa-required' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options, { context: 'QA Check', description: 'has been QAed?', state: 'pending' })
              cb()
            }
          }

    action.exec(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

})
