module.exports = createHealthRoute

function createHealthRoute (serviceLocator) {

  serviceLocator.server.get('/_health', function (req, res) {
    serviceLocator.ghApi.users.get({}, function (error, user) {
      if (error) {
        return res.status(500).json(error)
      }
      res.status(200).json(user.meta)
    })
  })

}
