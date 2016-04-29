var assert = require('assert')
  , rewire = require('rewire')
  , createAction = rewire('../../actions/push')

describe('master-merge-required push action', function () {

  it('should pass check when branch ref is master', function (done) {
    createAction().check('', { ref: 'refs/heads/master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when branch check is not master', function (done) {
    createAction().check('', { ref: 'not-master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should have an exec function', function () {
    assert.equal(typeof createAction().exec, 'function')
  })

  it('should run "updateMasterMergeStatus" for each open PR', function (done) {

    var updateMasterMergeStatusCallCount = 0
      , reset = null
      , sl = null
      , action = null

    function mockUpdateMasterMergeStatus (pr, cb) {
      updateMasterMergeStatusCallCount++
      cb()
    }

    reset = createAction.__set__('updateMasterMergeStatus', mockUpdateMasterMergeStatus)
    sl =
        { repoManager: function () {
            function getOpenPulls (cb) {
              cb(null, [ {}, {} ])
            }
            return { getOpenPulls: getOpenPulls }
          }
        }
    action = createAction(sl)

    action.exec({}, function (error) {
      if (error) return done(error)
      assert.equal(updateMasterMergeStatusCallCount, 2)
      reset()
      done()
    })
  })

})
