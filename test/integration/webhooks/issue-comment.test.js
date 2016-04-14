var assert = require('assert')
  , request = require('supertest')
  , logger = require('mc-logger')
  , serviceLocator = require('service-locator')()
  , signWebhookData = require('../helpers/sign-webhook-data')
  , bootstrap = require('../../../bootstrap')
  , commentFixture = require('./fixtures/comment.json')
  , Comment = require('../../../lib/models/comment')

describe('issue comment', function () {

  before(function () {
    serviceLocator.register('secrets', { webhookSecret: 'test', githubToken: 'test' })
    serviceLocator.register('logger', logger)
  })

  it('should execute an issue comment action a generate a comment object', function (done) {

    var execCalled = false
      , action =
          { name: 'test'
          , actions:
            { 'issue_comment':
              { check: function (ghAction, comment, cb) {
                  cb(null, true)
                }
              , exec: function (comment, cb) {
                  execCalled = true
                  assert.equal(comment instanceof Comment, true, 'is not a comment')
                  assert.equal(comment.body, 'this is a body')
                  assert.equal(comment.author, 'microadam')
                  assert.equal(comment.issueAuthor, 'dave')
                  assert.equal(comment.issueNumber, 22)
                  assert.equal(comment.repoOwner, 'owner-name')
                  assert.equal(comment.repoName, 'repo-name')
                  cb()
                }
              }
            }
          }

    bootstrap(serviceLocator, [ action ], function (error, serviceLocator) {
      if (error) return done(error)

      var fixture = commentFixture
      request(serviceLocator.server)
        .post('/github/webhook')
        .set('content-type', 'application/json')
        .set('X-GitHub-Delivery', '1')
        .set('X-Hub-Signature', signWebhookData(serviceLocator.secrets.webhookSecret, fixture))
        .set('X-GitHub-Event', 'issue_comment')
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
