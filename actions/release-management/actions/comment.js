module.exports = createAction

var triggerPhraseChecker = require('../lib/trigger-phrase-checker')
  , createAddToRelease = require('../lib/add-to-release')

function createAction(serviceLocator) {

  var fns =
        { addToRelease: createAddToRelease(serviceLocator)
        // , removeFromRelease: removeFromRelease
        }
    , checkTriggerPhrase = triggerPhraseChecker(serviceLocator)
    , action =
      { check: function (ghAction, comment, cb) {
          if (ghAction === 'created' && checkTriggerPhrase(comment.body)) {
            return cb(null, true)
          }
          cb(null, false)
        }
      , exec: function (comment, cb) {
          var repoManager = serviceLocator.repoManager(comment.repoOwner, comment.repoName)
          repoManager.getPull(comment.issueNumber, function (error, pr) {
            if (error) return cb(error)
            var actionToTake = checkTriggerPhrase(comment.body)
              , fn = fns[actionToTake.name]

            if (fn) {
              fn(pr, comment, actionToTake.value, cb)
            } else {
              cb()
            }
          })
        }
    }

  return action

}
