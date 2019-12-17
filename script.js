'use strict'

window.addEventListener('DOMContentLoaded', _ => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x444444)
  scene.fog = new THREE.Fog(scene.background)

  const canvas = document.querySelector('canvas')
  const canvasContainer = document.querySelector('#game-container')

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: 1, gammaOutput: 1, gammaFactor: 2,
  })

  const camera = new THREE.PerspectiveCamera(
    75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  camera.position.z = 10
  camera.lookAt(0, 0, 0)

  window.addEventListener('resize', (_ => {
    let w = canvasContainer.offsetWidth, h = canvasContainer.offsetHeight

    if (w < h) [w, h] = [h, w]

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
  })())

  let gridHelper = new THREE.GridHelper(20, 15);
  gridHelper.lookAt(new THREE.Vector3(0, 1, 0))
  scene.add( gridHelper );

  const playerGeo = new THREE.BoxGeometry(1, 1, 1)
  const playerMat = new THREE.MeshBasicMaterial({color: 0xaaf0ff})
  const angeryGeo = new THREE.SphereGeometry(0.5)
  const angeryMat = new THREE.MeshBasicMaterial({color: 0xff0000})
  const pointsGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25)
  const pointsMat = new THREE.MeshBasicMaterial({color: 0xffffff})

  const entityList = []

  const playerGroup = new THREE.Group()

  playerGroup.add(camera)
  scene.add(playerGroup)

  const pointsScoreboard = document.querySelector('#points-scoreboard')
  const pointsDisplay = document.querySelector('#points-display')
  let playerPoints = 0

  const socket = io({transports: ['websocket'], upgrade: false})

  socket.on('connect', () => {
    let playerName = localStorage.getItem('name')

    socket.emit('register', playerName || 0)

    socket.on('name', name => {
      playerName = name
      localStorage.setItem('name', playerName)
    })

    socket.on('update', data => {
      let i = 0
      
      pointsScoreboard.innerHTML = ''
      
      while (i < data.length) {
        let ent = entityList.find(e => e.name === data[i + 1]);
        let entDidntExist = !ent

        if (entDidntExist) {
          if (data[i] === 1)
            ent = new THREE.Mesh(angeryGeo, angeryMat)
          else if(data[i] === 2)
            ent = new THREE.Mesh(playerGeo, playerMat)
          else
            ent = new THREE.Mesh(pointsGeo, pointsMat)
        }

        ent.type = data[i]
        ent.name = data[i + 1]
        ent.points = data[i + 6]

        if (ent.name == playerName) {
          playerGroup.position.set(data[i + 2], data[i + 3], 0)
          playerPoints = ent.points
          
          if (entDidntExist) {
            playerGroup.add(ent)
            ent.position.set(0, 0, 0)
          }

          ent.lookAt(playerGroup.position.clone().add(new THREE.Vector3(data[i + 4], data[i + 5], 0)))
        } else {
          ent.position.set(data[i + 2], data[i + 3], 0)
          ent.lookAt(ent.position.clone().add(new THREE.Vector3(data[i + 4], data[i + 5], 0)))
          
          entDidntExist && scene.add(ent)
        }

        entDidntExist && entityList.push(ent)
        i += 7
      }

      entityList.sort((ent1, ent2) => ent2.points - ent1.points)
      entityList.filter(e => e.type)
        .slice(0, 5)
        .forEach(ent => pointsScoreboard.innerHTML += `<li>${ent.name}: ${ent.points} points</li>`)

      pointsDisplay.innerHTML = `(you: ${playerPoints} points)`
    })
  })

  window.addEventListener('contextmenu', e => {
    e.preventDefault()
  })
  window.addEventListener('mousedown', e => {
    e.button === 2 && socket.emit('data', [0, 1])
  })
  window.addEventListener('mouseup', e => {
    e.button === 2 && socket.emit('data', [0, 0])
  })
  window.addEventListener('mousemove', e => {
    socket.emit('data', [1, e.clientX - document.body.clientWidth * 0.5, document.body.clientHeight * 0.5 - e.clientY])
  })

  function animate() {
    requestAnimationFrame(animate)

    renderer.render(scene, camera)
  }

  animate(0)
})