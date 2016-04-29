module.exports = createReleaseCreator

var randomWord = require('random-words')
  , generateDescription = require('./release-description-generator')()
  , applySemverLabel = require('./semver-labeler')()

function createReleaseCreator () {

  function createNewRelease (releaseNameNumber, pr, comment, repoManager, cb) {
    var releaseName = releaseNameNumber || randomWord() + '-' + randomWord()
      , branchName = 'release/' + releaseName

    repoManager.createBranch(branchName, pr.headSha, function (error) {
      if (error) return cb(error)
      var title = 'Release: ' + releaseName
        , body = generateDescription('', pr)

      repoManager.createPull(title, body, branchName, function (error, releasePr) {
        if (error) return cb(error)
        var commentToAdd = '@' + comment.author + ' Release #' + releasePr.number + ' `' +
              releaseName + '` created with this PR successfully merged.'
        addSemverLabelAndComment(pr, releasePr, commentToAdd, cb)
      })
    })
  }

  function addSemverLabelAndComment (originalPr, releasePr, commentBody, cb) {
    applySemverLabel(releasePr, function (error) {
      if (error) return cb(error)
      originalPr.addComment(commentBody, cb)
    })
  }

  return createNewRelease
}
