var assert = require('assert')
  , action = require('../../actions/pull-request')()

describe('master-merge-required pull request action', function () {

  it('should pass check when github action is "opened"', function (done) {
    action.check('opened', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should pass check when github action is "synchronize"', function (done) {
    action.check('synchronize', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when github action is not "opened" or "synchronize"', function (done) {
    action.check('closed', {}, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof action.exec, 'function')
  })

})
