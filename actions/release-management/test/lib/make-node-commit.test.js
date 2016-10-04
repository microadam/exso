var assert = require('assert')
  , createNodeCommiter = require('../../lib/make-node-commit')

describe('release-management node file commiter', function () {

  it('should update package.json and npm-shrinkwrap', function (done) {

    function getFileContents (name, branch, cb) {
      cb(null, '{ "version": "v1.0.0" }')
    }

    function updateFiles (options, cb) {
      updateFilesCalled = true
      var expected =
        { files:
          [ { path: 'package.json'
            , content: '{\n  "version": "2.0.0"\n}\n'
            }
          , { path: 'npm-shrinkwrap.json'
            , content: '{\n  "version": "2.0.0"\n}\n'
            }
          ]
        , commitMessage: 'v2.0.0 [ci skip]'
        , baseSha: 'abc123'
        , branch: 'release/test'
        }
      assert.deepEqual(options, expected)
      cb()
    }

    var updateFilesCalled = false
      , sl =
          { repoManager: function () {
              return { getFileContents: getFileContents, updateFiles: updateFiles }
            }

          }
      , makeNodeCommit = createNodeCommiter(sl)
      , pr =
          { branch: 'release/test'
          , headSha: 'abc123'
          }

    makeNodeCommit('v2.0.0', pr, function (error) {
      if (error) return done(error)
      assert.equal(updateFilesCalled, true, 'files were not updated')
      done()
    })
  })

  it('should update package.json even if npm-shrinkwrap does not exist', function (done) {

    function getFileContents (name, branch, cb) {
      if (name === 'npm-shrinkwrap.json') return cb({ code: 404 })
      cb(null, '{ "version": "v1.0.0" }')
    }

    function updateFiles (options, cb) {
      updateFilesCalled = true
      var expected =
        { files:
          [ { path: 'package.json'
            , content: '{\n  "version": "2.0.0"\n}\n'
            }
          ]
        , commitMessage: 'v2.0.0 [ci skip]'
        , baseSha: 'abc123'
        , branch: 'release/test'
        }
      assert.deepEqual(options, expected)
      cb()
    }

    var updateFilesCalled = false
      , sl =
          { repoManager: function () {
              return { getFileContents: getFileContents, updateFiles: updateFiles }
            }

          }
      , makeNodeCommit = createNodeCommiter(sl)
      , pr =
          { branch: 'release/test'
          , headSha: 'abc123'
          }

    makeNodeCommit('v2.0.0', pr, function (error) {
      if (error) return done(error)
      assert.equal(updateFilesCalled, true, 'files were not updated')
      done()
    })
  })

  it('should do nothing if both package.json does not exist', function (done) {

    function getFileContents (name, branch, cb) {
      return cb({ code: 404 })
    }

    function updateFiles (options, cb) {
      updateFilesCalled = true
      cb()
    }

    var updateFilesCalled = false
      , sl =
          { repoManager: function () {
              return { getFileContents: getFileContents, updateFiles: updateFiles }
            }

          }
      , makeNodeCommit = createNodeCommiter(sl)
      , pr =
          { branch: 'release/test'
          , headSha: 'abc123'
          }

    makeNodeCommit('v2.0.0', pr, function (error) {
      assert.equal(error.code, 404)
      assert.equal(updateFilesCalled, false, 'files were updated')
      done()
    })
  })

})
