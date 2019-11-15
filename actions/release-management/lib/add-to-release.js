module.exports = createAddToRelease

var createReleaseCreator = require('./release-creator')
  , createExistingReleaseAdder = require('./existing-release-adder')

function createAddToRelease (serviceLocator) {

  var createNewRelease = createReleaseCreator(serviceLocator)
    , addToExistingRelease = createExistingReleaseAdder(serviceLocator)

  function addToRelease (pr, comment, releaseNameNumber, skipStatusChecks, cb) {
    // don't run on release PRs
    if (pr.branch.indexOf('release/') === 0) return cb()
    if (pr.baseRef !== 'master') {
      var commentToAdd = '@' + comment.author + ' Only Pull Requests based off of `master` ' +
        'can be merged into to a release. Please merge this Pull Request and then add the base branch to the release.'
      return pr.addComment(commentToAdd, cb)
    }
    pr.getCurrentStatus(function (error, status) {
      if (error) return cb(error)
      var commentToAdd = null
        , repoManager = null

      if (!skipStatusChecks && status.state !== 'success' && status.statuses.length > 0) {
        commentToAdd = '@' + comment.author + ' Not all status checks are passing.' +
           ' Ensure they are before adding to a release.'
        pr.addComment(commentToAdd, cb)
      } else {
        repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
        if (!releaseNameNumber || typeof releaseNameNumber === 'string') {
          createNewRelease(releaseNameNumber, pr, comment, repoManager, cb)
        } else {
          addToExistingRelease(releaseNameNumber, pr, comment, repoManager, cb)
        }
      }
    })
  }

  return addToRelease

}
