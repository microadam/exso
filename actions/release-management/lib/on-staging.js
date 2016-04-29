module.exports = createOnStaging

var async = require('async')
  , determinePullsInRelease = require('./determine-pulls-in-release')

function createOnStaging (serviceLocator) {

  function onStaging (pr, comment, actionValue, cb) {
    var repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
    repoManager.getOpenPulls(function (error, pulls) {
      if (error) return cb(error)
      var prsInRelease = determinePullsInRelease(pr)
        , releasePrHasOnStagingPartialLabel = pr.labels.indexOf('on-staging--partial') > -1
        , releasePrHasReadyForStagingLabel = pr.labels.indexOf('ready-for-staging') > -1
        , releasePrFullyOnStaging = releasePrHasReadyForStagingLabel && !releasePrHasOnStagingPartialLabel
        , statusOptions = null
        , tasks = null

      prsInRelease.push(pr.number)

      pulls = pulls.filter(function (pull) {
        var hasOnStagingLabel = pull.labels.indexOf('on-staging') > -1
          , isInReleasePr = prsInRelease.indexOf(pull.number) > -1
        if (hasOnStagingLabel || isInReleasePr) return true
      })

      tasks = determineTasks(pulls, prsInRelease)

      if (releasePrFullyOnStaging) {
        statusOptions =
            { context: 'Been to Staging Check'
            , description: 'has this been to staging?'
            , state: 'success'
            }
        tasks.push(pr.addStatus.bind(pr, statusOptions))
      }

      async.parallel(tasks, function (error) {
        if (error) return cb(error)
        var commentToAdd = '@' + comment.author + ' Successfully marked as on staging'
        pr.addComment(commentToAdd, cb)
      })
    })
  }

  function determineTasks (pulls, prsInRelease) {
    var tasks = []
    pulls.forEach(function (pull) {
      var hasOnStagingLabel = pull.labels.indexOf('on-staging') > -1
        , hasOnStagingPartialLabel = pull.labels.indexOf('on-staging--partial') > -1
        , hasReadyForStagingLabel = pull.labels.indexOf('ready-for-staging') > -1
        , isInReleasePr = prsInRelease.indexOf(pull.number) > -1

      if (isInReleasePr && !hasOnStagingLabel) {
        tasks.push(addLabel.bind(null, 'on-staging', pull))
      } else if (!isInReleasePr && hasOnStagingLabel) {
        tasks.push(removeLabel.bind(null, 'on-staging', pull))
      }
      if (isInReleasePr && hasReadyForStagingLabel) {
        tasks.push(removeLabel.bind(null, 'ready-for-staging', pull))
      }
      if (isInReleasePr && hasReadyForStagingLabel && hasOnStagingPartialLabel) {
        tasks.push(removeLabel.bind(null, 'on-staging--partial', pull))
      }
    })
    return tasks
  }

  function addLabel (label, pull, cb) {
    pull.addLabels([ label ], cb)
  }

  function removeLabel (label, pull, cb) {
    pull.removeLabel(label, cb)
  }

  return onStaging

}
