var assert = require('assert')
  , rewire = require('rewire')
  , createAddToRelease = rewire('../../lib/add-to-release')

describe('release-management add-to-release', function () {

  it('should do nothing if this is a release PR', function (done) {
    var addToRelease = createAddToRelease()
    addToRelease({ branch: 'release/test' }, null, null, done)
  })

  it('should comment on original PR if base branch is not master', function (done) {
    var addCommentCalled = false
      , pr =
          { branch: ''
          , baseRef: 'feature/test'
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'pending', statuses: [ {} ] })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@microadam Only Pull Requests based off of `master` can be merged' +
                ' into to a release. Please merge this Pull Request and then add the base branch to the release.')
              cb()
            }
          }
      , addToRelease = createAddToRelease()

    addToRelease(pr, { author: 'microadam' }, null, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should comment on original PR if its status is not success and there is a status', function (done) {
    var addCommentCalled = false
      , pr =
          { branch: ''
          , baseRef: 'master'
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'pending', statuses: [ {} ] })
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@microadam Not all status checks are passing.' +
                ' Ensure they are before adding to a release.')
              cb()
            }
          }
      , addToRelease = createAddToRelease()

    addToRelease(pr, { author: 'microadam' }, null, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should create a new release if no release name specified', function (done) {
    var createNewReleaseCalled = false
      , sl =
          { repoManager: function (owner, repo) {
              assert.equal(owner, 'owner')
              assert.equal(repo, 'repo')
              return 'repoManager'
            }
          }
      , pr =
          { branch: 'branch'
          , baseRef: 'master'
          , owner: 'owner'
          , repo: 'repo'
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'pending', statuses: [] })
            }
          }
      , addToRelease = null

    createAddToRelease.__set__('createReleaseCreator', function () {
      return function createNewRelease (releaseNameNumber, pr, comment, repoManager, cb) {
        createNewReleaseCalled = true
        assert.equal(releaseNameNumber, null)
        assert.equal(pr.branch, 'branch')
        assert.equal(comment, 'comment')
        assert.equal(repoManager, 'repoManager')
        cb()
      }
    })

    addToRelease = createAddToRelease(sl)
    addToRelease(pr, 'comment', null, function (error) {
      if (error) return done(error)
      assert.equal(createNewReleaseCalled, true, 'createNewRelease was not called')
      done()
    })
  })

  it('should create a new release if a name is specified', function (done) {
    var createNewReleaseCalled = false
      , sl =
          { repoManager: function (owner, repo) {
              assert.equal(owner, 'owner')
              assert.equal(repo, 'repo')
              return 'repoManager'
            }
          }
      , pr =
          { branch: 'branch'
          , baseRef: 'master'
          , owner: 'owner'
          , repo: 'repo'
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success' })
            }
          }
      , addToRelease = null

    createAddToRelease.__set__('createReleaseCreator', function () {
      return function createNewRelease (releaseNameNumber, pr, comment, repoManager, cb) {
        createNewReleaseCalled = true
        assert.equal(releaseNameNumber, 'dave')
        assert.equal(pr.branch, 'branch')
        assert.equal(comment, 'comment')
        assert.equal(repoManager, 'repoManager')
        cb()
      }
    })

    addToRelease = createAddToRelease(sl)
    addToRelease(pr, 'comment', 'dave', function (error) {
      if (error) return done(error)
      assert.equal(createNewReleaseCalled, true, 'createNewRelease was not called')
      done()
    })
  })

  it('should add to a release if a release number is provided', function (done) {
    var addToExistingReleaseCalled = false
      , sl =
          { repoManager: function (owner, repo) {
              assert.equal(owner, 'owner')
              assert.equal(repo, 'repo')
              return 'repoManager'
            }
          }
      , pr =
          { branch: 'branch'
          , baseRef: 'master'
          , owner: 'owner'
          , repo: 'repo'
          , getCurrentStatus: function (cb) {
              cb(null, { state: 'success' })
            }
          }
      , addToRelease = null

    createAddToRelease.__set__('createExistingReleaseAdder', function () {
      return function addToExistingRelease (releaseNameNumber, pr, comment, repoManager, cb) {
        addToExistingReleaseCalled = true
        assert.equal(releaseNameNumber, 1)
        assert.equal(pr.branch, 'branch')
        assert.equal(comment, 'comment')
        assert.equal(repoManager, 'repoManager')
        cb()
      }
    })

    addToRelease = createAddToRelease(sl)
    addToRelease(pr, 'comment', 1, function (error) {
      if (error) return done(error)
      assert.equal(addToExistingReleaseCalled, true, 'addToExistingRelease was not called')
      done()
    })
  })

})
