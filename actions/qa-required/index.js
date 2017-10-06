module.exports = qaRequired

var createPrAction = require('./actions/pull-request')
  , createCommentAction = require('./actions/comment')
  , createPrReviewAction = require('./actions/pull-request-review')

function qaRequired (serviceLocator) {

  return {
    name: 'qa-required'
  , actions:
    { 'pull_request': createPrAction(serviceLocator)
    , 'pull_request_review': createPrReviewAction(serviceLocator)
    , 'issue_comment': createCommentAction(serviceLocator)
    }
  }

}
