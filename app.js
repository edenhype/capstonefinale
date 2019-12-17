'use strict'

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 2001

let timer = 0, agSwitch = 0

const sqOf = x => x * x
const sqDistBetween = (a, b) => sqOf(a[0] - b[0]) + sqOf(a[1] - b[1])
const sqDistFromPointToLine = (p, a, b) => {
  const sqLineLength = sqDistBetween(a, b)

  if (sqLineLength === 0) return sqDistBetween(p, a)

  const t = Math.max(0, Math.min(1,
    ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / sqLineLength))

  return sqDistBetween(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
}

class Entity {
  constructor (name, entityType = Entity.Enum.POINT, pX = 0, pY = 0) {
    this.name = name == true ? name : (+("" + Date.now() + Entity.entityArr.length))
    this.active = true

    this.type = entityType
    this.position = [pX, pY]
    this.moveDir = [0, 0]

    this.invincibility = 1
    this.gamePoints = 1
    
    this.moving = 0
    this.speed = 0.1

    this.radius = this.type === Entity.Enum.POINT ? 0.25 : this.type === Entity.Enum.ANGERY ? 0.5 : 1
    this.lineVector = [0, 0]
    this.viewRadius = 100

    this.type === Entity.Enum.POINT && Entity.pointsArr.push(this)
    this.type === Entity.Enum.ANGERY && Entity.angeryArr.push(this)
    this.type === Entity.Enum.PLAYER && Entity.playerArr.push(this)
    Entity.entityArr.push(this)
  }

  lookAt(x, y) {
    const lookLen = Math.sqrt(sqOf(x) + sqOf(y))

    this.moveDir = lookLen ? [x / lookLen, y / lookLen] : [0, 1]
  }

  setMoving(moving) {
    this.moving = moving
  }

  canSee(ent) {
    return sqDistBetween(ent.position, this.position) <= sqOf(this.viewRadius + ent.radius)
  }

  collidingWith(ent) {
    return sqDistBetween(ent.position, this.position) <= sqOf(this.radius + ent.radius)
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
}
Entity.Enum = {POINT: 0, ANGERY: 1, PLAYER: 2}
Entity.playerArr = []
Entity.pointsArr = []
Entity.angeryArr = []
Entity.entityArr = []

let i = 20

while(i--) {
  new Entity(0, 0, Math.random() * 20 - 10, Math.random() * 20 - 10)

  if(i % 2) new Entity(0, Entity.Enum.ANGERY, Math.random() * 20 - 10, Math.random() * 20 - 10)
}
    
app.use(express.static(__dirname))

io.on('connection', client => {
  client.on('register', name => {
    let entity = Entity.playerArr.find(e => e.name == name) || new Entity(0, Entity.Enum.PLAYER)
  
    entity.active = true
  
    client.emit('name', entity.name)
    client.on('data', d => d[0] ? entity.lookAt(d[1], d[2]) : entity.setMoving(d[1]))
    client.on('disconnect', () => entity.active = false)
  })
})

setInterval(() => {
  timer += 0.017

  Entity.playerArr.forEach(p => {
    if (!p.active) return

    if (p.invincibility) p.invincibility -= 0.017
    else p.invincibility = 0

    if (p.moving) {
      p.position[0] = Math.min(10, Math.max(-10, p.position[0] + p.moveDir[0] * p.speed))
      p.position[1] = Math.min(10, Math.max(-10, p.position[1] + p.moveDir[1] * p.speed))
    }
  })

  Entity.pointsArr.forEach(pt => {
    pt.lookAt(Math.cos(timer), Math.sin(timer))

    Entity.playerArr.forEach(p => {
      if (p.collidingWith(pt)) {
        p.gamePoints++
  
        pt.position[0] = Math.random() * 20 - 10
        pt.position[1] = Math.random() * 20 - 10
        
        return
      }
    })
  })

  Entity.angeryArr.forEach(ag => {
    ag.lookAt(Math.cos(timer), Math.sin(timer))

    if (timer > agSwitch) ag.speed *= Math.random() > 0.5 ? 1 : -1

    if (ag.invincibility) ag.invincibility -= 0.017 
    else ag.invincibility = 0

    if (!ag.invincibility) {
      ag.position[0] = Math.min(10, Math.max(-10, ag.position[0] + ag.moveDir[0] * ag.speed))
      ag.position[1] = Math.min(10, Math.max(-10, ag.position[1] + ag.moveDir[1] * ag.speed))
    }

    Entity.playerArr.forEach(p => {
      if (!ag.invincibility && !p.invincibility && p.collidingWith(ag)) {
        p.position = [0, 0]
        p.gamePoints = 1
        p.invincibility = 1

        return
      }
    })
  })

  if (timer > agSwitch) agSwitch++

  io.emit('update', [].concat(
      ...(Entity.entityArr.map(e => [e.type, e.name, ...e.position, ...e.moveDir, e.gamePoints]))
    )
  )
}, 33)

server.listen(port)
console.log(`listening at port ${port}`)

