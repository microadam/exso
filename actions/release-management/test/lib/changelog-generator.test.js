var assert = require('assert')
  , mockDate = require('mockdate')
  , createChangelogGenerator = require('../../lib/changelog-generator')

describe('release-management changelog generator', function () {

  before(function () {
    process.env.TZ = 'UTC'
    mockDate.set('1/1/2000')
  })

  after(function () {
    mockDate.reset()
  })

  it('should create a new changelog if one does not exist', function (done) {
    var createFileCalled = false
      , sl =
          { repoManager: function () {
              function getFileContents (path, branch, cb) {
                cb({ code: 404 })
              }
              function createFile (path, contents, commitMessage, branch, cb) {
                createFileCalled = true
                assert.equal(path, 'changelog.md')
                assert.equal(contents, 'v1.0.0 / Sat Jan 01 2000 00:00:00 GMT+0000 (UTC)' +
                  '\n====================================\n- [FD #2012] Fix some strange issue\n' +
                  '- [FD #2013] Fix some other issue\n- [PT #12432313] Implement my awesome feature\n' +
                  '- [PT #12432453] Implement my other awesome feature\n\n')
                assert.equal(commitMessage, 'Update Changelog ***no_ci***')
                assert.equal(branch, 'release/test')
                cb(null, 'def456')
              }
              return { createFile: createFile, getFileContents: getFileContents }
            }

          }
      , generateAndCommitChangelog = createChangelogGenerator(sl)
      , pr =
          { branch: 'release/test'
          , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n' +
              '- #20 `[FD #2012] Fix some strange issue`\r\n' +
              '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
              'Features:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`' +
              '\r\n- #23 `[PT #12432453] Implement my other awesome feature`'
          }

    generateAndCommitChangelog(pr, 'v1.0.0', function (error, commitSha) {
      if (error) return done(error)
      assert.equal(createFileCalled, true, 'createFile was not called')
      assert.equal(commitSha, 'def456')
      done()
    })
  })

  it('should update an existing changelog if one does exist', function (done) {
    var updateFileCalled = false
      , sl =
          { repoManager: function () {
              function getFileContents (path, branch, cb) {
                cb(null, 'v0.0.0 / Sat Jan 01 2000 00:00:00 GMT+0000 (UTC)\n====================================\n\n')
              }
              function updateFile (path, contents, commitMessage, branch, blobSha, cb) {
                updateFileCalled = true
                assert.equal(path, 'changelog.md')
                assert.equal(contents, 'v1.0.0 / Sat Jan 01 2000 00:00:00 GMT+0000 (UTC)' +
                  '\n====================================\n- [FD #2012] Fix some strange issue\n' +
                  '- [FD #2013] Fix some other issue\n- [PT #12432313] Implement my awesome feature\n' +
                  '- [PT #12432453] Implement my other awesome feature\n\n' +
                  'v0.0.0 / Sat Jan 01 2000 00:00:00 GMT+0000 (UTC)\n====================================\n\n')
                assert.equal(commitMessage, 'Update Changelog ***no_ci***')
                assert.equal(branch, 'release/test')
                cb(null, 'def456')
              }
              return { updateFile: updateFile, getFileContents: getFileContents }
            }

          }
      , generateAndCommitChangelog = createChangelogGenerator(sl)
      , pr =
          { branch: 'release/test'
          , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n' +
              '- #20 `[FD #2012] Fix some strange issue`\r\n' +
              '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
              'Features:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`' +
              '\r\n- #23 `[PT #12432453] Implement my other awesome feature`'
          }

    generateAndCommitChangelog(pr, 'v1.0.0', function (error, commitSha) {
      if (error) return done(error)
      assert.equal(updateFileCalled, true, 'updateFile was not called')
      assert.equal(commitSha, 'def456')
      done()
    })
  })

})
