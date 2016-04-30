var serviceLocator = require('service-locator')()
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'exso' })
  , secrets =
      { webhookSecret: process.env.WEBHOOK_SECRET
      , githubToken: process.env.GITHUB_TOKEN
      }
  , url = process.env.URL
  , loadActions = require('./lib/action-loader')
  , bootstrap = require('./bootstrap')
  , createHealthRoute = require('./routes/health')
  , createSetupRoute = require('./routes/setup')

serviceLocator.register('logger', logger)
serviceLocator.register('secrets', secrets)
serviceLocator.register('config', { url: url })

loadActions(serviceLocator, function (error, actions) {
  if (error) throw error
  bootstrap(serviceLocator, actions, function (error, serviceLocator) {
    if (error) throw error

    createHealthRoute(serviceLocator)
    createSetupRoute(serviceLocator)

    serviceLocator.ghApi.users.get({}, function (error, user) {
      if (error) throw error
      serviceLocator.register('authedUser', { username: user.login })
      serviceLocator.server.listen(3000, function () {
        serviceLocator.logger.info('Started: http://localhost:3000')
      })
    })
  })
})
