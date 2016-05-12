module.exports = createAction

var updateMasterMergeStatus = require('../lib/update-master-merge-status')

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, pr, cb) {
        var repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
          , headCommitAuthorIsNotBot = null

        repoManager.getCommit(pr.headSha, function (error, data) {
          if (error) return cb(error)
          headCommitAuthorIsNotBot = data.author.name !== serviceLocator.authedUser.username

          if (ghAction === 'opened' || (ghAction === 'synchronize' && headCommitAuthorIsNotBot)) {
            return cb(null, true)
          }
          cb(null, false)
        })
      }
    , exec: updateMasterMergeStatus
    }

  return action

}
