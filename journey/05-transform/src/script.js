import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

mesh.position.z = 1
mesh.position.x = 1
console.log(mesh.position.length())
// because position inherits from Vector3, you can use the length method.
// this tells you how far an object is from the centre

mesh.position.set(0.7, -0.6, 1);
// setting x y and z simultaneously


/**
 * Sizes
*/
const sizes = {
  width: 800,
  height: 600
}

/**
 * Camera
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

console.log(mesh.position.distanceTo(camera.position))
// calculating distance from one object to another

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)
