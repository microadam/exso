var assert = require('assert')
  , rewire = require('rewire')
  , createOnStaging = rewire('../../lib/on-staging')

describe('release-management on staging', function () {

  it('should correctly update the labels of open pull requests', function (done) {
    createOnStaging.__set__('determinePullsInRelease', function () { return [ '2', '3', '4', '7', '8' ] })
    var onStagingLabelRemovedCallCount = 0
      , onStagingLabelAddedCallCount = 0
      , removeReadyForStagingLabelCallCount = 0
      , removeOnStagingPartialLabelCallCount = 0
      , previouslyOnStagingNotNow =
          { labels: [ 'on-staging' ]
          , number: '1'
          , removeLabel: function (label, cb) {
              onStagingLabelRemovedCallCount++
              assert.equal(label, 'on-staging')
              cb()
            }
          }
      , notYetOnStaging =
          { labels: []
          , number: '2'
          , addLabels: function (labels, cb) {
              onStagingLabelAddedCallCount++
              assert.deepEqual(labels, [ 'on-staging' ])
              cb()
            }
          }
      , alreadyOnStaging =
          { labels: [ 'on-staging' ]
          , number: '3'
          , addLabels: function (labels, cb) {
              onStagingLabelAddedCallCount++
              cb()
            }
          }
      , releasePrInReleaseReadyForStaging =
          { labels: [ 'ready-for-staging' ]
          , number: '4'
          , removeLabel: function (label, cb) {
              removeReadyForStagingLabelCallCount++
              assert.equal(label, 'ready-for-staging')
              cb()
            }
          , addLabels: function (labels, cb) {
              onStagingLabelAddedCallCount++
              assert.deepEqual(labels, [ 'on-staging' ])
              cb()
            }
          }
      , releasePrNotInReleaseReadyForStaging =
          { labels: [ 'ready-for-staging' ]
          , number: '5'
          , removeLabel: function (label, cb) {
              removeReadyForStagingLabelCallCount++
              cb()
            }
          }
      , releasePrNotInReleaseNotReadyForStaging =
          { labels: []
          , number: '6'
          , removeLabel: function (label, cb) {
              removeReadyForStagingLabelCallCount++
              cb()
            }
          }
      , releasePrInReleaseNotReadyForStaging =
          { labels: []
          , number: '7'
          , removeLabel: function (label, cb) {
              removeReadyForStagingLabelCallCount++
              cb()
            }
          , addLabels: function (labels, cb) {
              onStagingLabelAddedCallCount++
              assert.deepEqual(labels, [ 'on-staging' ])
              cb()
            }
          }
      , releasePrInReleaseReadyForStagingPartiallyOnStaging =
          { labels: [ 'ready-for-staging', 'on-staging--partial' ]
          , number: '8'
          , removeLabel: function (label, cb) {
              if (label === 'ready-for-staging') {
                removeReadyForStagingLabelCallCount++
              } else if (label === 'on-staging--partial') {
                removeOnStagingPartialLabelCallCount++
              }
              cb()
            }
          , addLabels: function (labels, cb) {
              onStagingLabelAddedCallCount++
              assert.deepEqual(labels, [ 'on-staging' ])
              cb()
            }
          }
      , openPulls =
          [ previouslyOnStagingNotNow
          , notYetOnStaging
          , alreadyOnStaging
          , releasePrInReleaseReadyForStaging
          , releasePrNotInReleaseReadyForStaging
          , releasePrNotInReleaseNotReadyForStaging
          , releasePrInReleaseNotReadyForStaging
          , releasePrInReleaseReadyForStagingPartiallyOnStaging
          ]
      , sl =
          { repoManager: function () {
              function getOpenPulls (cb) {
                cb(null, openPulls)
              }
              return { getOpenPulls: getOpenPulls }
            }
          }
      , onStaging = createOnStaging(sl)
      , pr =
          { labels: []
          , addStatus: function (options, cb) {
              cb()
            }
          , addComment: function (c, cb) {
              cb()
            }
          }
      , comment = {}

    onStaging(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(onStagingLabelRemovedCallCount, 1)
      assert.equal(onStagingLabelAddedCallCount, 4)
      assert.equal(removeReadyForStagingLabelCallCount, 2)
      assert.equal(removeOnStagingPartialLabelCallCount, 1)
      done()
    })
  })

  it('should add been to staging status if release PR is fully on staging', function (done) {
    createOnStaging.__set__('determinePullsInRelease', function () { return [] })
    var beenToStagingCheckCalled = false
      , openPulls = []
      , sl =
          { repoManager: function () {
              function getOpenPulls (cb) {
                cb(null, openPulls)
              }
              return { getOpenPulls: getOpenPulls }
            }
          }
      , onStaging = createOnStaging(sl)
      , pr =
          { labels: [ 'ready-for-staging' ]
          , addStatus: function (options, cb) {
              beenToStagingCheckCalled = true
              var expected =
                    { context: 'Been to Staging Check'
                    , description: 'has this been to staging?'
                    , state: 'success'
                    }
              assert.deepEqual(options, expected)
              cb()
            }
          , addComment: function (c, cb) {
              cb()
            }
          }
      , comment = {}

    onStaging(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(beenToStagingCheckCalled, true, 'should have had been to staging check applied')
      done()
    })
  })

  it('should not add been to staging status if release PR does not have "ready-for-staging"', function (done) {
    createOnStaging.__set__('determinePullsInRelease', function () { return [] })
    var beenToStagingCheckCalled = false
      , openPulls = []
      , sl =
          { repoManager: function () {
              function getOpenPulls (cb) {
                cb(null, openPulls)
              }
              return { getOpenPulls: getOpenPulls }
            }
          }
      , onStaging = createOnStaging(sl)
      , pr =
          { labels: []
          , addStatus: function (options, cb) {
              beenToStagingCheckCalled = true
              cb()
            }
          , addComment: function (c, cb) {
              cb()
            }
          }
      , comment = {}

    onStaging(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(beenToStagingCheckCalled, false, 'should not have had been to staging check applied')
      done()
    })
  })

  it('should add completion comment to release PR when all actions complete', function (done) {
    createOnStaging.__set__('determinePullsInRelease', function () { return [] })
    var addCommentCalled = false
      , openPulls = []
      , sl =
          { repoManager: function () {
              function getOpenPulls (cb) {
                cb(null, openPulls)
              }
              return { getOpenPulls: getOpenPulls }
            }
          }
      , onStaging = createOnStaging(sl)
      , pr =
          { labels: []
          , addStatus: function (options, cb) {
              cb()
            }
          , addComment: function (c, cb) {
              addCommentCalled = true
              assert.equal(c, 'Successfully marked as on staging')
              cb()
            }
          }
      , comment = { author: 'dave' }

    onStaging(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'should have added a comment')
      done()
    })
  })
})
