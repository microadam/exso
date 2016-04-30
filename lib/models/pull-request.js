module.exports = PullRequest

var pluck = require('lodash.pluck')

function PullRequest (pr, ghApi) {
  this.ghApi = ghApi

  this.baseRef = pr.base.ref
  this.branch = pr.head.ref
  this.headSha = pr.head.sha
  this.owner = pr.head.repo.owner.login
  this.repo = pr.head.repo.name
  this.title = pr.title
  this.body = pr.body
  this.number = pr.number
  this.author = pr.user.login
  this.assignee = pr.assignee ? pr.assignee.login : null
  this.numComments = pr.comments
  this.labels = pr.labels ? pluck(pr.labels, 'name') : []
  this.setMergeable(pr)
}

PullRequest.prototype.init = function (cb) {
  this.loadIssueData(cb)
}

PullRequest.prototype.loadIssueData = function (cb) {
  var options =
    { user: this.owner
    , repo: this.repo
    , number: this.number
    }
  this.ghApi.issues.get(options, function (error, data) {
    if (error) return cb(error)

    this.labels = pluck(data.labels, 'name')

    cb(null, this)
  }.bind(this))
}

PullRequest.prototype.isMergeable = function (retry, cb) {
  if (!cb) {
    cb = retry
    retry = null
  }

  if (this.mergeableStateKnown) {
    return cb(null, this.mergeable)
  } else if (retry) {
    setTimeout(refreshMergeState.bind(this), 3000)
  } else {
    refreshMergeState.call(this)
  }

  function refreshMergeState () {
    this.refreshMergeState(function (error) {
      if (error) return cb(error)
      this.isMergeable(true, cb)
    }.bind(this))
  }

}

PullRequest.prototype.setMergeable = function (pr) {
  this.mergeableStateKnown = typeof pr.mergeable !== 'undefined' && pr.mergeable !== null
  this.mergeable = pr.mergeable
}

PullRequest.prototype.refreshMergeState = function (cb) {
  var options =
    { user: this.owner
    , repo: this.repo
    , number: this.number
    }
  this.ghApi.pullRequests.get(options, function (error, pr) {
    if (error) return cb(error)
    this.setMergeable(pr)
    cb(null, this)
  }.bind(this))
}

PullRequest.prototype.addComment = function (message, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , number: this.number
      , body: message
      }
  this.ghApi.issues.createComment(options, cb)
}

PullRequest.prototype.setAssignee = function (assignee, cb) {
  var options =
    { user: this.owner
    , repo: this.repo
    , number: this.number
    , assignee: assignee
    }
  this.ghApi.issues.edit(options, cb)
}

PullRequest.prototype.close = function (cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , number: this.number
      , state: 'closed'
      }
  this.ghApi.pullRequests.update(options, cb)
}

PullRequest.prototype.updateDescription = function (body, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , number: this.number
      , body: body
      }
  this.ghApi.pullRequests.update(options, cb)
}

PullRequest.prototype.addLabels = function (labels, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , number: this.number
      , body: labels
      }
  this.ghApi.issues.addLabels(options, cb)
}

PullRequest.prototype.removeLabel = function (label, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , number: this.number
      , name: label
      }
  this.ghApi.issues.removeLabel(options, cb)
}

PullRequest.prototype.addStatus = function (opts, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , sha: this.headSha
      , state: opts.state
      , description: opts.description
      , context: opts.context
      , 'target_url': opts.url
      }
  this.ghApi.repos.createStatus(options, cb)
}

PullRequest.prototype.getCurrentStatus = function (cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , sha: this.headSha
      }
  this.ghApi.repos.getCombinedStatus(options, cb)
}
