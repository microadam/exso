var serviceLocator = require('service-locator')()
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'exso' })
  , secrets =
      { webhookSecret: process.env.WEBHOOK_SECRET || 'adamjd'
      , githubToken: process.env.GITHUB_TOKEN || '99006d77d102e79072cdec0d187ce00679f1b5b3'
      }
  , loadActions = require('./lib/action-loader')
  , bootstrap = require('./bootstrap')

serviceLocator.register('logger', logger)
serviceLocator.register('secrets', secrets)

loadActions(serviceLocator, function (error, actions) {
  if (error) throw error
  bootstrap(serviceLocator, actions, function (error, serviceLocator) {
    if (error) throw error
    serviceLocator.ghApi.users.get({}, function (error, user) {
      if (error) throw error
      serviceLocator.register('authedUser', { username: user.login })
      serviceLocator.server.listen(3000, function () {
        serviceLocator.logger.info('Started: http://localhost:3000')
      })
    })
  })
})
