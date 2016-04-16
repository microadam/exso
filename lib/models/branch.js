module.exports = Branch

function Branch(data, ghApi) {
  this.ghApi = ghApi

  this.ref = data.ref
  this.headSha = data.after || data.object.sha

  if (data.repository) {
    this.owner = data.repository.owner.name
    this.repo =  data.repository.name
  } else {
    var parts = data.url.split('/')
    this.owner = parts[4]
    this.repo =  parts[5]
  }
}

Branch.prototype.merge = function (branchName, cb) {
  var options =
      { user: this.owner
      , repo: this.repo
      , base: this.ref.replace('refs/heads/', '')
      , head: branchName
      }
  this.ghApi.repos.merge(options, cb)
}
