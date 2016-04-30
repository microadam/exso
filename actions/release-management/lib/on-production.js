module.exports = createOnProduction

var async = require('async')
  , determinePullsInRelease = require('./determine-pulls-in-release')

function createOnProduction (serviceLocator) {

  function onProduction (pr, comment, mergeToMaster, cb) {
    var commentToAdd = null
      , repoManager = null

    if (pr.labels.indexOf('ready-for-production') === -1) {
      commentToAdd = '@' + comment.author + ' This release has not been made ' +
        'ready for production. Ensure it has the `ready-for-production` label.'
      return pr.addComment(commentToAdd, cb)
    }

    repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
    repoManager.getOpenPulls(function (error, pulls) {
      if (error) return cb(error)
      var prsInRelease = determinePullsInRelease(pr)
        , tasks = []

      prsInRelease.push(pr.number)

      pulls.forEach(function (pull) {
        var hasOnProductionLabel = pull.labels.indexOf('on-production') > -1
          , hasReadyForProductionLabel = pull.labels.indexOf('ready-for-production') > -1
          , isInReleasePr = prsInRelease.indexOf(pull.number) > -1

        if (isInReleasePr && !hasOnProductionLabel) {
          tasks.push(pull.addLabels.bind(pull, [ 'on-production' ]))
        }

        if (isInReleasePr && hasReadyForProductionLabel) {
          tasks.push(pull.removeLabel.bind(pull, 'ready-for-production'))
        }
      })

      async.parallel(tasks, function (error) {
        if (error) return cb(error)
        var commentToAdd = 'Successfully marked as on production'
        pr.addComment(commentToAdd, cb)
      })
    })
  }

  return onProduction

}
