var assert = require('assert')
  , createChangelogGenerator = require('../../lib/changelog-generator')

describe('changelog generator', function () {

  it('should generate changelog from nothing', function () {
    var generateChangelog = createChangelogGenerator()
      , currentBody = ''
      , pr =
          { number: 12
          , title: '[GH #12] My New Feature'
          , branch: 'feature/new-feature'
          }
      , changelog = generateChangelog(currentBody, pr)

    assert.equal(changelog, 'This release contains:\r\n\r\nFeatures:\r\n\r\n- #12 `[GH #12] My New Feature`')
  })

  it('should generate changelog with fixes and features', function () {
    var generateChangelog = createChangelogGenerator()
      , currentBody = 'This release contains:\r\n\r\nFixes:\r\n\r\n'
          + '- #20 `[FD #2012] Fix some strange issue`\r\n'
          + '- #28 `[FD #2013] Fix some other issue`\r\n\r\n'
          + 'Features:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`'
          + '\r\n- #23 `[PT #12432453] Implement my other awesome feature`'
      , pr =
          { number: 12
          , title: '[GH #12] My New Feature'
          , branch: 'feature/new-feature'
          }
      , changelog = generateChangelog(currentBody, pr)

    assert.equal(changelog, 'This release contains:\r\n\r\nFixes:\r\n\r\n- '
      + '#20 `[FD #2012] Fix some strange issue`\r\n- #28 `[FD #2013] Fix some other issue`'
      + '\r\n\r\nFeatures:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`\r\n'
      + '- #23 `[PT #12432453] Implement my other awesome feature`\r\n- #12 `[GH #12] My New Feature`')
  })

  it('should generate changelog with only fixes', function () {
    var generateChangelog = createChangelogGenerator()
      , currentBody = 'This release contains:\r\n\r\nFixes:\r\n\r\n'
          + '- #20 `[FD #2012] Fix some strange issue`\r\n'
          + '- #28 `[FD #2013] Fix some other issue`'
      , pr =
          { number: 12
          , title: '[GH #12] My New Bug Fix'
          , branch: 'bug/new-fix'
          }
      , changelog = generateChangelog(currentBody, pr)

    assert.equal(changelog, 'This release contains:\r\n\r\nFixes:\r\n\r\n'
      + '- #20 `[FD #2012] Fix some strange issue`\r\n- #28 `[FD #2013] Fix some other issue`'
      + '\r\n- #12 `[GH #12] My New Bug Fix`')
  })

  it('should generate changelog with only features', function () {
    var generateChangelog = createChangelogGenerator()
      , currentBody = 'This release contains:\r\n\r\n'
          + 'Features:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`'
          + '\r\n- #23 `[PT #12432453] Implement my other awesome feature`'
      , pr =
          { number: 12
          , title: '[GH #12] My New Feature'
          , branch: 'feature/new-feature'
          }
      , changelog = generateChangelog(currentBody, pr)

    assert.equal(changelog, 'This release contains:\r\n\r\nFeatures:\r\n\r\n'
      + '- #26 `[PT #12432313] Implement my awesome feature`\r\n'
      + '- #23 `[PT #12432453] Implement my other awesome feature`\r\n'
      + '- #12 `[GH #12] My New Feature`')
  })

  it('should not add a PR that already exists to the changelog', function () {
    var generateChangelog = createChangelogGenerator()
      , currentBody = 'This release contains:\r\n\r\nFixes:\r\n\r\n'
          + '- #20 `[FD #2012] Fix some strange issue`\r\n'
          + '- #28 `[FD #2013] Fix some other issue`'
      , pr =
          { number: 28
          , title: '[FD #2013] Fix some other issue'
          , branch: 'bug/new-fix'
          }
      , changelog = generateChangelog(currentBody, pr)

    assert.equal(changelog, 'This release contains:\r\n\r\nFixes:\r\n\r\n'
      + '- #20 `[FD #2012] Fix some strange issue`\r\n- #28 `[FD #2013] Fix some other issue`')
  })

})
