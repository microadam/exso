var assert = require('assert')
  , rewire = require('rewire')
  , createOnProduction = rewire('../../lib/on-production')

describe('release-management on production', function () {

  it('should comment with message if release PR does not have "ready-for-production"', function (done) {
    createOnProduction.__set__('determinePullsInRelease', function () { return [] })
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
      , onProduction = createOnProduction(sl)
      , pr =
          { labels: []
          , addStatus: function (options, cb) {
              cb()
            }
          , addComment: function (c, cb) {
              addCommentCalled = true
              assert.equal(c, '@dave This release has not been made ready' +
                ' for production. Ensure it has the `ready-for-production` label.')
              cb()
            }
          }
      , comment = { author: 'dave' }

    onProduction(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'should have added a comment')
      done()
    })
  })

  it('should correctly update the labels on all open pulls', function (done) {
    createOnProduction.__set__('determinePullsInRelease', function () { return [ '1', '2', '4' ] })
    var onProductionLabelAddedCallCount = 0
      , readyForProductionLabelRemovedCallCount = 0
      , inReleaseNotMarkedAsOnProduction =
          { number: '1'
          , labels: []
          , addLabels: function (labels, cb) {
              onProductionLabelAddedCallCount++
              assert.deepEqual(labels, [ 'on-production' ])
              cb()
            }
          }
      , inReleaseMarkedAsOnProduction =
          { number: '2'
          , labels: [ 'on-production' ]
          , addLabels: function (labels, cb) {
              onProductionLabelAddedCallCount++
              cb()
            }
          }
      , notInReleaseNotMarkedAsOnProduction =
          { number: '3'
          , labels: []
          , addLabels: function (labels, cb) {
              onProductionLabelAddedCallCount++
              cb()
            }
          }
      , inReleaseReadyForProduction =
          { number: '4'
          , labels: [ 'ready-for-production' ]
          , addLabels: function (labels, cb) {
              onProductionLabelAddedCallCount++
              cb()
            }
          , removeLabel: function (label, cb) {
              readyForProductionLabelRemovedCallCount++
              assert.equal(label, 'ready-for-production')
              cb()
            }
          }
      , openPulls =
          [ inReleaseNotMarkedAsOnProduction
          , inReleaseMarkedAsOnProduction
          , notInReleaseNotMarkedAsOnProduction
          , inReleaseReadyForProduction
          ]
      , sl =
          { repoManager: function () {
              function getOpenPulls (cb) {
                cb(null, openPulls)
              }
              return { getOpenPulls: getOpenPulls }
            }
          }
      , onProduction = createOnProduction(sl)
      , pr =
          { labels: [ 'ready-for-production' ]
          , addStatus: function (options, cb) {
              cb()
            }
          , addComment: function (c, cb) {
              cb()
            }
          }
      , comment = { author: 'dave' }

    onProduction(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(onProductionLabelAddedCallCount, 2)
      assert.equal(readyForProductionLabelRemovedCallCount, 1)
      done()
    })
  })

  it('should comment with completion message when all tasks complete', function (done) {
    createOnProduction.__set__('determinePullsInRelease', function () { return [] })
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
      , onProduction = createOnProduction(sl)
      , pr =
          { labels: [ 'ready-for-production' ]
          , addStatus: function (options, cb) {
              cb()
            }
          , addComment: function (c, cb) {
              addCommentCalled = true
              assert.equal(c, 'Successfully marked as on production')
              cb()
            }
          }
      , comment = { author: 'dave' }

    onProduction(pr, comment, null, false, function (error) {
      if (error) return done(error)
      assert.equal(addCommentCalled, true, 'should have added a comment')
      done()
    })
  })

})
