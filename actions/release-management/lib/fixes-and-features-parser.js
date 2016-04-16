module.exports = parseFixesAndFeatures

function parseFixesAndFeatures(body) {
  var prefix = 'This release contains:\r\n\r\n'

  body = body.replace(prefix, '')

  var parts = body.split('Features:')
    , fixes = []
    , features = []

  if (parts[0].indexOf('Fixes:') === 0) {
    fixes = parseFixes(parts[0])
    if (parts[1]) {
      features = parseFeatures(parts[1])
    }
  }

  if (parts[1]) {
    features = parseFeatures(parts[1])
  }

  return { fixes: fixes, features: features }
}

function parseFixes(fixes) {
  fixes = fixes.replace('Fixes:\r\n\r\n', '')
  fixes = fixes.split('\r\n')
  fixes = fixes.filter(function (f) { if (f) return f })
  return fixes
}

function parseFeatures(features) {
  features = features.replace('\r\n\r\n', '')
  features = features.split('\r\n')
  return features
}
