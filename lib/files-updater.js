module.exports = createFilesUpdater

var async = require('async')

function createFilesUpdater (serviceLocator, owner, repoName) {

  function updateFiles (options, cb) {
    if (!options) options = {}
    if (!options.files) options.files = []

    var tasks =
          [ createTree.bind(null, options.files, options.baseSha)
          , createCommit.bind(null, options.baseSha, options.commitMessage)
          , updateBranchRef.bind(null, options.branch)
          ]

    async.waterfall(tasks, cb)
  }

  function createTree (files, baseSha, cb) {
    var treeOptions =
          { user: owner
          , repo: repoName
          , 'base_tree': baseSha
          , tree: []
          }

    files.forEach(function (file) {
      var tree = { mode: '100644', type: 'blob', path: file.path, content: file.content }
      treeOptions.tree.push(tree)
    })

    serviceLocator.ghApi.gitdata.createTree(treeOptions, cb)
  }

  function createCommit (baseSha, commitMessage, tree, cb) {
    var commitOptions =
          { user: owner
          , repo: repoName
          , message: commitMessage
          , tree: tree.sha
          , parents: [ baseSha ]
          }
    serviceLocator.ghApi.gitdata.createCommit(commitOptions, cb)
  }

  function updateBranchRef (branch, commit, cb) {
    var updateRefOptions =
          { user: owner
          , repo: repoName
          , ref: 'heads/' + branch
          , sha: commit.sha
          }
    serviceLocator.ghApi.gitdata.updateReference(updateRefOptions, function (error) {
      if (error) return cb(error)
      cb(null, commit.sha)
    })
  }

  return updateFiles
}
