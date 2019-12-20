export default function initTHREE(canvasContainerElem, boardSize) {
  const canvas = canvasContainerElem.querySelector('canvas')

  if (!canvas) {
    console.error('where the canvas at sis???')
    return
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: 1, gammaOutput: 1, gammaFactor: 2})

  const playerGroup = new THREE.Group()

  scene.background = new THREE.Color(0x444444)
  scene.fog = new THREE.Fog(scene.background)

  camera.position.z = boardSize * 0.5
  camera.lookAt(0, 0, 0)

  playerGroup.add(camera)
  scene.add(playerGroup)

  const gridHelper = new THREE.GridHelper(boardSize, 15)
  gridHelper.lookAt(new THREE.Vector3(0, 1, 0))
  scene.add(gridHelper)

  return {
    canvas,
    scene,
    camera,
    renderer,
    playerGroup,
    add(object3D, isPlayer) {
      isPlayer ? this.playerGroup.add(object3D) : this.scene.add(object3D)
    },
    render() {
      this.renderer.render(this.scene, this.camera)
    },
    resizeCanvas() {
      let w = this.canvas.parentNode.offsetWidth, h = this.canvas.parentNode.offsetHeight
    
      if (w < h) [w, h] = [h, w]
      
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(w, h)
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this))

      this.render()
    }
  }
}