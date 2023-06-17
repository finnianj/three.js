import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'lil-gui'

const runProgram = () => {

  /**
   * Base
   */
  // Debug
  // const gui = new dat.GUI()
  // gui.close()

  // Canvas
  const canvas = document.querySelector('canvas.webgl')

  // Scene
  const scene = new THREE.Scene()

  // Galaxy
  const parameters = {
    count: 1000000,
    size: 0.01,
    radius: 10,
    branches: 3,
    spin: 1,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
  }

  let geometry = null;
  let material = null;
  let points = null;

  const generateGalaxy = () => {
    // Destroy old galaxy
    if (points !== null) {
      geometry.dispose()
      material.dispose()
      scene.remove(points)
    }
    console.log('generate galaxy');

    const vertices = new Float32Array(parameters.count * 3)

    const colors = new Float32Array(parameters.count * 3)
    const innerColor = new THREE.Color(parameters.insideColor)
    const outerColor = new THREE.Color(parameters.outsideColor)

    geometry = new THREE.BufferGeometry()
    material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    points = new THREE.Points(geometry, material)

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3
      const radius = Math.random() * parameters.radius
      const spinAngle = radius * parameters.spin
      // The angles of a circle are measured in radians
      // 2piRadians will always equal a full circle in radians (see wikipedia for radians)
      // The circle is divided into the number of branches. For each i value, you will get a radian.
      // i.e if branches is 3, then you will get radians equalling 1/3, 1/6 and one whole circle
      const radian = (i % parameters.branches) / parameters.branches * Math.PI * 2

      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

      // When you use sin and cos, you get a position on a circle, whose default radius is 1
      // We need to increase the radius
      vertices[i3 + 0] = Math.cos(radian + spinAngle) * radius + randomX
      vertices[i3 + 1] = randomY
      vertices[i3 + 2] = Math.sin(radian + spinAngle) * radius + randomZ

      // Color
      const mixedColor = innerColor.clone()
      mixedColor.lerp(outerColor, radius / parameters.radius)
      colors[i3 + 0] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(vertices, 3)
    )
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    )

      scene.add(points)
  }

  generateGalaxy()

  // gui.add(parameters, 'count').min(100).max(1000000).step(100).name('Star count').onFinishChange(generateGalaxy)
  // gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).name('Star size').onFinishChange(generateGalaxy)
  // gui.add(parameters, 'radius').min(0.001).max(20).step(0.001).name('Galaxy Radius').onFinishChange(generateGalaxy)
  // gui.add(parameters, 'branches').min(2).max(20).step(1).name('Galaxy Branches').onFinishChange(generateGalaxy)
  // gui.add(parameters, 'spin').min(-5).max(5).step(0.1).name('Branch Spin').onFinishChange(generateGalaxy)
  // // gui.add(parameters, 'randomness').min(0).max(2).step(0.01).name('Randomness').onFinishChange(generateGalaxy)
  // gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.01).name('Uniformity').onFinishChange(generateGalaxy)
  // gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
  // gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)


  /**
   * Sizes
   */
  const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
  }

  window.addEventListener('resize', () =>
  {
      // Update sizes
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight

      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.x = 0
  camera.position.y = 1
  camera.position.z = 1
  camera.lookAt(0, 0, 0)
  scene.add(camera)

  // Controls
  // const controls = new OrbitControls(camera, canvas)
  // controls.enableDamping = true
  // console.log(controls);

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
      canvas: canvas
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () =>
  {
      const elapsedTime = clock.getElapsedTime()

      // Update controls
      // controls.update()
      camera.lookAt(0, 0, 0)

      camera.position.x = Math.cos(elapsedTime * 0.03) * parameters.radius
      camera.position.y = Math.cos(elapsedTime * 0.09) * 0.7
      camera.position.z = Math.sin(elapsedTime * 0.09)

      // Render
      renderer.render(scene, camera)

      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
  }

  tick()

}
const center = document.getElementById("center")
const button = document.getElementById("enter")
const canvas = document.querySelector('canvas.webgl')
const text = document.getElementById('text-grid')
const welcome = document.getElementById('welcome')

// button.addEventListener('click', () => {
  // document.querySelector('audio').currentTime = 6;
  // document.querySelector('audio').play()
  center.classList.add('animate__fadeOutDown')

  setTimeout(() => {
    center.style.display = 'none'
    canvas.classList.add('animate__fadeIn')
    // document.querySelector('main').style.display = grid
    welcome.classList.add('animate__zoomIn')
    welcome.style.visibility = 'visible'
    runProgram()
  }, 2000);



  setTimeout(() => {
    text.classList.add('animate__fadeIn')
    text.style.visibility = 'visible'

  }, 11000);
// })

// center.style.display = 'none'
// runProgram()
