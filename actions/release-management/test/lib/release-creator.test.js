var assert = require('assert')
  , rewire = require('rewire')
  , createReleaseCreator = rewire('../../lib/release-creator')

describe('release-management release-creator', function () {

  function runTest (name, cb) {
    var expectedName = name || 'random-random'
      , createNewRelease = createReleaseCreator()
      , createBranchCalled = false
      , createPullCalled = false
      , addCommentCalled = false
      , setAssigneeCalled = false
      , releasePr = null
      , pr =
          { body: ''
          , branch: 'feature/test'
          , headSha: '54dfga'
          , number: 10
          , title: 'Title of PR'
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@microadam Release #12 `' + expectedName + '`' +
                ' created with this PR successfully merged.')
              cb()
            }
          }
      , repoManager =
          { createBranch: function (name, sha, cb) {
              createBranchCalled = true
              assert.equal(name, 'release/' + expectedName)
              assert.equal(sha, '54dfga')
              cb()
            }
          , createPull: function (title, body, branchName, cb) {
              createPullCalled = true
              assert.equal(title, 'Release: ' + expectedName)
              assert.equal(body, 'This release contains:\r\n\r\nFeatures:\r\n\r\n- #10 `Title of PR`')
              assert.equal(branchName, 'release/' + expectedName)
              releasePr =
                { body: body
                , labels: []
                , number: 12
                , addLabels: function (l, cb) { releasePr.labels = releasePr.labels.concat(l); cb() }
                , setAssignee: function (assignee, cb) {
                    setAssigneeCalled = true
                    assert.equal(assignee, 'microadam')
                    cb()
                  }
                }
              cb(null, releasePr)
            }
          }
    createNewRelease(name, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return cb(error)
      assert.equal(createBranchCalled, true, 'createBranch was not called')
      assert.equal(createPullCalled, true, 'createPull was not called')
      assert.equal(addCommentCalled, true, 'addComment was not called')
      assert.equal(setAssigneeCalled, true, 'setAssignee was not called')
      assert.deepEqual(releasePr.labels, [ 'semver/minor' ])
      cb()
    })
  }

  it('should create a new release with a random name', function (done) {
    createReleaseCreator.__set__('randomWord', function () { return 'random' })
    runTest(null, done)
  })

  it('should create a new release with a specific name', function (done) {
    createReleaseCreator.__set__('randomWord', function () { return 'random' })
    runTest('phase-two', done)
  })

})
