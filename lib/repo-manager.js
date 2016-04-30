module.exports = createRepoManager

var PullRequest = require('./models/pull-request')
  , Branch = require('./models/branch')
  , createOpenPullsRetriever = require('./get-open-pulls')
  , createFilesUpdater = require('./files-updater')
  , async = require('async')

function createRepoManager (serviceLocator) {

  function repoManager (owner, repoName) {

    function getPull (number, cb) {
      var options =
        { user: owner
        , repo: repoName
        , number: number
        }
      serviceLocator.ghApi.pullRequests.get(options, function (error, data) {
        if (error) return cb(error)
        var pr = new PullRequest(data, serviceLocator.ghApi)
        pr.init(cb)
      })
    }

    function createPull (title, body, branch, cb) {
      var options =
        { user: owner
        , repo: repoName
        , title: title
        , body: body
        , base: 'master'
        , head: branch
        }
      serviceLocator.ghApi.pullRequests.create(options, function (error, data) {
        if (error) return cb(error)
        var pr = new PullRequest(data, serviceLocator.ghApi)
        cb(null, pr)
      })
    }

    function getBranch (branch, cb) {
      var options =
        { user: owner
        , repo: repoName
        , ref: 'heads/' + branch
        }
      serviceLocator.ghApi.gitdata.getReference(options, function (error, data) {
        if (error) return cb(error)
        var branch = new Branch(data, serviceLocator.ghApi)
        cb(null, branch)
      })
    }

    function createBranch (name, sha, cb) {
      createRef('refs/heads/' + name, sha, cb)
    }

    function getTags (cb) {
      var options =
        { user: owner
        , repo: repoName
        , 'per_page': 100
        }
      serviceLocator.ghApi.repos.getTags(options, cb)
    }

    function createTag (tag, sha, cb) {
      createRef('refs/tags/' + tag, sha, function (error) {
        if (error) return cb(error)
        cb()
      })
    }

    function createRef (ref, sha, cb) {
      var options =
        { user: owner
        , repo: repoName
        , ref: ref
        , sha: sha
        }
      serviceLocator.ghApi.gitdata.createReference(options, function (error, data) {
        if (error) return cb(error)
        var branch = new Branch(data, serviceLocator.ghApi)
        cb(null, branch)
      })
    }

    function getFileContents (path, branch, cb) {
      var options =
        { user: owner
        , repo: repoName
        , path: path
        , ref: branch
        }
      serviceLocator.ghApi.repos.getContent(options, function (error, data) {
        if (error) return cb(error)
        var buf = new Buffer(data.content, 'base64')
          , contents = buf.toString()

        cb(null, contents, data.sha)
      })
    }

    function createFile (path, contents, commitMessage, branch, cb) {
      contents = new Buffer(contents)
      contents = contents.toString('base64')
      var options =
        { user: owner
        , repo: repoName
        , path: path
        , message: commitMessage
        , content: contents
        , branch: branch
        }
      serviceLocator.ghApi.repos.createFile(options, function (error, data) {
        if (error) return cb(error)
        cb(null, data.commit.sha)
      })
    }

    function updateFile (path, contents, commitMessage, branch, blobSha, cb) {
      contents = new Buffer(contents)
      contents = contents.toString('base64')
      var options =
        { user: owner
        , repo: repoName
        , path: path
        , message: commitMessage
        , content: contents
        , sha: blobSha
        , branch: branch
        }
      serviceLocator.ghApi.repos.updateFile(options, function (error, data) {
        if (error) return cb(error)
        cb(null, data.commit.sha)
      })
    }

    function createInitialHook (cb) {
      serviceLocator.logger.info('creating initial hook')
      var options =
            { user: owner
            , repo: repoName
            , name: 'web'
            , config:
              { url: serviceLocator.config.url + '/github/webhook'
              , 'content_type': 'json'
              , secret: serviceLocator.secrets.webhookSecret
              }
            , events:
              [ 'push', 'pull_request', 'issue_comment', 'create'
              , 'pull_request_review_comment', 'commit_comment'
              ]
            , active: true
            }
      serviceLocator.ghApi.repos.createHook(options, cb)
    }

    function clearAllLabels (cb) {
      serviceLocator.logger.info('clearing all labels...')
      var options = { user: owner, repo: repoName }
      serviceLocator.ghApi.issues.getLabels(options, function (error, labels) {
        if (error) return cb(error)
        async.each(labels
        , function (label, cb) {
            var data = { user: owner, repo: repoName, name: label.name }
            serviceLocator.ghApi.issues.deleteLabel(data, cb)
          }
        , cb
        )
      })
    }

    function createRequiredLabels (cb) {
      serviceLocator.logger.info('creating required labels')
      var labels =
            [ { name: 'needs-master-merge', color: 'b60205' }
            , { name: 'qa-required', color: '1d76db' }
            , { name: 'release', color: 'd4c5f9' }
            , { name: 'ready-for-staging', color: 'fef2c0' }
            , { name: 'on-staging', color: 'fbca04' }
            , { name: 'on-staging--partial', color: 'd93f0b' }
            , { name: 'ready-for-production', color: 'c2e0c6' }
            , { name: 'on-production', color: '0e8a16' }
            , { name: 'semver/major', color: 'c5def5' }
            , { name: 'semver/minor', color: 'c5def5' }
            , { name: 'semver/patch', color: 'c5def5' }
            ]
      async.each(labels
      , function (label, cb) {
          label.user = owner
          label.repo = repoName
          serviceLocator.ghApi.issues.createLabel(label, cb)
        }
      , cb
      )
    }

    return {
      getOpenPulls: createOpenPullsRetriever(serviceLocator, owner, repoName)
    , getPull: getPull
    , createPull: createPull
    , getBranch: getBranch
    , createBranch: createBranch
    , createTag: createTag
    , getTags: getTags
    , getFileContents: getFileContents
    , createFile: createFile
    , updateFile: updateFile
    , updateFiles: createFilesUpdater(serviceLocator, owner, repoName)
    , createInitialHook: createInitialHook
    , clearAllLabels: clearAllLabels
    , createRequiredLabels: createRequiredLabels
    }
  }

  return repoManager

}
