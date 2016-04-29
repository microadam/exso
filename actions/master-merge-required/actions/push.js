module.exports = createAction

var async = require('async')
  , updateMasterMergeStatus = require('../lib/update-master-merge-status')

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, branch, cb) {
        if (branch.ref === 'refs/heads/master') {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (branch, cb) {
        var repoManager = serviceLocator.repoManager(branch.owner, branch.repo)
        repoManager.getOpenPulls(function (error, prs) {
          if (error) return cb(error)
          async.each(prs, updateMasterMergeStatus, cb)
        })
      }
    }

  return action

}
