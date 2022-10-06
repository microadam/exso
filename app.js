var serviceLocator = require('service-locator')()
  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({ name: 'exso' })
  , secrets =
      { webhookSecret: process.env.WEBHOOK_SECRET
      , githubToken: process.env.GITHUB_TOKEN
      }
  , url = process.env.URL
  , port = process.env.PORT || 3000
  , qaWhitelist = (process.env.QA_WHITELIST || '').split(',')
  , loadActions = require('./lib/action-loader')
  , bootstrap = require('./bootstrap')
  , createHealthRoute = require('./routes/health')
  , createSetupRoute = require('./routes/setup')

serviceLocator.register('logger', logger)
serviceLocator.register('secrets', secrets)
serviceLocator.register('config', { url: url, qaWhitelist: qaWhitelist })

loadActions(serviceLocator, function (error, actions) {
  if (error) throw error
  bootstrap(serviceLocator, actions, function (error, serviceLocator) {
    if (error) throw error

    createHealthRoute(serviceLocator)
    createSetupRoute(serviceLocator)

    serviceLocator.ghApi.users.get({}, function (error, user) {
      if (error) throw error
      serviceLocator.logger.info('Token authed as ' + user.login)
      serviceLocator.register('authedUser', { username: user.login })
      serviceLocator.server.listen(port, function () {
        serviceLocator.logger.info('Started: ' + url + ':' + port)
      })
    })
  })
})
