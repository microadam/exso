var assert = require('assert')
  , rewire = require('rewire')
  , updateMasterMergeStatus = rewire('../../lib/update-master-merge-status')

describe('update-master-merge-status', function () {

  var reset = null

  afterEach(function () {
    reset()
  })

  it('should update status to success if PR did not need ' +
  'merging and it does not have the need-merge label', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { headSha: 'abc123'
          , labels: []
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb()
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should update status to failure if PR is not mergeable and it has the need-merge label', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { headSha: 'abc123'
          , labels: [ 'needs-master-merge' ]
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb({ code: 409 })
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should add the need-merge label and a comment to the author if PR is ' +
      'not mergeable and it does not have the need-merge label and has no assignee', function (done) {

    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { author: 'dave'
          , labels: []
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb({ code: 409 })
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, true, 'comment should have been added')
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should add the need-merge label and a comment to the assignee if PR is ' +
      'not mergeable and it does not have the need-merge label and has an assignee', function (done) {

    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { author: 'dave'
          , assignee: 'fred'
          , labels: []
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@fred PR needs to have `master` merged in')
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb({ code: 409 })
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

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
          { headSha: 'abc123'
          , labels: [ 'needs-master-merge' ]
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb()
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      assert.equal(addCommentCalled, false, 'comment should not have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

  it('should update status to success and add a comment that master has been merged', function (done) {
    var removeLabelCalled = false
      , addCommentCalled = false
      , addLabelsCalled = false
      , addStatusCalled = false
      , pr =
          { author: 'dave'
          , headSha: 'abc123'
          , labels: []
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          , addComment: function (comment, cb) {
              addCommentCalled = true
              assert.equal(comment, '@dave this PR has automatically had `master` merged in')
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
      , mockBranch =
          function () {
            this.merge = function (branch, cb) {
              cb(null, true)
            }
          }

    reset = updateMasterMergeStatus.__set__('Branch', mockBranch)

    updateMasterMergeStatus(pr, function () {
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      assert.equal(addCommentCalled, true, 'comment should have been added')
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(addStatusCalled, true, 'status should have been added')
      done()
    })
  })

})
