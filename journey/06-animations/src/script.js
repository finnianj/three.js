import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

let time = Date.now();
const clock = new THREE.Clock();

// Animations
const animate = () => {

  // ------------- Using Delta Time ---------------
  // Current timestamp
  const currentTime = Date.now();

  // We use delta (difference) to compare the two timestamps
  const deltaTime = currentTime - time
  time = currentTime;
  // console.log(deltaTime)



  // Update objects:
  // mesh.rotation.x -= 0.01
  // However, this rotation will update every frame, and is therefore
  // dependent on the fps. If fps changes, the animation will look stunted.
  // The solution is to multiply the rotation by the delta time value.
  // If there is a greater delay between frames, the rotation will be more!
  // This will produce a much smoother animation:

  // mesh.rotation.y -= 0.001 * deltaTime <<<<< !!!
  
  // ------------- Using Delta Time ---------------


  // ------------- Using built in Clock ---------------


  // ------------- Using built in Clock ---------------

  console.log('tick')
  renderer.render(scene, camera)

  window.requestAnimationFrame(animate);
}

animate();
