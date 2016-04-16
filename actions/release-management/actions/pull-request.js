module.exports = createAction

function createAction() {

  var action =
    { check: function (ghAction, pr, cb) {
        var isReleasePr = pr.branch.indexOf('release/') === 0

        if (ghAction === 'opened' && isReleasePr) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (pr, cb) {
        pr.addLabels([ 'release' ], cb)
      }
    }

  return action

}
