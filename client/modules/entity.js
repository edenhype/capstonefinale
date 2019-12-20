class Entity {
  constructor (data) {
    this.eID = Entity.inactiveIndices.length ?
      Entity.inactiveIndices.pop() :
      Entity.entityArr.push(this) - 1

    this.name = data[0] || 'dummy'
    this.type = data[1] || Entity.Enum.POINTS
    this.positionX = data[2] || 0
    this.positionY = data[3] || 0
    this.rotation = data[4] || 0
    this.score = data[5] || this.type === Entity.Enum.POINTS ? 1 : 0

    if (this.type === Entity.Enum.POINTS) {
      this.specificArr = Entity.pointsArr
      this.specificInactiveIndexArr = Entity.inactivePointsIndices
    } else if (this.type === Entity.Enum.ANGERY) {
      this.specificArr = Entity.angeryArr
      this.specificInactiveIndexArr = Entity.inactiveAngeryIndices
    } else if (this.type === Entity.Enum.PLAYER)  {
      this.specificArr = Entity.playerArr
      this.specificInactiveIndexArr = Entity.inactivePlayerIndices
    }

    this.specificIndex = this.specificInactiveIndexArr.length ?
      this.specificInactiveIndexArr.pop() :
      this.specificArr.push(this.eID) - 1
  }
}
Entity.Enum = {POINT: 0, ANGERY: 1, PLAYER: 2}
Entity.pointsArr = []
Entity.inactivePointsIndices = []
Entity.angeryArr = []
Entity.inactiveAngeryIndices = []
Entity.playerArr = []
Entity.inactivePlayerIndices = []
Entity.entityArr = []
Entity.inactiveIndices = []
Entity.pointsRadius = 0.5
Entity.angeryRadius = 0.5
Entity.playerRadius = 1
Entity.BoardSize = 20
Entity.toDeg = 180 / Math.PI
Entity.toRad = Math.PI / 180

module.exports = Entity