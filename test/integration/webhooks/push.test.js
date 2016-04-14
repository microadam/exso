var assert = require('assert')
  , request = require('supertest')
  , logger = require('mc-logger')
  , serviceLocator = require('service-locator')()
  , signWebhookData = require('../helpers/sign-webhook-data')
  , bootstrap = require('../../../bootstrap')
  , pushFixture = require('./fixtures/push.json')
  , Branch = require('../../../lib/models/branch')

describe('push', function () {

  before(function () {
    serviceLocator.register('secrets', { webhookSecret: 'test', githubToken: 'test' })
    serviceLocator.register('logger', logger)
  })

  it('should execute a push action a generate a branch object', function (done) {

    var execCalled = false
      , action =
          { name: 'test'
          , actions:
            { push:
              { check: function (ghAction, branch, cb) {
                  cb(null, true)
                }
              , exec: function (branch, cb) {
                  execCalled = true
                  assert.equal(branch instanceof Branch, true, 'is not a branch')
                  assert.equal(branch.ref, 'refs/heads/master')
                  assert.equal(branch.owner, 'microadam')
                  assert.equal(branch.repo, 'exso-test')
                  cb()
                }
              }
            }
          }

    bootstrap(serviceLocator, [ action ], function (error, serviceLocator) {
      if (error) return done(error)

      var fixture = pushFixture
      request(serviceLocator.server)
        .post('/github/webhook')
        .set('content-type', 'application/json')
        .set('X-GitHub-Delivery', '1')
        .set('X-Hub-Signature', signWebhookData(serviceLocator.secrets.webhookSecret, fixture))
        .set('X-GitHub-Event', 'push')
        .send(fixture)
        .expect(200)
        .end(function (error) {
          if (error) return done(error)
          assert.equal(execCalled, true, 'exec was not called')
          done()
        })
    })

  })

})
