module.exports = createAction

var removeQaRequired = require('../lib/remove-qa-required')

function createAction (serviceLocator) {

  var action =
    { check: function (ghAction, prReview, cb) {
        var prReviewApproved = prReview && prReview.review && prReview.review.state === 'approved'
        if (ghAction === 'submitted' && prReviewApproved) {
          return cb(null, true)
        }
        cb(null, false)
      }
    , exec: function (prReview, cb) {
        var prRepoOwner = prReview.repository.owner.login
          , prRepoName = prReview.repository.name
          , prNumber = prReview['pull_request'].number

        removeQaRequired(serviceLocator, prRepoOwner, prRepoName, prNumber, cb)
      }
    }

  return action

}
