module.exports = removeQaRequired

function removeQaRequired (serviceLocator, repoOwner, repoName, prNumber, cb) {
  var repoManager = serviceLocator.repoManager(repoOwner, repoName)
  repoManager.getPull(prNumber, function (error, pr) {
    if (error) return cb(error)
    var label = 'qa-required'
      , hasLabel = pr.labels.indexOf(label) > -1
      , options =
          { context: 'QA Check'
          , description: 'has been QAed?'
          , state: 'success'
          }
    if (!hasLabel) return cb()
    pr.addStatus(options, function (error) {
      if (error) return cb(error)
      pr.removeLabel(label, cb)
    })
  })
}
