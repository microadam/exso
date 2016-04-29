var assert = require('assert')
  , updateMasterMergeStatus = require('../../lib/update-master-merge-status')

describe('update-master-merge-status', function () {

  it('should update status if PR is mergeable and it does not have the need-merge label', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: []
          , isMergeable: function (cb) {
              cb(null, true)
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options
              , { context: 'Outdated Check'
                , description: 'is master merge required?'
                , state: 'success'
                }
              )
              cb()
            }
          }

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should update status if PR is not mergeable and it has the need-merge label', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: [ 'needs-master-merge' ]
          , isMergeable: function (cb) {
              cb(null, false)
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options
              , { context: 'Outdated Check'
                , description: 'is master merge required?'
                , state: 'failure'
                }
              )
              cb()
            }
          }

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should add the need-merge label and a comment if PR is ' +
      'not mergeable and it does not have the need-merge label', function (done) {

    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { author: 'dave'
          , labels: []
          , isMergeable: function (cb) {
              cb(null, false)
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave PR needs to have `master` merged in')
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'needs-master-merge' ])
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options
              , { context: 'Outdated Check'
                , description: 'is master merge required?'
                , state: 'failure'
                }
              )
              cb()
            }
          }

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, true, 'comment should have been added')
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should remove the need-merge label if PR is mergeable and it has the need-merge label', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { labels: [ 'needs-master-merge' ]
          , isMergeable: function (cb) {
              cb(null, true)
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'needs-master-merge')
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              cb()
            }
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , addStatus: function (options, cb) {
              addStatusCalled = true
              assert.deepEqual(options
              , { context: 'Outdated Check'
                , description: 'is master merge required?'
                , state: 'success'
                }
              )
              cb()
            }
          }

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

})
