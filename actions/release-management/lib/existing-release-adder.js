module.exports = createExistingReleaseAdder

var createMergeIntoReleaseBranch = require('./merge-into-release-branch')
  , generateChangelog = require('./changelog-generator')()
  , applySemverLabel = require('./semver-labeler')()

function createExistingReleaseAdder(serviceLocator) {

  var mergeIntoReleaseBranch = createMergeIntoReleaseBranch(serviceLocator)

  function addToExistingRelease(releaseNumber, pr, comment, repoManager, cb) {
    repoManager.getPull(releaseNumber, function (error, releasePr) {
      if (error) return cb(error)
      repoManager.getBranch(releasePr.branch, function (error, releaseBranch) {
        if (error) return cb(error)
        mergeIntoReleaseBranch(releaseBranch, pr, comment, releasePr.number, function (error, success) {
          if (error || !success) return cb(error)

          var changelog = generateChangelog(releasePr.body, pr)
          releasePr.updateDescription(changelog, function (error) {
            if (error) return cb(error)
            var commentToAdd = '@' + comment.author + ' This PR has been successfully'
              + ' merged into Release #' + releasePr.number + '.'
            addSemverLabelAndComment(pr, releasePr, commentToAdd, cb)
          })
        })
      })
    })
  }

  function addSemverLabelAndComment(originalPr, releasePr, commentBody, cb) {
    applySemverLabel(releasePr, function (error) {
      if (error) return cb(error)
      originalPr.addComment(commentBody, cb)
    })
  }

  return addToExistingRelease

}
