module.exports = bootstrap

var express = require('express')
  , createParser = require('github-webhook-handler')
  , createWebhookHandler = require('./lib/webhook-handler')
  , GhApi = require('github4')
  , gh = new GhApi({ version: '3.0.0' })
  , createRepoManager = require('./lib/repo-manager')

function bootstrap (serviceLocator, actions, cb) {
  var server = express()
    , repoManager = createRepoManager(serviceLocator)
    , webhookOptions =
        { path: '/github/webhook'
        , secret: serviceLocator.secrets.webhookSecret
        }
    , webhookParser = createParser(webhookOptions)
    , handleWebhook = createWebhookHandler(serviceLocator, actions)

  gh.authenticate({ type: 'oauth', token: serviceLocator.secrets.githubToken })
  server.use(webhookParser)

  webhookParser.on('*', handleWebhook)

  webhookParser.on('error', function (error) {
    serviceLocator.logger.error(error)
  })

  serviceLocator.register('server', server)
  serviceLocator.register('ghApi', gh)
  serviceLocator.register('repoManager', repoManager)

  cb(null, serviceLocator)
}
