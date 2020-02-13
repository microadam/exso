var assert = require('assert')
  , createReadyForProduction = require('../../lib/ready-for-production')

describe('release-management ready for production', function () {

  it('should add a comment if run on a non release PR', function (done) {
    var readyForProduction = createReadyForProduction()
      , addCommentCalled = false
      , pr =
          { branch: 'feature/test'
          , labels: []
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success' })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave You are trying to release a feature ' +
                'branch, please switch to the release branch and rerun the command.')
              cb()
            }
          }
    readyForProduction(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should do nothing if PR is already "ready for production"', function (done) {
    var readyForProduction = createReadyForProduction()
    readyForProduction({ branch: 'release/test', labels: [ 'ready-for-production' ] }, null, null, false, done)
  })

  it('should add a comment to the PR if not passing status checks', function (done) {
    var readyForProduction = createReadyForProduction()
      , addCommentCalled = false
      , pr =
          { branch: 'release/test'
          , labels: []
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'failure' })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave Please ensure all status checks are' +
                ' passing and that this release has previously been on staging ' +
                'before preparing for production.')
              cb()
            }
          }
    readyForProduction(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should add a comment to the PR if not been to staging before', function (done) {
    var readyForProduction = createReadyForProduction()
      , addCommentCalled = false
      , pr =
          { branch: 'release/test'
          , labels: []
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success' })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave Please ensure all status checks are' +
                ' passing and that this release has previously been on staging ' +
                'before preparing for production.')
              cb()
            }
          }
    readyForProduction(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should prepare for production if status checks are passing', function (done) {
    var sl =
          { repoManager: function () {
              function getTags (cb) {
                cb(null, [ { name: 'v1.0.0' } ])
              }
              function getFileContents (n, b, cb) {
                cb(null, null, 'abc123')
              }
              function createTag (t, s, cb) {
                createTagCalled = true
                assert.equal(t, 'v2.0.0')
                cb()
              }
              function updateFile (path, contents, commitMessage, branch, blobSha, cb) {
                changelogUpdateOccured = true
                assert.equal(path, 'changelog.md')
                cb()
              }
              return {
                getTags: getTags
              , getFileContents: getFileContents
              , createTag: createTag
              , updateFile: updateFile
              }
            }
          }
      , readyForProduction = createReadyForProduction(sl)
      , addCommentCalled = false
      , addLabelsCalled = false
      , createTagCalled = false
      , changelogUpdateOccured = false
      , pr =
          { body: ''
          , branch: 'release/test'
          , labels: [ 'semver/major' ]
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success', statuses: [ { context: 'Been to Staging Check' } ] })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This release has been prepared for' +
                ' production. Tag `v2.0.0` is ready to deploy.')
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'ready-for-production' ])
              cb()
            }
          }
    readyForProduction(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(createTagCalled, true, 'tag was not created')
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(addLabelsCalled, true, 'labels were not added')
      assert.equal(changelogUpdateOccured, true, 'changelog should have been updated')
      done()
    })
  })

})
