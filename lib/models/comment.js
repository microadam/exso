module.exports = Comment

function Comment(data) {
  this.body = data.comment.body
  this.author = data.comment.user.login
  this.issueAuthor = data.issue.user.login
  this.issueNumber = data.issue.number
  this.repoOwner = data.repository.owner.login
  this.repoName = data.repository.name
}
