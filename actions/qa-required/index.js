module.exports = qaRequired

var createPrAction = require('./actions/pull-request')
  , createCommentAction = require('./actions/comment')

function qaRequired (serviceLocator) {

  return {
    name: 'qa-required'
  , actions:
    { 'pull_request': createPrAction(serviceLocator)
    , 'issue_comment': createCommentAction(serviceLocator)
    }
  }

}
