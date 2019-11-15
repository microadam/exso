module.exports = createTriggerPhraseChecker

function createTriggerPhraseChecker (serviceLocator) {

  var phrases =
        [ /^add to release( force)?$/
        , /^add to release ([A-Za-z-]+)( force)?$/
        , /^add to release (#[0-9]+)( force)?$/
        , /^merged into release (#[0-9]+)$/
        , /^ready for staging( force)?$/
        , /^on staging$/
        , /^ready for production( force)?$/
        , /^on production$/
        ]
    , mapping =
        [ 'addToRelease'
        , 'addToRelease'
        , 'addToRelease'
        , 'addToRelease'
        , 'readyForStaging'
        , 'onStaging'
        , 'readyForProduction'
        , 'onProduction'
        ]

  function checkTriggerPhrase (comment) {
    comment = comment.trim()
    var suffix = '@' + serviceLocator.authedUser.username + ' '
      , actionToTake = null

    if (comment.indexOf(suffix) !== 0) return null

    comment = comment.replace(suffix, '')

    phrases.some(function (phrase, index) {
      if (phrase.test(comment)) {
        var matches = comment.match(phrase)
          , releaseNameNumber = matches && matches[1] !== ' force' ? matches[1] : null
          , action = mapping[index]
          , skipStatusChecks = false

        if (/.* force$/.test(comment)) {
          skipStatusChecks = true
        }

        if (releaseNameNumber && releaseNameNumber.indexOf('#') === 0) {
          releaseNameNumber = releaseNameNumber.replace('#', '')
          releaseNameNumber = parseInt(releaseNameNumber, 10)
        }

        actionToTake = { name: action, value: releaseNameNumber, skipStatusChecks: skipStatusChecks }
        return true
      }
    })

    return actionToTake
  }

  return checkTriggerPhrase
}
