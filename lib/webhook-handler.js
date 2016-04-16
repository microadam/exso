module.exports = createWebhookHandler

var async = require('async')
  , models =
    { 'pull_request': require('./models/pull-request')
    , 'push': require('./models/branch')
    , 'issue_comment': require('./models/comment')
    }

function createWebhookHandler(serviceLocator, plugins) {

  function handleWebhook(event) {
    var type = event.event
      , data = event.payload
      , ghAction = data.action

    serviceLocator.logger.info('Received: ' + type + ' - ' + ghAction)

    if (models[type]) {
      if (data[type]) data = data[type]
      data = new models[type](data, serviceLocator.ghApi)
    }

    async.each(plugins
    , function (plugin, eachCb) {
        var action = plugin.actions[type]

        if (!action) return eachCb()

        if (data.init) {
          data.init(checkAndExec)
        } else {
          checkAndExec(null, data)
        }

        function checkAndExec(error, data) {
          if (error) return eachCb(error)
          action.check(ghAction, data, function (error, shouldExec) {
            if (error) return eachCb(error)
            if (shouldExec) {
              serviceLocator.logger.info('Executing: ' + plugin.name)
              return action.exec(data, eachCb)
            }
            eachCb()
          })
        }
      }
    , function (error) {
        if (error) throw error
        serviceLocator.logger.info('All actions executed')
      }
    )
  }

  return handleWebhook
}
