const Entity = require('../client/modules/entity.js')

const sqOf = x => x * x
const sqDistBetween = (a, b) => sqOf(a[0] - b[0]) + sqOf(a[1] - b[1])
// this could be useful for laser beams and other rectangular entities
// const sqDistFromPointToLine = (p, a, b) => {
//   const sqLineLength = sqDistBetween(a, b)

//   if (sqLineLength === 0) return sqDistBetween(p, a)

//   const t = Math.max(0, Math.min(1,
//     ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / sqLineLength))

//   return sqDistBetween(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
// }

class SEntity extends Entity {
  constructor(data) {
    super(data)
    this.connected = true
    this.active = true
    
    this.moving = 0
    this.speed = this.type === Entity.Enum.ANGERY ? 0.05 : 0.1
    this.moveDir = [1, 0]

    this.lineVector = [0, 0]
    this.viewRadius = 20
    this.radius = this.type === Entity.Enum.POINTS ?
      Entity.pointsRadius :
      this.type === Entity.Enum.ANGERY ? Entity.angeryRadius : Entity.playerRadius
  }

  lookAt(x, y) {
    const lookLen = Math.sqrt(sqOf(x) + sqOf(y))

    this.rotation = Math.atan2(y, x) * Entity.toDeg
    this.moveDir = lookLen ? [x / lookLen, y / lookLen] : [0, 1]
  }

  setMoving(moving) {
    this.moving = moving
  }

  canSee(ent) {
    return sqDistBetween([ent.positionX, ent.positionY], [this.positionX, this.positionY]) <= sqOf(this.viewRadius + ent.radius)
  }

  collidingWith(ent) {
    return sqDistBetween([ent.positionX, ent.positionY], [this.positionX, this.positionY]) <= sqOf(this.radius + ent.radius)
  }

  getVisibleEntities(entArr) {
    const visibleEntityArray = []

    entArr.forEach(ent =>
      this.canSee(ent) && visibleEntityArray.push(ent))

    return visibleEntityArray
  }

  getCollidingEntities(entArr) {
    const collidingEntityArray = []

    entArr.forEach(ent =>
      this.collidingWith(ent) && collidingEntityArray.push(ent))

    return collidingEntityArray
  }

  serialize() {
    return [this.eID, this.name, this.type, this.positionX, this.positionY, this.rotation, ~~this.score]
  }

  deactivate() {
    this.active = 0
    
    Entity.inactiveIndices.push(this.eID)
    
    this.specificArr[this.specificIndex] = -1
    this.specificInactiveIndexArr.push(this.specificIndex)
  }
}

module.exports = SEntity