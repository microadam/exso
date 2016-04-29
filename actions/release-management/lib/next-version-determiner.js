module.exports = determineNextVersion

var semver = require('semver')

function determineNextVersion (tags, type) {
  var currentRelease = null
    , nextMajorRelease = null
    , nextMinorRelease = null
    , nextPatchRelease = null
    , latestPreMajorRelease = null
    , latestPreMinorRelease = null
    , latestPrePatchRelease = null
    , nextPreMajorRelease = null
    , nextPreMinorRelease = null
    , nextPrePatchRelease = null
    , nextReleases = null

  tags.some(function (tag) {
    if (tag.indexOf('-') === -1) {
      currentRelease = semver.valid(tag)
      return true
    }
  })

  if (!currentRelease) currentRelease = '0.0.0'

  nextMajorRelease = semver.inc(currentRelease, 'major')
  nextMinorRelease = semver.inc(currentRelease, 'minor')
  nextPatchRelease = semver.inc(currentRelease, 'patch')

  tags.some(function (tag) {
    if (!latestPreMajorRelease && tag.indexOf('v' + nextMajorRelease + '-') === 0) {
      latestPreMajorRelease = semver.valid(tag)
    } else if (!latestPreMinorRelease && tag.indexOf('v' + nextMinorRelease + '-') === 0) {
      latestPreMinorRelease = semver.valid(tag)
    } else if (!latestPrePatchRelease && tag.indexOf('v' + nextPatchRelease + '-') === 0) {
      latestPrePatchRelease = semver.valid(tag)
    }
    if (latestPreMajorRelease && latestPreMinorRelease && latestPrePatchRelease) {
      return true
    }
  })

  nextPreMajorRelease = semver.inc(latestPreMajorRelease, 'prerelease') || nextMajorRelease + '-0'
  nextPreMinorRelease = semver.inc(latestPreMinorRelease, 'prerelease') || nextMinorRelease + '-0'
  nextPrePatchRelease = semver.inc(latestPrePatchRelease, 'prerelease') || nextPatchRelease + '-0'

  nextReleases =
        { major: 'v' + nextMajorRelease
        , minor: 'v' + nextMinorRelease
        , patch: 'v' + nextPatchRelease
        , premajor: 'v' + nextPreMajorRelease
        , preminor: 'v' + nextPreMinorRelease
        , prepatch: 'v' + nextPrePatchRelease
        }

  return nextReleases[type]
}
