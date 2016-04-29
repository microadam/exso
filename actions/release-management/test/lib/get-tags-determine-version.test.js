var assert = require('assert')
  , getTagsAndDetermineVersion = require('../../lib/get-tags-determine-version')

describe('release-management get tags and determine version', function () {

  it('should return a prepatch version for a staging patch release', function (done) {
    var repoManager =
            { getTags: function (cb) {
                cb(null, [ { name: 'v1.0.0' } ])
              }
            }
        , pr = { labels: [ 'semver/patch' ] }

    getTagsAndDetermineVersion('staging', repoManager, pr, function (error, version) {
      if (error) return done(error)
      assert.equal(version, 'v1.0.1-0')
      done()
    })
  })

  it('should return a minor version for a production minor release', function (done) {
    var repoManager =
            { getTags: function (cb) {
                cb(null, [ { name: 'v1.0.0' } ])
              }
            }
        , pr = { labels: [ 'semver/minor' ] }

    getTagsAndDetermineVersion('production', repoManager, pr, function (error, version) {
      if (error) return done(error)
      assert.equal(version, 'v1.1.0')
      done()
    })
  })

})
