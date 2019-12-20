import Entity from './entity.js'

export default class CEntity extends Entity{
    constructor(data) {
      super(data)


      // if (this.type === Entity.Enum.POINTS) {
      //   this.specificArr = Entity.pointsArr
      //   this.specificInactiveIndexArr = Entity.inactivePointsIndices
      // } else if (this.type === Entity.Enum.ANGERY) {
      //   this.specificArr = Entity.angeryArr
      //   this.specificInactiveIndexArr = Entity.inactiveAngeryIndices
      // } else if (this.type === Entity.Enum.PLAYER)  {
      //   this.specificArr = Entity.playerArr
      //   this.specificInactiveIndexArr = Entity.inactivePlayerIndices
      // }
    }
}
CEntity.playerGeo = new THREE.BoxGeometry(Entity.playerRadius, Entity.playerRadius, Entity.playerRadius)
CEntity.playerMat = new THREE.MeshBasicMaterial({color: 0xaaf0ff})
CEntity.angeryGeo = new THREE.SphereGeometry(Entity.angeryRadius)
CEntity.angeryMat = new THREE.MeshBasicMaterial({color: 0xff0000})
CEntity.pointsGeo = new THREE.BoxGeometry(Entity.pointsRadius, Entity.pointsRadius, Entity.pointsRadius)
CEntity.pointsMat = new THREE.MeshBasicMaterial({color: 0xffffff})