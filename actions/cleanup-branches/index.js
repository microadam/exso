module.exports = cleanupBranches

function cleanupBranches (serviceLocator) {

  var pushAction =
    { check: function (ghAction, branch, cb) {
        if (branch.ref === 'refs/heads/master') {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (branch, cb) {
        serviceLocator.repoManager(branch.owner, branch.repo).cleanupBranches(cb)
      }
    }

  return {
    name: 'cleanup-branches'
  , actions:
    { push: pushAction
    }
  }

}
