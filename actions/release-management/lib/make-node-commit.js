module.exports = createNodeCommiter

var async = require('async')

function createNodeCommiter (serviceLocator) {

  function makeNodeCommit (version, pr, cb) {

    var repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
      , tasks =
          { packageJson: repoManager.getFileContents.bind(repoManager, 'package.json', pr.branch)
          , shrinkwrap: function (cb) {
              repoManager.getFileContents('npm-shrinkwrap.json', pr.branch, function (error, contents) {
                if (error && error.code === 404) {
                  return cb()
                }
                cb(error, contents)
              })
            }
          }

    async.series(tasks, function (error, results) {
      if (error) return cb(error)
      if (results.packageJson) results.packageJson = updateVersionInFile(results.packageJson, version)
      if (results.shrinkwrap) results.shrinkwrap = updateVersionInFile(results.shrinkwrap, version)
      if (!results.packageJson && !results.shrinkwrap) return cb()
      updateFiles(results, version, pr, repoManager, cb)
    })
  }

  function updateVersionInFile (contents, version) {
    if (contents && Array.isArray(contents)) contents = contents[0]
    if (contents) {
      contents = JSON.parse(contents)
      contents.version = version.replace('v', '')
      contents = JSON.stringify(contents, null, 2) + '\n'
    }
    return contents
  }

  function updateFiles (results, version, pr, repoManager, cb) {
    var options =
            { files: []
            , commitMessage: version + ' [ci skip]'
            , baseSha: pr.headSha
            , branch: pr.branch
            }

    if (results.packageJson) {
      options.files.push({ path: 'package.json', content: results.packageJson })
    }
    if (results.shrinkwrap) {
      options.files.push({ path: 'npm-shrinkwrap.json', content: results.shrinkwrap })
    }

    repoManager.updateFiles(options, cb)
  }

  return makeNodeCommit
}
