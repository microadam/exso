module.exports = Branch

function Branch(data) {
  this.ref = data.ref
  this.owner = data.repository.owner.name
  this.repo =  data.repository.name
}
