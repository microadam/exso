var assert = require('assert')
  , createPrepareForEnv = require('../../lib/prepare-for-env')

describe('release-management prepare for env', function () {

  it('should prepare release for environment if there are node specific files', function (done) {
    var createTagCalled = false
      , makeNodeCommitCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , sl =
          { repoManager: function () {
              function getFileContents (n, b, cb) {
                makeNodeCommitCalled = true
                cb(null, '{ "version": "v1.0.0" }')
              }
              function updateFiles (o, cb) {
                cb(null, 'def456')
              }
              return { getFileContents: getFileContents, updateFiles: updateFiles }
            }
          }
      , prepareForEnv = createPrepareForEnv(sl)
      , repoManager =
          { createTag: function (version, sha, cb) {
              createTagCalled = true
              assert.equal(version, 'v2.0.0')
              assert.equal(sha, 'def456')
              cb()
            }
          }
      , pr =
          { headSha: 'abc123'
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave This release has' +
                ' been prepared for staging. Tag `v2.0.0` is ready to deploy.')
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'ready-for-staging' ])
              cb()
            }
          }
      , comment = { author: 'dave' }

    prepareForEnv('staging', 'v2.0.0', repoManager, pr, comment, function (error) {
      if (error) return done(error)
      assert.equal(makeNodeCommitCalled, true, 'node files were not commited')
      assert.equal(createTagCalled, true, 'tag was not created')
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(addLabelsCalled, true, 'labels were not added')
      done()
    })
  })

  it('should prepare release for environment if there are no node specific files', function (done) {
    var createTagCalled = false
      , makeNodeCommitCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , sl =
          { repoManager: function () {
              function getFileContents (n, b, cb) {
                makeNodeCommitCalled = true
                cb({ code: 404 })
              }
              return { getFileContents: getFileContents }
            }
          }
      , prepareForEnv = createPrepareForEnv(sl)
      , repoManager =
          { createTag: function (version, sha, cb) {
              createTagCalled = true
              assert.equal(version, 'v2.0.0')
              assert.equal(sha, 'abc123')
              cb()
            }
          }
      , pr =
          { headSha: 'abc123'
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave This release has' +
                ' been prepared for staging. Tag `v2.0.0` is ready to deploy.')
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'ready-for-staging' ])
              cb()
            }
          }
      , comment = { author: 'dave' }

    prepareForEnv('staging', 'v2.0.0', repoManager, pr, comment, function (error) {
      if (error) return done(error)
      assert.equal(makeNodeCommitCalled, true, 'node files were not commited')
      assert.equal(createTagCalled, true, 'tag was not created')
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(addLabelsCalled, true, 'labels were not added')
      done()
    })
  })

})
