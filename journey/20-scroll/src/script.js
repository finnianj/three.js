import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#38ffde',
    particleColor: '#ffffff'
}


/**
 * Base
*/
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const gradient = textureLoader.load('textures/gradients/3.jpg')
// By defualt, three will blend pixels if the light value is close to the boundary between
// two different pixels. If we change the mag filter then we will get the hard change between pixels without gradient, like a minecraft effect.
gradient.magFilter = THREE.NearestFilter

// /**
//  * Test cube
//  */
// const cube = new THREE.Mesh(
  //     new THREE.BoxGeometry(1, 1, 1),
  //     new THREE.MeshBasicMaterial({ color: '#ff0000' })
  // )
  // scene.add(cube)
  const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradient
  })
  const objectDistance = 4;
  const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
    )
    const mesh2 = new THREE.Mesh(
      new THREE.ConeGeometry(1, 2, 32),
      material
      )
      const mesh3 = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
        material
        )
        mesh1.position.y = - objectDistance * 0
        mesh2.position.y = - objectDistance * 1
        mesh3.position.y = - objectDistance * 2
        scene.add(mesh1, mesh2, mesh3)

        const sectionMeshes = [mesh1, mesh2, mesh3]

        // Particles
        const particlesCount = 200
        const vertices = new Float32Array(particlesCount * 3)
        for (let i = 0; i < particlesCount; i++) {
          let i3 = i * 3
          vertices[i3 + 0] = (Math.random() - 0.5) * 10
          vertices[i3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
          vertices[i3 + 2] = (Math.random() - 0.5) * 10
        }
        const particleGeometry = new THREE.BufferGeometry()
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

        const particleMaterial = new THREE.PointsMaterial({
          color: '#ffffff',
          sizeAttenuation: true,
          size: 0.03
        })
        const particles = new THREE.Points(particleGeometry, particleMaterial)
        scene.add(particles)

      gui.addColor(parameters, 'materialColor').onChange(() => { material.color.set(parameters.materialColor) })
      gui.addColor(parameters, 'particleColor').onChange(() => { particleMaterial.color.set(parameters.particleColor) })

        // Lights
        const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

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

// Cursor
const cursor = {
  x: 0,
  y: 0
}

window.addEventListener('mousemove', (event) => {
  cursor.x = (event.clientX / sizes.width) - 0.5
  cursor.y = (event.clientY / sizes.height) - 0.5
})

/**
 * Camera
 */

// Camera Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)
// scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Scroll
let scrollY = window.scrollY
let currentSection = 0
window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / sizes.height)
  if (newSection != currentSection) {
    currentSection = newSection
    console.log("section change");
    gsap.to(sectionMeshes[currentSection].rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=2',
        y: '+=3',
        z: '+=1.5'
      })
  }
})



/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    // Animate objects
    for (const mesh of sectionMeshes) {
      mesh.rotation.x += deltaTime * 0.2
      mesh.rotation.y += deltaTime * 0.1
    }
    mesh1.position.x = 2
    mesh2.position.x = -2
    mesh3.position.x = 2

    // Animate camera
    // Use this formula to get a scroll of 1000px to equal the distance between objects
    camera.position.y =  - scrollY / sizes.height * objectDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5

    // Easing:
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
