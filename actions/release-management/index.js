module.exports = releaseManagement

var createCommentAction = require('./actions/comment')
  , createPullRequestAction = require('./actions/pull-request')

function releaseManagement(serviceLocator) {

  return {
    name: 'release-management'
  , actions:
    { 'issue_comment': createCommentAction(serviceLocator)
    , 'pull_request': createPullRequestAction(serviceLocator)
    }
  }

}
