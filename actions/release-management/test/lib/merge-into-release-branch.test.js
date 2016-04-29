var assert = require('assert')
  , createReleaseBranchMerger = require('../../lib/merge-into-release-branch')

describe('release-management release branch merger', function () {

  it('should add a comment to the original PR if merging fails', function (done) {
    var sl = { authedUser: { username: 'test-user' } }
      , mergeIntoReleaseBranch = createReleaseBranchMerger(sl)
      , releaseBranch =
          { merge: function (branch, cb) {
              cb({ code: 409 })
            }
          }
      , addCommentCalled = false
      , originalPr =
          { addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave Conflicts were encountered when merging into the release.' +
                ' Please get a developer to manually merge. Once complete, comment with ' +
                '`@test-user merged into release #11`')
              cb()
            }
          }

    mergeIntoReleaseBranch(releaseBranch, originalPr, { author: 'dave' }, 11, function (error, success) {
      if (error) return done(error)
      assert.equal(success, false, 'merge should not have been successful')
      assert.equal(addCommentCalled, true, 'comment should have been added')
      done()
    })
  })

  it('should return true and add no comments if merging is successful', function (done) {
    var sl = { authedUser: { username: 'test-user' } }
      , mergeIntoReleaseBranch = createReleaseBranchMerger(sl)
      , releaseBranch =
          { merge: function (branch, cb) {
              cb()
            }
          }
      , addCommentCalled = false
      , originalPr =
          { addComment: function (comment, cb) {
              addCommentCalled = true
              cb()
            }
          }

    mergeIntoReleaseBranch(releaseBranch, originalPr, { author: 'dave' }, 11, function (error, success) {
      if (error) return done(error)
      assert.equal(success, true, 'merge should have been successful')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      done()
    })
  })

})
