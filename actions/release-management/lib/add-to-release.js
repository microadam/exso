module.exports = createAddToRelease

var createReleaseCreator = require('./release-creator')
  , createExistingReleaseAdder = require('./existing-release-adder')

function createAddToRelease (serviceLocator) {

  var createNewRelease = createReleaseCreator(serviceLocator)
    , addToExistingRelease = createExistingReleaseAdder(serviceLocator)

  function addToRelease (pr, comment, releaseNameNumber, cb) {
    // don't run on release PRs
    if (pr.branch.indexOf('release/') === 0) return cb()
    pr.getCurrentStatus(function (error, status) {
      if (error) return cb(error)
      var commentToAdd = null
        , repoManager = null

      if (status.state !== 'success') {
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
