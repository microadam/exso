module.exports = createAction

var removeQaRequired = require('../lib/remove-qa-required')

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, comment, cb) {
        var containsThumbsUp = comment.body.indexOf('👍') > -1 || comment.body.indexOf(':+1:') > -1
          , authorIsNotQaer = comment.author !== comment.issueAuthor
          , qaerWhiteListed = serviceLocator.config.qaWhitelist.indexOf(comment.author) > -1

        if (ghAction === 'created' && containsThumbsUp && (authorIsNotQaer || qaerWhiteListed)) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (comment, cb) {
        removeQaRequired(serviceLocator, comment.repoOwner, comment.repoName, comment.issueNumber, cb)
      }
    }

  return action

}
