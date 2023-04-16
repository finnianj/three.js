import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
})

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

camera.position.setZ(30);

renderer.render( scene, camera )

//  ------------------------------

const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
const material = new THREE.MeshStandardMaterial({ color: 0x1A5F7A });
const torus = new THREE.Mesh( geometry, material );

scene.add(torus);

const pointlight= new THREE.PointLight(0xffffff);
pointlight.position.set(20, 20, 20);
const ambientlight= new THREE.AmbientLight(0xffffff);

scene.add(pointlight, ambientlight);

// const lighthelper = new THREE.PointLightHelper(pointlight);
// const gridhelper = new THREE.GridHelper(200, 50)
// scene.add(lighthelper, gridhelper)

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh( geometry, material );

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar)

const spaceTexture = new THREE.TextureLoader().load('space2.png');
scene.background = spaceTexture;

// avatar

const finnTexture = new THREE.TextureLoader().load('finn.png');
const finn = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({ map: finnTexture })
);
scene.add(finn);

// moon

const moonTexture = new THREE.TextureLoader().load('moon.jpeg')
const normalTexture = new THREE.TextureLoader().load('normal.jpeg')
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
);

scene.add(moon)
moon.position.set(0, 0, -20)



// -------------------------------

const controls = new OrbitControls(camera, renderer.domElement)

function animate() {
  requestAnimationFrame( animate );

  torus.rotation.x += 0.01;
  torus.rotation.y +=0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.001;
  moon.rotation.y += 0.001;
  moon.rotation.z += 0.001;

  controls.update();
  renderer.render( scene, camera );
}

animate();
