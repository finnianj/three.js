import * as THREE from 'three'
import gsap from 'gsap'

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
    // Counts up from 0 in whole seconds - does not reset to 0 between each frame
    const elapsedTime = clock.getElapsedTime()
    console.log(elapsedTime)
    // Therefore we simply set the rotation to the elapsed time value
    // mesh.rotation.z = elapsedTime
    // If we want one revolution per second, then we multiply our time value by 2pi, which is a full rotation
    // mesh.rotation.z = elapsedTime * Math.PI * 2;

  // ------------- Using built in Clock ---------------

  // ------------- Using sin wave ---------------
    // If we want an oscillating value, then we can use Math.sin:
    // mesh.position.x = Math.sin(elapsedTime)
    // Or cos, which is the inversion of sin:
    // mesh.position.y = Math.cos(elapsedTime);
    // mesh.position.z = Math.cos(elapsedTime);
    // mesh.rotation.z = elapsedTime * Math.PI
    // Crazy cube!!!
  // ------------- Using sin wave ---------------

  // ------------- Using lookat ---------------
    // Moving the camera in a circle and looking at the cube:
    camera.position.x = Math.sin(elapsedTime)
    camera.position.y = Math.cos(elapsedTime)
    camera.lookAt(mesh.position)
  // ------------- Using lookat ---------------

  // ------------- Using gsap ---------------
    gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })
    // gsap (greensock) has its own internal clock, so we don't need to multiply by elapsed time
  // ------------- Using gsap ---------------


  console.log('tick')
  renderer.render(scene, camera)

  window.requestAnimationFrame(animate);
}

animate();
