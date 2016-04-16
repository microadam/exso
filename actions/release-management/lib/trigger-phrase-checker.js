module.exports = createTriggerPhraseChecker

function createTriggerPhraseChecker(serviceLocator) {

  var phrases =
        [ /^add to release$/
        , /^add to release ([A-Za-z-]+)$/
        , /^add to release (#[0-9]+)$/
        , /^merged into release (#[0-9]+)$/
        , /^remove from release (#[0-9]+)$/
        ]
    , mapping =
        [ 'addToRelease'
        , 'addToRelease'
        , 'addToRelease'
        , 'markFailedMergeAsSuccessful'
        , 'removeFromRelease'
        ]

  function checkTriggerPhrase(comment) {
    comment = comment.trim()
    var suffix = '@' + serviceLocator.authedUser.username + ' '
    if (comment.indexOf(suffix) !== 0) return null

    comment = comment.replace(suffix, '')
    var actionToTake = null
    phrases.some(function (phrase, index) {
      if (phrase.test(comment)) {
        var matches = comment.match(phrase)
          , releaseNameNumber = matches ? matches[1] : null
          , action =  mapping[index]

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
