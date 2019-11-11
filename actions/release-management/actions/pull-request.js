module.exports = createAction

var async = require('async')
  , createAddToRelease = require('../lib/add-to-release')

function createAction (serviceLocator) {
  var addToRelease = createAddToRelease(serviceLocator)
    , action =
        { check: function (ghAction, pr, cb) {
            var isReleasePr = pr.branch.indexOf('release/') === 0

            if (ghAction === 'opened' && isReleasePr) {
              return cb(null, true)
            }
            cb(null, false)
          }
        , exec: function (pr, cb) {
            pr.addLabels([ 'release' ], function (error) {
              if (error) return cb(error)
              var repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
              repoManager.getOpenPulls(function (error, prs) {
                if (error) return cb(error)
                var comment = { author: pr.assignee }
                  , pullsToAddToRelease = prs.filter(function (pr) {
                      return pr.labels.indexOf('add-to-any-release') > -1 || pr.labels.indexOf('add-to-next-release') > -1
                    })

                async.eachSeries(pullsToAddToRelease
                , function (prToAdd, cb) {
                    addToRelease(prToAdd, comment, pr.number, cb)
                  }
                , cb
                )
              })
            })
          }
        }

  return action

}
