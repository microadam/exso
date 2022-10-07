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
          // Only listen to the `created` comment event
          if (ghAction !== 'created') {
            return cb(null, false)
          }
          var suffix = '@' + serviceLocator.authedUser.username + ' '
            , repoManager = serviceLocator.repoManager(comment.repoOwner, comment.repoName)
          // Ignore anything that isn't directly trying to communicate with the bot
          if (comment.body.indexOf(suffix) === -1) {
            return cb(null, false)
          }
          // Ignore anything that is the bot commenting with a comment that includes @itself
          if (comment.author === serviceLocator.authedUser.username) {
            return cb(null, false)
          }
          // If the comment contains a trigger phrase then we are good to go
          if (checkTriggerPhrase(comment.body)) {
            return cb(null, true)
          }
          // Otherwise, let the user know the command is unknown
          repoManager.getPull(comment.issueNumber, function (error, pr) {
            if (error) return cb(error)
            var unknownCommand = comment.body.replace(suffix, '')
            pr.addComment('@' + comment.author + ' Unknown command: `' + unknownCommand + '`', function (error) {
              if (error) return cb(error)
              cb(null, false)
            })
          })
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
