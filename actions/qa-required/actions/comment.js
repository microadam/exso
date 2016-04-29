module.exports = createAction

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, comment, cb) {
        var containsThumbsUp = comment.body.indexOf('👍') > -1
          , authorIsNotQaer = comment.author !== comment.issueAuthor

        if (ghAction === 'created' && containsThumbsUp && authorIsNotQaer) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (comment, cb) {
        var repoManager = serviceLocator.repoManager(comment.repoOwner, comment.repoName)
        repoManager.getPull(comment.issueNumber, function (error, pr) {
          if (error) return cb(error)
          var label = 'qa-required'
            , hasLabel = pr.labels.indexOf(label) > -1
            , options =
                { context: 'QA Check'
                , description: 'has been QAed?'
                , state: 'success'
                }
          if (!hasLabel) return cb()
          pr.addStatus(options, function (error) {
            if (error) return cb(error)
            pr.removeLabel(label, cb)
          })
        })
      }
    }

  return action

}
