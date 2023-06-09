import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as gui from 'lil-gui'
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
// Door texture:
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpeg')

// Objects
//----------- Door color texture and alpha ------
// const material = new THREE.MeshBasicMaterial();
// material.map = doorColorTexture

// // If you use alpha/opacity, then you need to specify transparent = true
// material.alphaMap = doorAlphaTexture
// material.transparent = true;
// // Makes both sides of an object visible, but is a lot of work for GPU
// material.side = THREE.DoubleSide
//----------- Door color texture and alpha ------

// //----------- Mesh normal material ------
// const material = new THREE.MeshNormalMaterial();
// material.flatShading = true;
// //----------- Mesh normal material ------


// // -------------- Mesh Matcap material --------
// // Uses an image as a reference to apply to a geometry. It also uses the geometries normal values
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture
// // -------------- Mesh Matcap material --------

// // -------------- Mesh Depth material --------
// const material = new THREE.MeshDepthMaterial()
// // -------------- Mesh Depth material --------

// // -------------- Mesh Lambert material --------
// const material = new THREE.MeshLambertMaterial()
// // -------------- Mesh Lambert material --------

// // -------------- Mesh Phong material --------
// const material = new THREE.MeshPhongMaterial()
// // -------------- Mesh Phong material --------

// // -------------- Mesh Toon material --------
// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture
// // -------------- Mesh Toon material --------

// // -------------- Mesh Standard material --------
// // Better than Lambert and Phong
// const material = new THREE.MeshStandardMaterial()
// material.map = doorColorTexture
// // // -------------- Mesh Standard material --------

// // ------------------ AO map -----------------------
// // See code below where a duplicate set of uv coorindates is assigned to each geometry
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 2
// // ------------------ AO map -----------------------

// // ------------------ Relief map -------------------
// material.displacementMap = doorHeightTexture
// // In order for the relief/height to work, I added more triangles below to the geometries. You can see them with the wireframe
// // material.wireframe = true
// material.displacementScale = 0.2
// // ------------------ Relief map -------------------

// // ------------------ Metalness/Roughness map -------------------
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// // ------------------ Metalness/Roughness map -------------------

// // ------------------ Normal map -------------------
// material.normalMap = doorNormalTexture
// material.alphaMap = doorAlphaTexture
// material.transparent = true;
// // ------------------ Normal map -------------------


// // ------------------ Environment map -------------------
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([
  // setting images for positive x, negative x, postive y etc.
  '/textures/environmentMaps/1/px.jpg',
  '/textures/environmentMaps/1/nx.jpg',
  '/textures/environmentMaps/1/py.jpg',
  '/textures/environmentMaps/1/ny.jpg',
  '/textures/environmentMaps/1/pz.jpg',
  '/textures/environmentMaps/1/nz.jpg'
])
const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
material.envMap = environmentMapTexture
// How freaking awesome is that! Check out HDRI Heaven for other environment maps
// Convert them to 6 separate images using https://matheowis.github.io/HDRI-to-CubeMap/
// // ------------------ Environment map -------------------


// Debug
const debug = new gui.GUI()
console.log(debug);
debug.add(material, 'metalness', 0, 1, 0.01).name('Metalness')
debug.add(material, 'roughness', 0, 1, 0.01).name('Roughness')
debug.add(material, 'aoMapIntensity', 0, 10, 0.01).name('Ambient Occlusion')
debug.add(material, 'displacementScale', 0, 5, 0.001).name('Relief')

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 64, 64),
  material
)
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
sphere.position.x = - 1.5

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 100, 100),
  material
)
// Duplicating UV coordinates in order to place ambient occlusion texture
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.5, 0.2, 64, 128),
  material
)
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
torus.position.x = 1.5
scene.add(sphere, plane, torus)


/**
 * Light
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(ambientLight, pointLight)



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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

    // Update objects
    torus.rotation.y = 0.3 * elapsedTime
    sphere.rotation.y = 0.3 * elapsedTime
    plane.rotation.y = 0.3 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
