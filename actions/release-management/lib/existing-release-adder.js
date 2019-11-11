module.exports = createExistingReleaseAdder

var async = require('async')
  , createMergeIntoReleaseBranch = require('./merge-into-release-branch')
  , generateDescription = require('./release-description-generator')()
  , applySemverLabel = require('./semver-labeler')()

function createExistingReleaseAdder (serviceLocator) {

  var mergeIntoReleaseBranch = createMergeIntoReleaseBranch(serviceLocator)

  function addToExistingRelease (releaseNumber, pr, comment, repoManager, cb) {
    repoManager.getPull(releaseNumber, function (error, releasePr) {
      if (error) return cb(error)
      repoManager.getBranch(releasePr.branch, function (error, releaseBranch) {
        if (error) return cb(error)
        mergeIntoReleaseBranch(releaseBranch, pr, comment, releasePr.number, function (error, success) {
          if (error || !success) return cb(error)

          var changelog = generateDescription(releasePr.body, pr)
          releasePr.body = changelog
          releasePr.updateDescription(changelog, function (error) {
            if (error) return cb(error)
            var commentToAdd = 'This PR has been successfully' +
                ' merged into Release #' + releasePr.number + '.'
            addLabelsAndComment(pr, releasePr, commentToAdd, cb)
          })
        })
      })
    })
  }

  function addLabelsAndComment (originalPr, releasePr, commentBody, cb) {
    var tasks = []
    if (releasePr.labels.indexOf('ready-for-staging') > -1) {
      tasks.push(releasePr.removeLabel.bind(releasePr, 'ready-for-staging'))
    }
    if (releasePr.labels.indexOf('ready-for-production') > -1) {
      tasks.push(releasePr.removeLabel.bind(releasePr, 'ready-for-production'))
    }
    if (releasePr.labels.indexOf('on-staging') > -1) {
      tasks.push(releasePr.addLabels.bind(releasePr, [ 'on-staging--partial' ]))
    }
    tasks.push(applySemverLabel.bind(null, releasePr))
    if (originalPr.labels.indexOf('add-to-next-release') > -1) {
      tasks.push(originalPr.removeLabel.bind(originalPr, 'add-to-next-release'))
    }

    async.parallel(tasks, function (error) {
      if (error) return cb(error)
      originalPr.addComment(commentBody, cb)
    })
  }

  return addToExistingRelease

}
