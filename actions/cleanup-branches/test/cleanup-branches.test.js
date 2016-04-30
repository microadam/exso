var assert = require('assert')
  , cleanupBranchesAction = require('../index')

describe('cleanup-branches', function () {

  it('should have a name property', function () {
    assert.equal(cleanupBranchesAction().name, 'cleanup-branches')
  })

  it('should only handle webhooks of type "push"', function () {
    var actionNames = Object.keys(cleanupBranchesAction().actions)
    assert.equal(actionNames.length, 1)
    assert.equal(actionNames[0], 'push')
  })

  it('should pass check when branch ref is master', function (done) {
    cleanupBranchesAction().actions['push'].check('', { ref: 'refs/heads/master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, true, 'shouldExec should be true')
      done()
    })
  })

  it('should not pass check when branch check is not master', function (done) {
    cleanupBranchesAction().actions['push'].check('', { ref: 'not-master' }, function (error, shouldExec) {
      if (error) return done(error)
      assert.equal(shouldExec, false, 'shouldExec should be false')
      done()
    })
  })

  it('should run exec function', function (done) {
    var repoManagerCalled = false
      , cleanupBranchesCalled = false
      , sl =
          { repoManager: function (owner, repo) {
              repoManagerCalled = true
              assert.equal(owner, 'owner')
              assert.equal(repo, 'repo')
              function cleanupBranches (cb) {
                cleanupBranchesCalled = true
                cb()
              }
              return { cleanupBranches: cleanupBranches }
            }
          }
      , pushAction = cleanupBranchesAction(sl).actions['push']
      , branch =
          { owner: 'owner'
          , repo: 'repo'
          }
    pushAction.exec(branch, function (error) {
      if (error) return done(error)
      assert.equal(repoManagerCalled, true, 'repo manager should have been called')
      assert.equal(cleanupBranchesCalled, true, 'cleanupBranches should have been called')
      done()
    })
  })

})
