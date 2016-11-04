module.exports = createAction

var label = 'qa-required'

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, pr, cb) {
        var actions = [ 'opened', 'synchronize' ]
          , isReleasePr = pr.branch.indexOf('release/') === 0
          , repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
          , hasLabel = pr.labels.indexOf(label) > -1
          , headCommitAuthorIsNotBot = null
          , isMasterMergeCommit = null
          , qaRequiredAfterMasterMerge = null
          , botCommitRequiresQa = null

        repoManager.getCommit(pr.headSha, function (error, data) {
          if (error) return cb(error)
          headCommitAuthorIsNotBot = data.author.name !== serviceLocator.authedUser.username
          isMasterMergeCommit = !headCommitAuthorIsNotBot && data.message.indexOf('Merge master into') === 0
          qaRequiredAfterMasterMerge = isMasterMergeCommit && hasLabel
          botCommitRequiresQa = headCommitAuthorIsNotBot || qaRequiredAfterMasterMerge

          if (actions.indexOf(ghAction) > -1 && !isReleasePr && botCommitRequiresQa) {
            return cb(null, true)
          }
          cb(null, false)
        })
      }
    , exec: function (pr, cb) {
        var hasLabel = pr.labels.indexOf(label) > -1
          , options =
              { context: 'QA Check'
              , description: 'has been QAed?'
              , state: 'pending'
              }
        pr.addStatus(options, function (error) {
          if (error) return cb(error)
          if (hasLabel) return cb()
          pr.addLabels([ label ], cb)
        })
      }
    }

  return action

}
