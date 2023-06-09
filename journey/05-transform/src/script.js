import * as THREE from 'three'

/**
 * Sizes
*/
const sizes = {
  width: 800,
  height: 600
}

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

mesh.position.set(0.1, 0.5, -1);
// setting x y and z simultaneously

mesh.scale.x = 0.2;
mesh.scale.y = 0.5;
mesh.scale.z = 0.2;
// changin the object scale

// Rotation - imagine putting a stick through an object and twisting the stick - that is the axis that is being rotated on
mesh.rotation.z = Math.PI;
// makes a 90 degree rotation. Math.PI is a 180 degree rotation


const axisHelper = new THREE.AxesHelper();
scene.add(axisHelper)


/**
 * Camera
*/
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

console.log(mesh.position.distanceTo(camera.position))
// calculating distance from one object to another

camera.position.set(0, 0, 1.5)


// Object 3d instances have a lookat method
// They take a vector 3 as an argument
camera.lookAt(new THREE.Vector3(0,0,0))

// You can look at an object by passing it's vector as an argment
camera.lookAt(mesh.position)
console.log(mesh.position)

// Groups ---------------------

const group = new THREE.Group()
scene.add(group);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0x00ff00})
)
cube1.position.x = 0.1
group.add(cube1)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff})
)
group.add(cube2)
cube2.position.x = 0.3


const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(0.1, 0.1, 0.1),
  new THREE.MeshBasicMaterial({ color: 0xffffff})
  )
  cube3.position.x = 0.5
  group.add(cube3)


group.position.y = 0.5;
group.rotation.z = Math.PI * 0.7
group.rotation.y = Math.PI * 0.7
// ----------------------------

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)
