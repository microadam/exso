var assert = require('assert')
  , createExistingReleaseAdder = require('../../lib/existing-release-adder')

describe('release-management existing-release-adder', function () {

  it('should add a comment to the original PR when merge into release fails', function (done) {
    var addCommentCalled = false
      , sl =
          { authedUser: { username: 'test-user' }
          }
      , repoManager =
          { getPull: function (number, cb) {
              cb(null, { branch: 'release/test', number: 11 })
            }
          , getBranch: function (name, cb) {
              var branch =
                    { merge: function (branch, cb) {
                        cb({ code: 409 })
                      }
                    }
              cb(null, branch)
            }
          }
      , pr =
          { labels: []
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@microadam Conflicts were encountered when merging ' +
                'into the release. Please get a developer to manually merge. Once complete,' +
                ' comment with `@test-user merged into release #11`')
              cb()
            }
          }
      , addToExistingRelease = createExistingReleaseAdder(sl)

    addToExistingRelease(11, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      done()
    })
  })

  it('should successfully add a PR to an existing release', function (done) {
    var releasePr = null
      , addCommentCalled = false
      , updateDescriptionCalled = false
      , repoManager =
          { getPull: function (number, cb) {
              releasePr =
                { branch: 'release/test'
                , number: 11
                , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n- #21 `Test`'
                , labels: []
                , addLabels: function (l, cb) { releasePr.labels = releasePr.labels.concat(l); cb() }
                , removeLabel: function (l, cb) { releasePr.labels.splice(releasePr.labels.indexOf(l), 1); cb() }
                , updateDescription: function (desc, cb) {
                    updateDescriptionCalled = true
                    assert.equal(desc, 'This release contains:\r\n\r\nFixes:\r\n\r\n- #21 `Test`\r\n- #20 `My Title`')
                    cb()
                  }
                }
              cb(null, releasePr)
            }
          , getBranch: function (name, cb) {
              var branch =
                    { merge: function (branch, cb) {
                        cb()
                      }
                    }
              cb(null, branch)
            }
          }
      , pr =
          { number: 20
          , labels: []
          , title: 'My Title'
          , branch: 'bug/test'
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This PR has been successfully merged into Release #11.')
              cb()
            }
          }
      , addToExistingRelease = createExistingReleaseAdder()

    addToExistingRelease(11, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return done(error)
      assert.equal(releasePr.body, 'This release contains:\r\n\r\nFixes:\r\n\r\n- #21 `Test`\r\n- #20 `My Title`')
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(updateDescriptionCalled, true, 'description was not updated')
      assert.deepEqual(releasePr.labels, [ 'semver/patch' ])
      done()
    })
  })

  it('should remove "ready-for-staging" label if release PR has one', function (done) {
    var releasePr = null
      , addCommentCalled = false
      , updateDescriptionCalled = false
      , repoManager =
          { getPull: function (number, cb) {
              releasePr =
                { branch: 'release/test'
                , number: 11
                , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`'
                , labels: [ 'ready-for-staging' ]
                , addLabels: function (l, cb) { releasePr.labels = releasePr.labels.concat(l); cb() }
                , removeLabel: function (l, cb) { releasePr.labels.splice(releasePr.labels.indexOf(l), 1); cb() }
                , updateDescription: function (desc, cb) {
                    updateDescriptionCalled = true
                    assert.equal(desc, 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`')
                    cb()
                  }
                }
              cb(null, releasePr)
            }
          , getBranch: function (name, cb) {
              var branch =
                    { merge: function (branch, cb) {
                        cb()
                      }
                    }
              cb(null, branch)
            }
          }
      , pr =
          { number: 20
          , title: 'My Title'
          , branch: 'bug/test'
          , labels: []
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This PR has been successfully merged into Release #11.')
              cb()
            }
          }
      , addToExistingRelease = createExistingReleaseAdder()

    addToExistingRelease(11, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(updateDescriptionCalled, true, 'description was not updated')
      assert.deepEqual(releasePr.labels, [ 'semver/patch' ])
      done()
    })
  })

  it('should remove "ready-for-staging" label if release PR has one', function (done) {
    var releasePr = null
      , addCommentCalled = false
      , updateDescriptionCalled = false
      , repoManager =
          { getPull: function (number, cb) {
              releasePr =
                { branch: 'release/test'
                , number: 11
                , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`'
                , labels: [ 'ready-for-production' ]
                , addLabels: function (l, cb) { releasePr.labels = releasePr.labels.concat(l); cb() }
                , removeLabel: function (l, cb) { releasePr.labels.splice(releasePr.labels.indexOf(l), 1); cb() }
                , updateDescription: function (desc, cb) {
                    updateDescriptionCalled = true
                    assert.equal(desc, 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`')
                    cb()
                  }
                }
              cb(null, releasePr)
            }
          , getBranch: function (name, cb) {
              var branch =
                    { merge: function (branch, cb) {
                        cb()
                      }
                    }
              cb(null, branch)
            }
          }
      , pr =
          { number: 20
          , title: 'My Title'
          , branch: 'bug/test'
          , labels: []
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This PR has been successfully merged into Release #11.')
              cb()
            }
          }
      , addToExistingRelease = createExistingReleaseAdder()

    addToExistingRelease(11, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(updateDescriptionCalled, true, 'description was not updated')
      assert.deepEqual(releasePr.labels, [ 'semver/patch' ])
      done()
    })
  })

  it('should add "on-staging--partial" label if release PR has "on-staging" label', function (done) {
    var releasePr = null
      , addCommentCalled = false
      , updateDescriptionCalled = false
      , repoManager =
          { getPull: function (number, cb) {
              releasePr =
                { branch: 'release/test'
                , number: 11
                , body: 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`'
                , labels: [ 'on-staging' ]
                , addLabels: function (l, cb) { releasePr.labels = releasePr.labels.concat(l); cb() }
                , removeLabel: function (l, cb) { releasePr.labels.splice(releasePr.labels.indexOf(l), 1); cb() }
                , updateDescription: function (desc, cb) {
                    updateDescriptionCalled = true
                    assert.equal(desc, 'This release contains:\r\n\r\nFixes:\r\n\r\n- #20 `My Title`')
                    cb()
                  }
                }
              cb(null, releasePr)
            }
          , getBranch: function (name, cb) {
              var branch =
                    { merge: function (branch, cb) {
                        cb()
                      }
                    }
              cb(null, branch)
            }
          }
      , pr =
          { number: 20
          , title: 'My Title'
          , branch: 'bug/test'
          , labels: []
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, 'This PR has been successfully merged into Release #11.')
              cb()
            }
          }
      , addToExistingRelease = createExistingReleaseAdder()

    addToExistingRelease(11, pr, { author: 'microadam' }, repoManager, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'comment was not added')
      assert.equal(updateDescriptionCalled, true, 'description was not updated')
      assert.deepEqual(releasePr.labels, [ 'on-staging', 'on-staging--partial', 'semver/patch' ])
      done()
    })
  })

})
