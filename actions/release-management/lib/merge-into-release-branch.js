module.exports = createReleaseBranchMerger

function createReleaseBranchMerger (serviceLocator) {

  function mergeIntoReleaseBranch (releaseBranch, originalPr, comment, releasePrNumber, cb) {
    releaseBranch.merge(originalPr.branch, function (error) {
      if (error && error.code === 409) {
        var commentToAdd = '@' + comment.author + ' Conflicts were encountered when ' +
              'merging into the release. Please get a developer to manually merge. ' +
              'Once complete, comment with `@' + serviceLocator.authedUser.username +
              ' merged into release #' + releasePrNumber + '`'
        originalPr.addComment(commentToAdd, function (error) {
          if (error) return cb(error)
          cb(null, false)
        })
      } else if (error) {
        return cb(error)
      } else {
        cb(null, true)
      }
    })
  }

  return mergeIntoReleaseBranch
}
