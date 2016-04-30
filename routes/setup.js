module.exports = createSetupRoute

var async = require('async')

function createSetupRoute (serviceLocator) {

  serviceLocator.server.get('/setup/:user/:repo', function (req, res) {
    var user = req.params.user
      , repo = req.params.repo
      , repoManager = serviceLocator.repoManager(user, repo)
      , tasks =
          [ repoManager.createInitialHook
          , repoManager.clearAllLabels
          , repoManager.createRequiredLabels
          ]

    async.series(tasks, function (error) {
      if (error) return res.status(500).json(error)
      res.sendStatus(200)
    })
  })

}
