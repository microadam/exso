module.exports = createChangelogGenerator

var parseFixesAndFeatures = require('./fixes-and-features-parser')

function createChangelogGenerator (serviceLocator) {

  function generateAndCommitChangelog (pr, version, cb) {
    var changeLog = buildChangelog(pr.body, version)
      , repoManager = serviceLocator.repoManager(pr.owner, pr.repo)
      , path = 'changelog.md'
      , commitMessage = 'Update Changelog ' + serviceLocator.config.ciSkipFlag

    repoManager.getFileContents(path, pr.branch, function (error, currentChangelog, blobSha) {
      if (error && error.code === 404) {
        return repoManager.createFile(path, changeLog, commitMessage, pr.branch, cb)
      } else if (error) {
        return cb(error)
      }
      changeLog = changeLog + currentChangelog
      repoManager.updateFile(path, changeLog, commitMessage, pr.branch, blobSha, cb)
    })
  }

  function buildChangelog (body, version) {
    var now = new Date()
      , changelog = version + ' / ' + now.toString() + '\n====================================\n'
      , data = parseFixesAndFeatures(body)

    data = data.fixes.concat(data.features)

    data.forEach(function (item) {
      var parts = item.split('`')
      changelog = changelog + '- ' + parts[1] + '\n'
    })

    changelog = changelog + '\n'

    return changelog
  }

  return generateAndCommitChangelog
}
