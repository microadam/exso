var assert = require('assert')
  , nock = require('nock')
  , request = require('supertest')
  , logger = require('mc-logger')
  , createServiceLocator = require('service-locator')
  , signWebhookData = require('../helpers/sign-webhook-data')
  , bootstrap = require('../../../bootstrap')
  , pushFixture = require('./fixtures/push.json')
  , Branch = require('../../../lib/models/branch')
  , serviceLocator = null

describe('push', function () {

  beforeEach(function () {
    serviceLocator = createServiceLocator()
    serviceLocator.register('secrets', { webhookSecret: 'test', githubToken: 'test' })
    serviceLocator.register('logger', logger)
  })

  function runTest(serviceLocator, action, cb) {
    bootstrap(serviceLocator, [ action ], function (error, serviceLocator) {
      if (error) return cb(error)

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
          if (error) return cb(error)
        })
    })
  }

  it('should execute a push action and generate a branch object', function (done) {

    var action =
          { name: 'test'
          , actions:
            { push:
              { check: function (ghAction, branch, cb) {
                  cb(null, true)
                }
              , exec: function (branch) {
                  assert.equal(branch instanceof Branch, true, 'is not a branch')
                  assert.equal(branch.ref, 'refs/heads/master')
                  assert.equal(branch.headSha, '672a45cd181d0157d5e5c63589e31d77ecbb0d78')
                  assert.equal(branch.owner, 'microadam')
                  assert.equal(branch.repo, 'exso-test')
                  done()
                }
              }
            }
          }

    runTest(serviceLocator, action, done)
  })

  it('should execute a branch merge', function (done) {

    var action =
          { name: 'test'
          , actions:
            { push:
              { check: function (ghAction, branch, cb) {
                  cb(null, true)
                }
              , exec: function (branch) {
                  assert.equal(branch instanceof Branch, true, 'is not a branch')
                  branch.merge('feature/test', done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .post('/repos/microadam/exso-test/merges?access_token=' + serviceLocator.secrets.githubToken
      , { base: 'master'
        , head: 'feature/test'
        })
      .reply(200)

    runTest(serviceLocator, action, done)
  })

})
