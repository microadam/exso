module.exports = createRepoManager

var PullRequest = require('./models/pull-request')
  , Branch = require('./models/branch')
  , createOpenPullsRetriever = require('./get-open-pulls')

function createRepoManager(serviceLocator) {

  function repoManager(owner, repoName) {

    function getPull(number, cb) {
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

    function createPull(title, body, branch, cb) {
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

    function getBranch(branch, cb) {
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

    function createBranch(name, sha, cb) {
      var options =
        { user: owner
        , repo: repoName
        , ref: 'refs/heads/' + name
        , sha: sha
        }
      serviceLocator.ghApi.gitdata.createReference(options, function (error, data) {
        if (error) return cb(error)
        var branch = new Branch(data, serviceLocator.ghApi)
        cb(null, branch)
      })
    }

    return {
      getOpenPulls: createOpenPullsRetriever(serviceLocator, owner, repoName)
    , getPull: getPull
    , createPull: createPull
    , getBranch: getBranch
    , createBranch: createBranch
    }
  }

  return repoManager

}
