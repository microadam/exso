module.exports = createTriggerPhraseChecker

function createTriggerPhraseChecker (serviceLocator) {

  var phrases =
        [ /^add to release$/
        , /^add to release ([A-Za-z-]+)$/
        , /^add to release (#[0-9]+)$/
        , /^merged into release (#[0-9]+)$/
        , /^remove from release (#[0-9]+)$/
        , /^ready for staging$/
        , /^on staging$/
        , /^ready for production$/
        , /^on production$/
        ]
    , mapping =
        [ 'addToRelease'
        , 'addToRelease'
        , 'addToRelease'
        , 'addToRelease'
        , 'removeFromRelease'
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
          , releaseNameNumber = matches ? matches[1] : null
          , action = mapping[index]

        if (releaseNameNumber && releaseNameNumber.indexOf('#') === 0) {
          releaseNameNumber = releaseNameNumber.replace('#', '')
          releaseNameNumber = parseInt(releaseNameNumber, 10)
        }
        actionToTake = { name: action, value: releaseNameNumber }
        return true
      }
    })

    return actionToTake
  }

  return checkTriggerPhrase
}
