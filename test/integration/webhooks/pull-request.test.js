var assert = require('assert')
  , request = require('supertest')
  , nock = require('nock')
  , logger = require('mc-logger')
  , createServiceLocator = require('service-locator')
  , signWebhookData = require('../helpers/sign-webhook-data')
  , bootstrap = require('../../../bootstrap')
  , prFixture = require('./fixtures/pull-request.json')
  , PullRequest = require('../../../lib/models/pull-request')
  , serviceLocator = null

describe('pull request', function () {

  beforeEach(function () {
    serviceLocator = createServiceLocator()
    serviceLocator.register('secrets', { webhookSecret: 'test', githubToken: 'test' })
    serviceLocator.register('logger', logger)
  })

  function runTest (action, cb) {

    nock('https://api.github.com')
      .get('/repos/microadam/exso-test/issues/11?access_token=' + serviceLocator.secrets.githubToken)
      .reply(200, { labels: [ { name: 'my-label' } ] })

    bootstrap(serviceLocator, [ action ], function (error, serviceLocator) {
      if (error) return cb(error)

      var fixture = prFixture
      request(serviceLocator.server)
        .post('/github/webhook')
        .set('content-type', 'application/json')
        .set('X-GitHub-Delivery', '1')
        .set('X-Hub-Signature', signWebhookData(serviceLocator.secrets.webhookSecret, fixture))
        .set('X-GitHub-Event', 'pull_request')
        .send(fixture)
        .expect(200)
        .end(function (error) {
          if (error) return cb(error)
        })
    })

    cb(null, serviceLocator)
  }

  it('should execute a pull-request action and generate a PR object', function (done) {

    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  assert.equal(pr instanceof PullRequest, true, 'is not a PullRequest')
                  assert.equal(pr.baseRef, 'master')
                  assert.equal(pr.branch, 'feature/add-c')
                  assert.equal(pr.headSha, '5ba66f068737fe24e37ebb1ea4f6e9b5cdc09624')
                  assert.equal(pr.owner, 'microadam')
                  assert.equal(pr.repo, 'exso-test')
                  assert.equal(pr.title, 'Adding conflicting C')
                  assert.equal(pr.body, 'some body')
                  assert.equal(pr.number, 11)
                  assert.equal(pr.author, 'microadam')
                  assert.equal(pr.numComments, 1)
                  assert.deepEqual(pr.labels, [ 'my-label' ])
                  assert.equal(pr.mergeableStateKnown, true)
                  assert.equal(pr.mergeable, true)
                  done()
                }
              }
            }
          }

    runTest(action, function (error) {
      if (error) return done(error)
    })

  })

  it('should be able to close a PR', function (done) {

    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.close(done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .patch('/repos/microadam/exso-test/pulls/11?access_token=' + serviceLocator.secrets.githubToken
      , { state: 'closed' })
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })

  })

  it('should be able to update PR description', function (done) {

    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.updateDescription('test', done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .patch('/repos/microadam/exso-test/pulls/11?access_token=' + serviceLocator.secrets.githubToken
      , { body: 'test' })
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })

  })

  it('should be able to comment on a PR', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.addComment('This is a message', done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .post('/repos/microadam/exso-test/issues/11/comments?access_token=' + serviceLocator.secrets.githubToken
      , { body: 'This is a message' })
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to set an assignee on a PR', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.setAssignee('dave', done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .patch('/repos/microadam/exso-test/issues/11?access_token=' + serviceLocator.secrets.githubToken
      , { assignee: 'dave' })
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to add labels to a PR', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.addLabels([ 'test', 'test-two' ], done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .post('/repos/microadam/exso-test/issues/11/labels?access_token=' + serviceLocator.secrets.githubToken
      , [ 'test', 'test-two' ])
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to remove a label from a PR', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.removeLabel('test', done)
                }
              }
            }
          }

    nock('https://api.github.com')
      .delete('/repos/microadam/exso-test/issues/11/labels/test?access_token=' + serviceLocator.secrets.githubToken)
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to check the mergeable state of a PR when it is immediately mergeable', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.isMergeable(function (error, mergeable) {
                    if (error) return done(error)
                    assert.equal(mergeable, true, 'should be mergeable')
                    done()
                  })
                }
              }
            }
          }

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to check the mergeable state of a PR when it is unknown', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.mergeable = null
                  pr.setMergeable(pr)
                  pr.isMergeable(function (error, mergeable) {
                    if (error) return done(error)
                    assert.equal(mergeable, true, 'should be mergeable')
                    done()
                  })
                }
              }
            }
          }

    nock('https://api.github.com')
      .get('/repos/microadam/exso-test/pulls/11?access_token=' + serviceLocator.secrets.githubToken)
      .reply(200, { mergeable: true })

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to set a status', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  var options =
                    { context: 'test'
                    , state: 'failure'
                    , description: 'test desc'
                    , url: 'http://google.com'
                    }
                  pr.addStatus(options, done)
                }
              }
            }
          }
        , path = '/repos/microadam/exso-test/statuses/' +
              '5ba66f068737fe24e37ebb1ea4f6e9b5cdc09624?access_token=' + serviceLocator.secrets.githubToken

    nock('https://api.github.com')
      .post(path
      , { state: 'failure'
        , description: 'test desc'
        , context: 'test'
        , 'target_url': 'http://google.com'
        })
      .reply(200)

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

  it('should be able to get the current status', function (done) {
    var action =
          { name: 'test'
          , actions:
            { 'pull_request':
              { check: function (ghAction, pr, cb) {
                  cb(null, true)
                }
              , exec: function (pr) {
                  pr.getCurrentStatus(function (error, status) {
                    if (error) return done(error)
                    assert.equal(status.state, 'success')
                    done()
                  })
                }
              }
            }
          }
        , path = '/repos/microadam/exso-test/commits/' +
              '5ba66f068737fe24e37ebb1ea4f6e9b5cdc09624/status?access_token=' + serviceLocator.secrets.githubToken

    nock('https://api.github.com')
      .get(path)
      .reply(200, { state: 'success' })

    runTest(action, function (error) {
      if (error) return done(error)
    })
  })

})
