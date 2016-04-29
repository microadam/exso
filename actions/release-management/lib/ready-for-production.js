module.exports = createReadyForProduction

var findWhere = require('lodash.findwhere')
  , createChangelogGenerator = require('./changelog-generator')
  , getTagsAndDetermineVersion = require('./get-tags-determine-version')
  , createPrepareForEnv = require('./prepare-for-env')

function createReadyForProduction (serviceLocator) {

  var prepareForEnv = createPrepareForEnv(serviceLocator)
    , generateAndCommitChangelog = createChangelogGenerator(serviceLocator)

  function readyForProduction (pr, comment, actionValue, cb) {
    // only run on release PRs
    if (pr.branch.indexOf('release/') === -1) return cb()
    // dont run if already prepared for production
    if (pr.labels.indexOf('ready-for-production') > -1) return cb()
    pr.getCurrentStatus(function (error, status) {
      if (error) return cb(error)
      var commentToAdd = null
        , repoManager = null
        , hasBeenToStaging = findWhere(status.statuses, { context: 'Been to Staging Check' })

      if (status.state !== 'success' || !hasBeenToStaging) {
        commentToAdd = '@' + comment.author + ' Please ensure all status checks' +
          ' are passing and that this release has previously been on staging' +
          ' before preparing for production.'
        pr.addComment(commentToAdd, cb)
      } else {
        repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
        getTagsAndDetermineVersion('production', repoManager, pr, function (error, nextVersion) {
          if (error) return cb(error)
          generateAndCommitChangelog(pr, nextVersion, function (error, commitSha) {
            if (error) return cb(error)
            pr.headSha = commitSha
            prepareForEnv('production', nextVersion, repoManager, pr, comment, cb)
          })
        })
      }
    })
  }

  return readyForProduction
}
