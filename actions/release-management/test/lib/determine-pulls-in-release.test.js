var assert = require('assert')
  , determinePullsInRelease = require('../../lib/determine-pulls-in-release')

describe('release-management determine pulls in release', function () {

  it('should return an array of Pull Request numbers', function () {
    var pr =
          { body: 'This release contains:\r\n\r\nFixes:\r\n\r\n' +
              '- #20 `[FD #2012] Fix some strange issue`\r\n' +
              '- #28 `[FD #2013] Fix some other issue`\r\n\r\n' +
              'Features:\r\n\r\n- #26 `[PT #12432313] Implement my awesome feature`' +
              '\r\n- #23 `[PT #12432453] Implement my other awesome feature`'
          }
      , pulls = determinePullsInRelease(pr)

    assert.deepEqual(pulls, [ 20, 28, 26, 23 ])
  })

})
