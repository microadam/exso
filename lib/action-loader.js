module.exports = loadActions

var fs = require('fs')
  , async = require('async')

function loadActions(serviceLocator, cb) {
  var actionDir = __dirname + '/../actions/'

  fs.readdir(actionDir, function (error, files) {
    if (error) throw error

    var actions = []

    async.each(files
    , function (file, eachCb) {
        var action = require(actionDir + file + '/index.js')(serviceLocator)
        actions.push(action)
        eachCb()
      }
    , function (error) {
        if (error) return cb(error)
        cb(null, actions)
      }
    )
  })
}
