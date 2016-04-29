module.exports = updateMasterMergeStatus

function updateMasterMergeStatus (pr, cb) {
  pr.isMergeable(function (error, mergeable) {
    if (error) return cb(error)
    var label = 'needs-master-merge'
      , hasNeedMergeLabel = pr.labels.indexOf(label) > -1
      , comment = null

    if (hasNeedMergeLabel && mergeable) {
      pr.removeLabel(label, function (error) {
        if (error) return cb(error)
        addStatus(true, cb)
      })
    } else if (!hasNeedMergeLabel && !mergeable) {
      comment = '@' + pr.author + ' PR needs to have `master` merged in'
      pr.addComment(comment, function (error) {
        if (error) return cb(error)
        pr.addLabels([ label ], function (error) {
          if (error) return cb(error)
          addStatus(false, cb)
        })
      })
    } else if (mergeable) {
      addStatus(true, cb)
    } else {
      addStatus(false, cb)
    }

    function addStatus (success, cb) {
      var options =
        { context: 'Outdated Check'
        , state: success ? 'success' : 'failure'
        , description: 'is master merge required?'
        }
      pr.addStatus(options, cb)
    }

  })
}
