module.exports = createPrepareForEnv

var async = require('async')
  , createNodeFilesCommiter = require('./make-node-commit')

function createPrepareForEnv (serviceLocator) {

  var makeNodeCommit = createNodeFilesCommiter(serviceLocator)

  function prepareForEnv (env, nextVersion, repoManager, pr, comment, cb) {
    var tasks = []
      , shaToTag = pr.headSha

    function updateNodeFiles (cb) {
      makeNodeCommit(nextVersion, pr, function (error, commitSha) {
        if (error && error.code === 404) {
          return cb()
        } else if (error) {
          return cb(error)
        }
        shaToTag = commitSha
        cb()
      })
    }

    function createTag (cb) {
      repoManager.createTag(nextVersion, shaToTag, cb)
    }

    function commentOnReleasePr (cb) {
      var commentToAdd = '@' + comment.author + ' This release has been prepared ' +
            'for ' + env + '. Tag `' + nextVersion + '` is ready to deploy.'
      pr.addComment(commentToAdd, cb)
    }

    function labelReleasePr (cb) {
      pr.addLabels([ 'ready-for-' + env ], cb)
    }

    tasks.push(updateNodeFiles)
    tasks.push(createTag)
    tasks.push(commentOnReleasePr)
    tasks.push(labelReleasePr)

    async.series(tasks, cb)

  }

  return prepareForEnv
}
