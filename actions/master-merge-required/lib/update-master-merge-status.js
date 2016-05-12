module.exports = updateMasterMergeStatus

var Branch = require('../../../lib/models/branch')

function updateMasterMergeStatus (pr, cb) {
  var data =
        { ref: pr.branch
        , after: pr.headSha
        , repository:
          { name: pr.repo
          , owner: { name: pr.owner }
          }
        }
    , branch = new Branch(data, pr.ghApi)
    , merged = true

  branch.merge('master', function (error, mergeOccured) {
    /*eslint complexity: [2, 8]*/
    if (error && error.code === 409) {
      merged = false
    } else if (error) {
      return cb(error)
    }

    var label = 'needs-master-merge'
      , hasNeedMergeLabel = pr.labels.indexOf(label) > -1
      , comment = null
      , author = pr.assignee ? pr.assignee : pr.author

    if (hasNeedMergeLabel && merged) {
      pr.removeLabel(label, function (error) {
        if (error) return cb(error)
        addStatus(true, cb)
      })
    } else if (!hasNeedMergeLabel && !merged) {
      comment = '@' + author + ' PR needs to have `master` merged in'
      pr.addComment(comment, function (error) {
        if (error) return cb(error)
        pr.addLabels([ label ], function (error) {
          if (error) return cb(error)
          addStatus(false, cb)
        })
      })
    } else if (merged && mergeOccured) {
      comment = '@' + author + ' this PR has automatically had `master` merged in'
      pr.addComment(comment, function (error) {
        if (error) return cb(error)
        addStatus(true, cb)
      })
    } else if (merged) {
      addStatus(true, cb)
    } else {
      addStatus(false, cb)
    }
  })

  function addStatus (success, cb) {
    var options =
          { context: 'Outdated Check'
          , state: success ? 'success' : 'failure'
          , description: 'is master merge required?'
          }
    pr.addStatus(options, cb)
  }
}
