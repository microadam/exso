module.exports = masterMergeRequired

var createPushAction = require('./actions/push')
  , createPrAction = require('./actions/pull-request')

function masterMergeRequired (serviceLocator) {

  return {
    name: 'master-merge-required'
  , actions:
    { 'push': createPushAction(serviceLocator)
    , 'pull_request': createPrAction(serviceLocator)
    }
  }

}
