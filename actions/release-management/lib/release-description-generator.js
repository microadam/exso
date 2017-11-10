module.exports = createReleaseDescription

var parseFixesAndFeatures = require('./fixes-and-features-parser')

function createReleaseDescription () {

  function generateReleaseDescription (currentBody, prToAdd) {
    var prefix = 'This release contains:\r\n\r\n'
      , data = parseFixesAndFeatures(currentBody)
      , fixes = data.fixes
      , features = data.features
      , lineToAdd = '- #' + prToAdd.number + ' `' + prToAdd.title + '`'

    if (fixes.indexOf(lineToAdd) === -1 && features.indexOf(lineToAdd) === -1) {
      if (prToAdd.branch.indexOf('bug/') === 0 || prToAdd.branch.indexOf('fix/') === 0) {
        fixes.push(lineToAdd)
      } else if (prToAdd.branch.indexOf('feature/') === 0) {
        features.push(lineToAdd)
      }
    }

    return buildDescription(prefix, fixes, features)
  }

  function buildDescription (prefix, fixes, features) {
    var changelog = prefix

    if (fixes.length) {
      changelog += 'Fixes:\r\n\r\n'
      changelog += fixes.join('\r\n')
    }

    if (fixes.length && features.length) {
      changelog += '\r\n\r\n'
    }

    if (features.length) {
      changelog += 'Features:\r\n\r\n'
      changelog += features.join('\r\n')
    }

    return changelog
  }

  return generateReleaseDescription

}
