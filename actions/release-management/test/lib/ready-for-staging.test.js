var assert = require('assert')
  , createReadyForStaging = require('../../lib/ready-for-staging')

describe('release-management ready for staging', function () {

  it('should do nothing if run on a non release PR', function (done) {
    var readyForStaging = createReadyForStaging()
    readyForStaging({ branch: 'feature/test' }, null, null, false, done)
  })

  it('should do nothing if PR is already "ready for staging"', function (done) {
    var readyForStaging = createReadyForStaging()
    readyForStaging({ branch: 'release/test', labels: [ 'ready-for-staging' ] }, null, null, false, done)
  })

  it('should add a comment to the PR if not passing status checks', function (done) {
    var readyForStaging = createReadyForStaging()
      , addCommentCalled = false
      , pr =
          { branch: 'release/test'
          , labels: []
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'failure' })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave Not all status checks are passing.' +
                ' Ensure they are before preparing for staging.')
              cb()
            }
          }
    readyForStaging(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should prepare for staging if status checks are passing', function (done) {
    var sl =
          { repoManager: function () {
              function getTags (cb) {
                cb(null, [ { name: 'v1.0.0' } ])
              }
              function getFileContents (n, b, cb) {
                cb()
              }
              function createTag (t, s, cb) {
                createTagCalled = true
                assert.equal(t, 'v2.0.0-0')
                cb()
              }
              return {
                getTags: getTags
              , getFileContents: getFileContents
              , createTag: createTag
              }
            }
          }
      , readyForStaging = createReadyForStaging(sl)
      , addCommentCalled = false
      , addLabelsCalled = false
      , createTagCalled = false
      , pr =
          { branch: 'release/test'
          , labels: [ 'semver/major' ]
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success' })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This release has been prepared for' +
                ' staging. Tag `v2.0.0-0` is ready to deploy.')
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'ready-for-staging' ])
              cb()
            }
          }
    readyForStaging(pr, { author: 'dave' }, null, false, function (error) {
      if (error) return done(error)
      assert.equal(createTagCalled, true, 'tag was not created')
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(addLabelsCalled, true, 'labels were not added')
      done()
    })
  })

})
