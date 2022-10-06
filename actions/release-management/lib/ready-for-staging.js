module.exports = createReadyForStaging

var getTagsAndDetermineVersion = require('./get-tags-determine-version')
  , createPrepareForEnv = require('./prepare-for-env')

function createReadyForStaging (serviceLocator) {

  var prepareForEnv = createPrepareForEnv(serviceLocator)

  function readyForStaging (pr, comment, actionValue, skipStatusChecks, cb) {
    var helpComment
    // only run on release PRs
    if (pr.branch.indexOf('release/') === -1) {
      helpComment = '@' + comment.author + ' You are trying to release a ' +
        'feature branch, please switch to the release branch and rerun the command.'
      return pr.addComment(helpComment, cb)
    }
    // dont run if already prepared for staging
    if (pr.labels.indexOf('ready-for-staging') > -1) {
      helpComment = '@' + comment.author + ' This release is already prepared for staging.' +
        ' If the release failed and you are retrying, remove the `ready-for-staging` label ' +
        'and rerun the command.'
      return pr.addComment(helpComment, cb)
    }
    pr.getCurrentStatus(function (error, status) {
      if (error) return cb(error)
      var commentToAdd = null
        , repoManager = null

      if (!skipStatusChecks && status.state !== 'success') {
        commentToAdd = '@' + comment.author + ' Not all status checks are passing.' +
              ' Ensure they are before preparing for staging.'
        pr.addComment(commentToAdd, cb)
      } else {
        repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
        getTagsAndDetermineVersion('staging', repoManager, pr, function (error, nextVersion) {
          if (error) return cb(error)
          prepareForEnv('staging', nextVersion, repoManager, pr, comment, cb)
        })
      }
    })
  }

  return readyForStaging
}
