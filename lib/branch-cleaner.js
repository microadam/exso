module.exports = createBranchCleaner

var async = require('async')

function createBranchCleaner (serviceLocator, owner, repoName) {

  function cleanupBranches (cb) {
    var options =
      { user: owner
      , repo: repoName
      , 'per_page': 100
      }
    serviceLocator.ghApi.gitdata.getReferences(options, function (error, refs) {
      if (error) return cb(error)
      var masterSha = null
      refs = refs.filter(function (ref) {
        // ignore branches which are not namespaced i.e feature/*
        if (ref.ref === 'refs/heads/master') {
          masterSha = ref.object.sha
          return false
        }
        if (ref.ref.replace('refs/heads/', '').indexOf('/') === -1) return false
        if (ref.ref.indexOf('refs/heads') === 0) return true
      })
      async.each(refs
      , function (ref, cb) {
          var compareOptions =
                { user: owner
                , repo: repoName
                , base: masterSha
                , head: ref.object.sha
                }
          serviceLocator.ghApi.repos.compareCommits(compareOptions, function (error, data) {
            if (error) return cb(error)
            if (data['ahead_by'] === 0) {
              var deleteOptions =
                    { user: owner
                    , repo: repoName
                    , ref: ref.ref.replace('refs/', '')
                    }
              serviceLocator.ghApi.gitdata.deleteReference(deleteOptions, cb)
            } else {
              cb()
            }
          })
        }
      , cb
      )
    })
  }

  return cleanupBranches
}
