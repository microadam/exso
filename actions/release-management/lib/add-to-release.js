module.exports = createAddToRelease

var randomWord = require('random-words')
  , generateChangelog = require('../lib/changelog-generator')()
  , applySemverLabel = require('./semver-labeler')()

function createAddToRelease(serviceLocator) {

  function addToRelease(pr, comment, releaseNameNumber, cb) {
    // don't run on release PRs
    if (pr.branch.indexOf('release/') === '0') return cb()
    pr.getCurrentStatus(function (error, status) {
      if (error) return cb(error)
      if (status.state !== 'success') {
        var commentToAdd = '@' + comment.author + ' Not all status checks are passing.'
          + ' Ensure they are before adding to a release.'
        pr.addComment(commentToAdd, cb)
      } else {
        var repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
        if (!releaseNameNumber || typeof releaseNameNumber === 'string') {
          createNewRelease(releaseNameNumber, pr, comment, repoManager, cb)
        } else {
          addToExistingRelease(releaseNameNumber, pr, comment, repoManager, cb)
        }
      }
    })
  }

  function createNewRelease(releaseNameNumber, pr, comment, repoManager, cb) {
    var releaseName = releaseNameNumber ? releaseNameNumber : randomWord() + '-' + randomWord()
      , branchName = 'release/' + releaseName

    repoManager.createBranch(branchName, pr.headSha, function (error, releaseBranch) {
      if (error) return cb(error)
      mergeIntoReleaseBranch(releaseBranch, pr, comment, null, function (error, success) {
        if (error || !success) return cb(error)

        var title = 'Release: ' + releaseName
          , body = generateChangelog('', pr)

        repoManager.createPull(title, body, branchName, function (error, releasePr) {
          if (error) return cb(error)
          var commentToAdd = '@' + comment.author + ' Release #' + releasePr.number + ' `'
            + releaseName + '` created with this PR successfully merged.'
          addSemverLabelAndComment(pr, releasePr, commentToAdd, cb)
        })
      })
    })
  }

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

  function mergeIntoReleaseBranch(releaseBranch, originalPr, comment, releasePrNumber, cb) {
    releaseBranch.merge(originalPr.branch, function (error) {
      if (error && error.code === 409) {
        var commentToAdd = '@' + comment.author + ' Conflicts were encountered when '
          + 'merging into the release. Please get a developer to manually merge. '
          + 'Once complete, comment with `@' + serviceLocator.authedUser.username
          + ' merged into release #' + releasePrNumber + '`'
        originalPr.addComment(commentToAdd, function (error) {
          if (error) return cb(error)
          cb()
        })
      } else if (error) {
        return cb(error)
      } else {
        cb(null, true)
      }
    })
  }

  function addSemverLabelAndComment(originalPr, releasePr, commentBody, cb) {
    applySemverLabel(releasePr, function (error) {
      if (error) return cb(error)
      originalPr.addComment(commentBody, cb)
    })
  }

  return addToRelease

}
