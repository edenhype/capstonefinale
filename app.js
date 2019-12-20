const Entity = require('./server/server-entity')
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 2001

app.use('/', express.static(__dirname + '/client'))


let timer = 0, agSwitch = 0
let i = 20

while(i--) {
  new Entity([0, Entity.Enum.POINTS, Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5, Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5])

  if(i % 2) new Entity([0, Entity.Enum.ANGERY, Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5, Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5])
}

io.on('connection', client => {
  client.on('register', data => {
    let ent

    if (Entity.entityArr[data[0]] && Entity.entityArr[data[0]].active && !Entity.entityArr[data[0]].connected)
      ent = Entity.entityArr[data[0]]
    else
      ent = new Entity([data[1], Entity.Enum.PLAYER])
    
    ent.name = data[1] || ent.name
    ent.connected = true
  
    client.emit('registered', [ent.eID, ent.name])
    client.on('data', d => d[0] ? ent.lookAt(d[1], d[2]) : ent.setMoving(d[1]))
    client.on('disconnect', () => {
      if (!ent) return

      ent.connected = false
      setTimeout(() => !ent.connected && ent.deactivate(), 3000)
    })
  })
})

setInterval(() => {
  timer += 0.017

  Entity.playerArr.forEach(pIndex => {
    const p = Entity.entityArr[pIndex]

    if (!p || !p.active) return

    if (p.score < 1) p.score += 0.017

    if (p.moving) {
      p.positionX = Math.min(Entity.BoardSize * 0.5, Math.max(-Entity.BoardSize * 0.5, p.positionX + p.moveDir[0] * p.speed))
      p.positionY = Math.min(Entity.BoardSize * 0.5, Math.max(-Entity.BoardSize * 0.5, p.positionY + p.moveDir[1] * p.speed))
    }
  })

  Entity.pointsArr.forEach(ptIndex => {
    const pt = Entity.entityArr[ptIndex]

    if (!pt || !pt.active) return

    pt.rotation += timer

    Entity.playerArr.forEach(pIndex => {
      const p = Entity.entityArr[pIndex]
  
      if (!p || !p.active) return

      if (p.collidingWith(pt)) {
        p.score++
  
        pt.positionX = Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5
        pt.positionY = Math.random() * Entity.BoardSize - Entity.BoardSize * 0.5
        
        return
      }
    })
  })

  Entity.angeryArr.forEach(agIndex => {
    const ag = Entity.entityArr[agIndex]

    if (!ag || !ag.active) return
    
    ag.lookAt(Math.cos(timer), Math.sin(timer))

    if (timer > agSwitch) ag.speed *= Math.random() > 0.5 ? 1 : -1

    if (ag.score < 1) ag.score += 0.017
    else {
      ag.score = 1
      ag.positionX = Math.min(Entity.BoardSize * 0.5, Math.max(-Entity.BoardSize * 0.5, ag.positionX + ag.moveDir[0] * ag.speed))
      ag.positionY = Math.min(Entity.BoardSize * 0.5, Math.max(-Entity.BoardSize * 0.5, ag.positionY + ag.moveDir[1] * ag.speed))
    }

    Entity.playerArr.forEach(pIndex => {
      const p = Entity.entityArr[pIndex]
  
      if (!p || !p.active) return

      if (ag.score >= 1 && p.score >= 1 && p.collidingWith(ag)) {
        p.positionX = 0
        p.positionY = 0
        p.score = 0

        return
      }
    })
  })

  if (timer > agSwitch) agSwitch++

  io.emit('update', [].concat(
    ...(Entity.entityArr.filter(e => e.active).map(e => e.serialize()))))
}, 17)

server.listen(port)
console.log(`listening at port ${port}`)