module.exports = getTagsAndDetermineVersion

var pluck = require('lodash.pluck')
  , determineNextVersion = require('./next-version-determiner')

function getTagsAndDetermineVersion (env, repoManager, pr, cb) {
  repoManager.getTags(function (error, tags) {
    if (error) return cb(error)
    tags = pluck(tags, 'name')

    var semverType =
        pr.labels.filter(function (l) { return l.indexOf('semver/') === 0 })[0].split('/')[1]
    , semverTypePrefix = env === 'staging' ? 'pre' : ''
    , nextVersion = determineNextVersion(tags, semverTypePrefix + semverType)

    cb(null, nextVersion)
  })
}
