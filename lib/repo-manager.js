module.exports = createRepoManager

var PullRequest = require('./models/pull-request')
  , Branch = require('./models/branch')
  , createOpenPullsRetriever = require('./get-open-pulls')
  , createFilesUpdater = require('./files-updater')

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
    }
  }

  return repoManager

}
