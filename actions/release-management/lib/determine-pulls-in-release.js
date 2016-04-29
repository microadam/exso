module.exports = determinePullsInRelease

var parseFixesAndFeatures = require('./fixes-and-features-parser')

function determinePullsInRelease (pr) {

  var data = parseFixesAndFeatures(pr.body)
    , itemsInPr = data.fixes.concat(data.features)
    , numbers = []

  itemsInPr.forEach(function (item) {
    item = item.replace('- #', '')
    var parts = item.split('`')
      , number = parts[0].trim()

    numbers.push(parseInt(number, 10))
  })

  return numbers
}
