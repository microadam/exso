module.exports = createAction

var updateMasterMergeStatus = require('../lib/update-master-merge-status')

function createAction () {

  var action =
    { check: function (ghAction, pr, cb) {
        var actions = [ 'opened', 'synchronize' ]
        if (actions.indexOf(ghAction) > -1) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: updateMasterMergeStatus
    }

  return action

}
