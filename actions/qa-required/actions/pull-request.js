module.exports = createAction

function createAction () {

  var action =
    { check: function (ghAction, pr, cb) {
        var actions = [ 'opened', 'synchronize' ]
          , isReleasePr = pr.branch.indexOf('release/') === 0

        if (actions.indexOf(ghAction) > -1 && !isReleasePr) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (pr, cb) {
        var label = 'qa-required'
          , hasLabel = pr.labels.indexOf(label) > -1
          , options =
              { context: 'QA Check'
              , description: 'has been QAed?'
              , state: 'pending'
              }
        pr.addStatus(options, function (error) {
          if (error) return cb(error)
          if (hasLabel) return cb()
          pr.addLabels([ label ], cb)
        })
      }
    }

  return action

}
