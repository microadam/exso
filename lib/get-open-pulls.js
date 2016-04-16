module.exports = createOpenPullsRetriever

var async = require('async')
  , findWhere = require('lodash.findwhere')
  , PullRequest = require('./models/pull-request')

function createOpenPullsRetriever(serviceLocator, owner, repoName) {

  function getOpenPulls(cb) {
    var tasks =
      { issues: getIssues
      , prs: getPrs
      }
    async.parallel(tasks, function (error, results) {
      if (error) return cb(error)
      var pulls = []
      results.prs.forEach(function (pr) {
        var issue = findWhere(results.issues, { number: pr.number })
        if (issue) {
          pr.labels = issue.labels
        }
        pulls.push(new PullRequest(pr, serviceLocator.ghApi))
      })
      cb(null, pulls)
    })
  }

  function getPrs(cb) {
    var options =
      { user: owner
      , repo: repoName
      , state: 'open'
      , base: 'master'
      }
    serviceLocator.ghApi.pullRequests.getAll(options, cb)
  }

  function getIssues(cb) {
    var options =
      { user: owner
      , repo: repoName
      , state: 'open'
      }
    serviceLocator.ghApi.issues.getForRepo(options, cb)
  }

  return getOpenPulls

}
