var assert = require('assert')
  , createTriggerPhraseChecker = require('../../lib/trigger-phrase-checker')

describe('trigger-phrase-checker', function () {

  it('should return nothing if @<bot_name> is not the first part of the phrase', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('something @merge-user add to release')

    assert.deepEqual(actionToTake, null)
  })

  it('should return nothing for an in invalid trigger phrase', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user add to releases')

    assert.deepEqual(actionToTake, null)
  })

  it('should return an action for "add to release"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user add to release')

    assert.deepEqual(actionToTake, { name: 'addToRelease', value: null })
  })

  it('should return an action for "add to release <name>"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user add to release dave-test')

    assert.deepEqual(actionToTake, { name: 'addToRelease', value: 'dave-test' })
  })

  it('should not return an action for "add to release <number>"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user add to release 22')

    assert.deepEqual(actionToTake, null)
  })

  it('should return an action for "add to release #<number>"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user add to release #22')

    assert.deepEqual(actionToTake, { name: 'addToRelease', value: 22 })
  })

  it('should return an action for "remove from release #<number>"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user remove from release #22')

    assert.deepEqual(actionToTake, { name: 'removeFromRelease', value: 22 })
  })

  it('should return an action for "merged into release #<number>"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user merged into release #22')

    assert.deepEqual(actionToTake, { name: 'addToRelease', value: 22 })
  })

  it('should return an action for "ready for staging"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user ready for staging')

    assert.deepEqual(actionToTake, { name: 'readyForStaging', value: null })
  })

  it('should return an action for "on staging"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user on staging')

    assert.deepEqual(actionToTake, { name: 'onStaging', value: null })
  })

  it('should return an action for "ready for production"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user ready for production')

    assert.deepEqual(actionToTake, { name: 'readyForProduction', value: null })
  })

  it('should return an action for "on production"', function () {
    var sl =
          { authedUser: { username: 'merge-user' }
          }
      , checkTriggerPhrase = createTriggerPhraseChecker(sl)
      , actionToTake = checkTriggerPhrase('@merge-user on production')

    assert.deepEqual(actionToTake, { name: 'onProduction', value: null })
  })

})
