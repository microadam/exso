var assert = require('assert')
  , nock = require('nock')
  , request = require('supertest')
  , logger = require('mc-logger')
  , createServiceLocator = require('service-locator')
  , signWebhookData = require('./helpers/sign-webhook-data')
  , bootstrap = require('../../bootstrap')
  , pushFixture = require('./webhooks/fixtures/push.json')
  , PullRequest = require('../../lib/models/pull-request')
  , Branch = require('../../lib/models/branch')
  , pullRequestFixture = require('./webhooks/fixtures/pull-request.json')['pull_request']
  , referenceFixture = require('./fixtures/reference.json')
  , serviceLocator = null

describe('Repo Manager', function () {

  beforeEach(function () {
    serviceLocator = createServiceLocator()
    serviceLocator.register('secrets', { webhookSecret: 'test', githubToken: 'test' })
    serviceLocator.register('logger', logger)
  })

  function runTest(action, cb) {
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

  describe('#getOpenPulls', function () {

    it('should return an array of PullRequest objects', function (done) {

      var action =
            { name: 'test'
            , actions:
              { push:
                { check: function (ghAction, branch, cb) {
                    cb(null, true)
                  }
                , exec: function (branch) {
                    serviceLocator.repoManager(branch.owner, branch.repo).getOpenPulls(function (error, pulls) {
                      if (error) return done(error)
                      assert.equal(pulls.length, 1)
                      assert.equal(pulls[0] instanceof PullRequest, true, 'not an instance of PullRequest')
                      assert.deepEqual(pulls[0].labels, [ 'my-label' ])
                      done()
                    })
                  }
                }
              }
            }
        , token = serviceLocator.secrets.githubToken

      nock('https://api.github.com')
        .get('/repos/microadam/exso-test/issues?state=open&access_token=' + token)
        .reply(200, [ { number: 11, labels: [ { name: 'my-label' } ] } ])

      nock('https://api.github.com')
        .get('/repos/microadam/exso-test/pulls?state=open&base=master&access_token=' + token)
        .reply(200, [ pullRequestFixture ])

      runTest(action, done)

    })

  })

  describe('#getPull', function () {

    it('should return a single PullRequest object', function (done) {
      var action =
            { name: 'test'
            , actions:
              { push:
                { check: function (ghAction, branch, cb) {
                    cb(null, true)
                  }
                , exec: function (branch) {
                    serviceLocator.repoManager(branch.owner, branch.repo).getPull(11, function (error, pull) {
                      if (error) return done(error)
                      assert.equal(pull instanceof PullRequest, true, 'not an instance of PullRequest')
                      assert.deepEqual(pull.labels, [ 'my-label' ])
                      done()
                    })
                  }
                }
              }
            }
        , token = serviceLocator.secrets.githubToken

      nock('https://api.github.com')
        .get('/repos/microadam/exso-test/pulls/11?access_token=' + token)
        .reply(200, pullRequestFixture)

      nock('https://api.github.com')
        .get('/repos/microadam/exso-test/issues/11?access_token=' + token)
        .reply(200, { labels: [ { name: 'my-label' } ] })

      runTest(action, done)
    })

  })

  describe('#createPull', function () {

    it('should create and return a single PullRequest object', function (done) {
      var action =
            { name: 'test'
            , actions:
              { push:
                { check: function (ghAction, branch, cb) {
                    cb(null, true)
                  }
                , exec: function (branch) {
                    var repoManager = serviceLocator.repoManager(branch.owner, branch.repo)
                    repoManager.createPull('title', 'body', 'release/test', function (error, pull) {
                      if (error) return done(error)
                      assert.equal(pull instanceof PullRequest, true, 'not an instance of PullRequest')
                      done()
                    })
                  }
                }
              }
            }
        , token = serviceLocator.secrets.githubToken

      nock('https://api.github.com')
        .post('/repos/microadam/exso-test/pulls?access_token=' + token
        , { title: 'title'
          , body: 'body'
          , head: 'release/test'
          , base: 'master'
          })
        .reply(200, pullRequestFixture)

      runTest(action, done)
    })

  })

  describe('#getBranch', function () {

    it('should return a single Branch object', function (done) {
      var action =
            { name: 'test'
            , actions:
              { push:
                { check: function (ghAction, branch, cb) {
                    cb(null, true)
                  }
                , exec: function (branch) {
                    var repoManager = serviceLocator.repoManager(branch.owner, branch.repo)
                    repoManager.getBranch('release/test-bla', function (error, branch) {
                      if (error) return done(error)
                      assert.equal(branch instanceof Branch, true, 'not an instance of Branch')
                      assert.equal(branch.ref, 'refs/heads/release/test-bla')
                      assert.equal(branch.headSha, 'b0e588f7604018f90024ca9bc80f181cad2a2cfe')
                      assert.equal(branch.owner, 'microadam')
                      assert.equal(branch.repo, 'exso-test')
                      done()
                    })
                  }
                }
              }
            }
        , token = serviceLocator.secrets.githubToken

      nock('https://api.github.com')
        .get('/repos/microadam/exso-test/git/refs/heads%2Frelease%2Ftest-bla?access_token=' + token)
        .reply(200, referenceFixture)

      runTest(action, done)
    })

  })

  describe('#createBranch', function () {

    it('should create and return a single Branch object', function (done) {
      var action =
            { name: 'test'
            , actions:
              { push:
                { check: function (ghAction, branch, cb) {
                    cb(null, true)
                  }
                , exec: function (branch) {
                    var repoManager = serviceLocator.repoManager(branch.owner, branch.repo)
                      , sha = 'b0e588f7604018f90024ca9bc80f181cad2a2cfe'
                    repoManager.createBranch('release/test-bla', sha, function (error, branch) {
                      if (error) return done(error)
                      assert.equal(branch instanceof Branch, true, 'not an instance of Branch')
                      assert.equal(branch.ref, 'refs/heads/release/test-bla')
                      assert.equal(branch.headSha, 'b0e588f7604018f90024ca9bc80f181cad2a2cfe')
                      assert.equal(branch.owner, 'microadam')
                      assert.equal(branch.repo, 'exso-test')
                      done()
                    })
                  }
                }
              }
            }
        , token = serviceLocator.secrets.githubToken

      nock('https://api.github.com')
        .post('/repos/microadam/exso-test/git/refs?access_token=' + token
        , { ref: 'refs/heads/release/test-bla'
          , sha: 'b0e588f7604018f90024ca9bc80f181cad2a2cfe'
          })
        .reply(200, referenceFixture)

      runTest(action, done)
    })

  })

})
