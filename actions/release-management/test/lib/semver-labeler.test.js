var assert = require('assert')
  , applySemverLabel = require('../../lib/semver-labeler')()

describe('semver labeler', function () {

  it('should not add or remove any labels if they are as they should be', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
            'Fixes:\r\n\r\n' +
            '- #20 `[FD #2012] Fix some strange issue`\r\n' +
            '- #28 `[FD #2013] Fix some other issue`'
      , pr =
          { body: body
          , labels: [ 'semver/patch' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      done()
    })
  })

  it('should label PR with "semver/patch" if only contains fixes', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
          'Fixes:\r\n\r\n' +
          '- #20 `[FD #2012] Fix some strange issue`\r\n' +
          '- #28 `[FD #2013] Fix some other issue`'
      , pr =
          { body: body
          , labels: [ 'semver/major' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'semver/patch' ])
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/major')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should label PR with "semver/minor" if more than 0 features are present', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
          'Fixes:\r\n\r\n' +
          '- #20 `[FD #2012] Fix some strange issue`\r\n' +
          '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
          'Features:\r\n\r\n' +
          '- #26 `[PT #12432313] Implement my awesome feature`'
      , pr =
          { body: body
          , labels: [ 'semver/major' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'semver/minor' ])
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/major')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should label PR with "semver/minor" if less than 10 features are present', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
            'Fixes:\r\n\r\n' +
            '- #20 `[FD #2012] Fix some strange issue`\r\n' +
            '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
            'Features:\r\n\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
            '- #26 `[PT #12432313] Implement my awesome feature`'
      , pr =
          { body: body
          , labels: [ 'semver/major' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'semver/minor' ])
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/major')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should label PR with "semver/major" if 10 features are present', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
          'Fixes:\r\n\r\n' +
          '- #20 `[FD #2012] Fix some strange issue`\r\n' +
          '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
          'Features:\r\n\r\n' +
          '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
          '- #27 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`'
      , pr =
          { body: body
          , labels: [ 'semver/minor' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'semver/major' ])
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/minor')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should label PR with "semver/major" if more than 10 features are present', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , body = 'This release contains:\r\n\r\n' +
          'Fixes:\r\n\r\n' +
          '- #20 `[FD #2012] Fix some strange issue`\r\n' +
          '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
          'Features:\r\n\r\n' +
          '- #26 `[PT #12432313] Implement my awesome feature`\r\n' +
          '- #27 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`\r\n' +
          '- #23 `[PT #12432453] Implement my other awesome feature`'
      , pr =
          { body: body
          , labels: [ 'semver/minor' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              assert.deepEqual(labels, [ 'semver/major' ])
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/minor')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, true, 'label should have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should remove existing semver label if one exists', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , pr =
          { body: ''
          , labels: [ 'semver/major' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              assert.equal(label, 'semver/major')
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(removeLabelCalled, true, 'label should have been removed')
      done()
    })
  })

  it('should not remove existing label if it is not a semver label', function (done) {
    var addLabelsCalled = false
      , removeLabelCalled = false
      , pr =
          { body: ''
          , labels: [ 'test' ]
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          , removeLabel: function (label, cb) {
              removeLabelCalled = true
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      assert.equal(removeLabelCalled, false, 'label should not have been removed')
      done()
    })
  })

  it('should not add a label if semver cannot be determined', function (done) {
    var addLabelsCalled = false
      , pr =
          { body: ''
          , labels: []
          , addLabels: function (labels, cb) {
              addLabelsCalled = true
              cb()
            }
          }
    applySemverLabel(pr, function (error) {
      if (error) return done(error)
      assert.equal(addLabelsCalled, false, 'label should not have been added')
      done()
    })
  })

})
