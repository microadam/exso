module.exports = createAction

var triggerPhraseChecker = require('../lib/trigger-phrase-checker')
  , createAddToRelease = require('../lib/add-to-release')
  , createReadyForStaging = require('../lib/ready-for-staging')
  , createOnStaging = require('../lib/on-staging')
  , createReadyForProduction = require('../lib/ready-for-production')
  , createOnProduction = require('../lib/on-production')

function createAction (serviceLocator) {

  var fns =
        { addToRelease: createAddToRelease(serviceLocator)
        , readyForStaging: createReadyForStaging(serviceLocator)
        , onStaging: createOnStaging(serviceLocator)
        , readyForProduction: createReadyForProduction(serviceLocator)
        , onProduction: createOnProduction(serviceLocator)
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
              fn(pr, comment, actionToTake.value, actionToTake.skipStatusChecks, cb)
            } else {
              cb()
            }
          })
        }
    }

  return action

}
