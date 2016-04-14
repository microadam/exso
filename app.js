var serviceLocator = require('service-locator')()
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'exso' })
  , secrets =
      { webhookSecret: process.env.WEBHOOK_SECRET
      , githubToken: process.env.GITHUB_TOKEN
      }
  , loadActions = require('./lib/action-loader')
  , bootstrap = require('./bootstrap')

serviceLocator.register('logger', logger)
serviceLocator.register('secrets', secrets)

loadActions(serviceLocator, function (error, actions) {
  if (error) throw error
  bootstrap(serviceLocator, actions, function (error, serviceLocator) {
    if (error) throw error
    serviceLocator.server.listen(3000, function () {
      serviceLocator.logger.info('Started: http://localhost:3000')
    })
  })
})
