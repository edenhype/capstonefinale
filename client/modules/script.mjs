import initTHREE from './three-handler.mjs'
import initUI from './ui-handler.mjs'

window.addEventListener('DOMContentLoaded', _ => {
  let threeHandler = initTHREE(document.querySelector('.game-container'), 20)
  window.addEventListener('resize', _ => (threeHandler.resizeCanvas)())
  threeHandler.resizeCanvas()

  const playerGeo = new THREE.BoxGeometry(1, 1, 1)
  const playerMat = new THREE.MeshBasicMaterial({color: 0xaaf0ff})
  const angeryGeo = new THREE.SphereGeometry(0.5)
  const angeryMat = new THREE.MeshBasicMaterial({color: 0xff0000})
  const pointsGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25)
  const pointsMat = new THREE.MeshBasicMaterial({color: 0xffffff})

  const entityList = []

  let uiHandler = initUI('.score-display-container', '.name-prompt-container')

  const socket = io({transports: ['websocket'], upgrade: false})

  socket.on('connect', () => {
    socket.on('registered', uiHandler.register.bind(uiHandler))

    socket.on('update', data => {
      let i = 0
      
      while (i < data.length) {
        let ent = entityList.find(e => e.eID === data[i]);
        let entDidntExist = !ent

        if (entDidntExist) {
          if (data[i + 2] === 1)
            ent = new THREE.Mesh(angeryGeo, angeryMat)
          else if(data[i + 2] === 2)
            ent = new THREE.Mesh(playerGeo, playerMat)
          else
            ent = new THREE.Mesh(pointsGeo, pointsMat)
        }

        ent.eID = data[i]
        ent.name = data[i + 1]
        ent.type = data[i + 2]
        ent.score = data[i + 6]
        
        if (ent.eID == uiHandler.playerID) {
          uiHandler.playerScore = ent.score

          threeHandler.playerGroup.position.set(data[i + 3], data[i + 4], 0)
          
          if (entDidntExist) {
            threeHandler.add(ent, 1)
            ent.position.set(0, 0, 0)
          }

          ent.rotation.z = data[i + 5] * Math.PI / 180
        } else {
          ent.position.set(data[i + 3], data[i + 4], 0)
          ent.rotation.z = data[i + 5] * Math.PI / 180
          
          entDidntExist && threeHandler.add(ent)
        }

        entDidntExist && entityList.push(ent)
        i += 7
      }
      
      entityList.sort((e1, e2) => e2.score - e1.score)
      uiHandler.updateScoreboard(entityList.filter(e => e.type === 2).slice(0, 3))
    })
  })

  uiHandler.onNameInput(name => socket.emit('register', [uiHandler.playerID, name]))
  window.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener('touchstart', () => socket.emit('data', [0, 1]))
  window.addEventListener('touchend', () => socket.emit('data', [0, 0]))
  window.addEventListener('touchmove', e => {
    let pX = e.touches[0].clientX - document.body.clientWidth * 0.5
    let pY = document.body.clientHeight * 0.5 - e.touches[0].clientY
    let w = document.body.clientWidth, h = document.body.clientHeight
  
    if (w < h) [pX, pY] = [-pY, pX]

    socket.emit('data', [1, pX, pY])
  })
  window.addEventListener('mousedown', () => socket.emit('data', [0, 1]))
  window.addEventListener('mouseup', () => socket.emit('data', [0, 0]))
  window.addEventListener('mousemove', e =>
    socket.emit('data', [1, e.clientX - document.body.clientWidth * 0.5, document.body.clientHeight * 0.5 - e.clientY]))

  threeHandler.animate()
})