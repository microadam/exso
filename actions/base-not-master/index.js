module.exports = baseNotMaster

var async = require('async')

function baseNotMaster() {

  var prAction =
    { check: function (ghAction, pr, cb) {
        if (ghAction === 'opened' && pr.baseRef !== 'master') {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (pr, cb) {
        var tasks =
            [ addComment.bind(null, pr)
            , pr.close.bind(pr)
            ]
        async.series(tasks, cb)
      }
    }

  function addComment(pr, cb) {
    var comment = '@' + pr.author + ' All PRs should be based off of `master`.'
      + ' Please open a new PR with `master` as the base. Closing.'
    pr.addComment(comment, cb)
  }

  return {
    name: 'base-not-master'
  , actions:
    { 'pull_request': prAction
    }
  }

}
