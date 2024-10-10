import * as THREE from 'three';
import { OrbitControls } from '/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from '/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from '/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { placeModelsAtPositions } from '/modules/3dmodels.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';

// Canvas and basic setup
var _canvasEl = document.getElementById("three");
var _vw = window.innerWidth;
var _vh = window.innerHeight;

// Create the scene
const _scene = new THREE.Scene();
_scene.background = new THREE.Color(0xC63C2C);
let fogColor = 0xaa00ff; 
_scene.fog = new THREE.Fog(fogColor, 20, 120);

// Setup the camera
const _camera = new THREE.PerspectiveCamera(100, _vw / _vh, 0.1, 1000);
const _cameraTilt = -6;

// Setup the renderer
const _renderer = new THREE.WebGLRenderer({ canvas: _canvasEl, antialias: true });
_renderer.setSize(_vw, _vh);
_renderer.setPixelRatio(window.devicePixelRatio);

// Enable shadow mapping
_renderer.shadowMap.enabled = true;
_renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Initiate the EffectComposer for post-processing effects
const composer = new EffectComposer(_renderer);
const renderPass = new RenderPass(_scene, _camera);
composer.addPass(renderPass);

const luminosityPass = new ShaderPass(LuminosityShader);
composer.addPass(luminosityPass);

const filmPass = new FilmPass(1.3, 0.1, 100, false);
composer.addPass(filmPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(_vw, _vh), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);

// Set bloomPass to be initially disabled
bloomPass.enabled = false;

// Ambient light setup
const _ambiLight = new THREE.AmbientLight(0x85B9C7, 0.01);
_scene.add(_ambiLight);

// PointLight setup
const _pointLight2 = new THREE.PointLight(0xffffff, 500, 30);
_pointLight2.position.set(110, 0.4, -240);
_scene.add(_pointLight2);

const _pointLight = new THREE.PointLight(0xffffff, 20, 100);
_pointLight.castShadow = true;
_pointLight.shadow.mapSize.width = 2048;
_pointLight.shadow.mapSize.height = 2048;
_pointLight.shadow.bias = -0.002;
_scene.add(_pointLight);

// Floor setup
const _floorGeom = new THREE.PlaneGeometry(1000, 1000);
const _floorMat = new THREE.MeshPhongMaterial({ color: 0xfffd8d });
const _floor = new THREE.Mesh(_floorGeom, _floorMat);
_floor.rotation.x = -Math.PI / 2;
_floor.receiveShadow = true;
_scene.add(_floor);

// Define specific positions and rotations for each model
const buildings = [
    { position: { x: -9, y: 6, z: 40 }, rotation: { x: 0, y: dtr(180), z: 0 } },
    { position: { x: 50, y: 6, z: -20 }, rotation: { x: 0, y: dtr(90), z: 0 } },
    { position: { x: -50, y: 6, z: -20 }, rotation: { x: 0, y: dtr(240), z: 0 } },
    { position: { x: -30, y: 6, z: -100 }, rotation: { x: 0, y: dtr(240), z: 0 } },
    { position: { x: 48, y: 6, z: -120 }, rotation: { x: 0, y: dtr(0), z: 0 } },
    //{ position: { x: 120, y: 6, z: -120 }, rotation: { x: 0, y: dtr(0), z: 0 } },
    { position: { x: 90, y: 6, z: -35 }, rotation: { x: 0, y: dtr(0), z: 0 } },
   //{ position: { x: 170, y: 6, z: -77 }, rotation: { x: 0, y: dtr(180), z: 0 } },
    { position: { x: 150, y: 6, z: -77 }, rotation: { x: 0, y: dtr(90), z: 0 } },
    { position: { x: 150, y: 6, z: -160 }, rotation: { x: 0, y: dtr(270), z: 0 } },
    { position: { x: 69, y: 6, z: -180 }, rotation: { x: 0, y: dtr(270), z: 0 } },
    { position: { x: 69, y: 6, z: -240 }, rotation: { x: 0, y: dtr(90), z: 0 } },
    { position: { x: 150, y: 6, z: -240 }, rotation: { x: 0, y: dtr(270), z: 0 } },
    { position: { x: 30, y: 6, z: -160 }, rotation: { x: 0, y: dtr(0), z: 0 } },
    
];

placeModelsAtPositions(_scene, '3dmodels/building2.glb', buildings);

// Load the 3D model with animations
let _3dmodel, _mixer, _idleAction, _walkAction, _currentAction;

const loader = new GLTFLoader().setPath('/3dmodels/');
loader.load('annika.glb', function(gltf) {
    _3dmodel = gltf.scene;
    _3dmodel.scale.set(2.5, 2.5, 2.5);
    _3dmodel.position.set(0, 0, -5);

    _mixer = new THREE.AnimationMixer(_3dmodel);

    const _animations = gltf.animations;
    _walkAction = _mixer.clipAction(_animations[1]);
    _idleAction = _mixer.clipAction(_animations[0]);

    _idleAction.play();
    _currentAction = _idleAction;

    _3dmodel.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    _scene.add(_3dmodel);
});

let character2, mixer2;

const loader2 = new GLTFLoader().setPath('/3dmodels/');
loader2.load('Patty.glb', function(gltf) {
    character2 = gltf.scene;
    character2.scale.set(2.4, 2.4, 2.4);
    character2.position.set(110, 0.4, -240);

    
    character2.rotation.y = dtr(180);

    mixer2 = new THREE.AnimationMixer(character2);
    const animation = gltf.animations[1];
    const action = mixer2.clipAction(animation);
    action.setLoop(THREE.LoopRepeat);
    action.play();

    character2.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    _scene.add(character2);

});

// Create an invisible box for collision detection
const collisionBoxGeom = new THREE.BoxGeometry(20, 10, 20); // Adjust the size as needed
const collisionBoxMat = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false }); // Set visible to false
const collisionBox = new THREE.Mesh(collisionBoxGeom, collisionBoxMat);
collisionBox.position.set(110, 0.4, -240); // Position it wherever needed
_scene.add(collisionBox);

// Pre-calculate the collision box's bounding box
const collisionBoxBoundingBox = new THREE.Box3().setFromObject(collisionBox);

// Initialize Howler.js sounds
const sound = new Howl({
    src: ['sounds/noname.mp3'],
    loop: true,
    volume: 0.15
});

const newSong = new Howl({
    src: ['sounds/Opstigning.mp3'],
    loop: true,
    volume: 0.5
});

const footsound = new Howl({
    src: ['sounds/footsteps.mp3'],
    loop: true,
    volume: 0.035
});

// Play the first song
sound.play();



class InvisiblePlane {
    constructor(position, size, rotation, soundSrc) {
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.sound = new Howl({
            src: [soundSrc],
            volume: 0.5,
            loop: false,
        });

        // Create the plane
        const planeGeom = new THREE.PlaneGeometry(size.x, size.y);
        const planeMat = new THREE.MeshBasicMaterial({ visible: false }); // Invisible material
        this.plane = new THREE.Mesh(planeGeom, planeMat);

        // Set position, rotation
        this.plane.position.set(position.x, position.y, position.z);
        this.plane.rotation.set(rotation.x, rotation.y, rotation.z);

        // Add to scene
        _scene.add(this.plane);

        // Create bounding box for collision detection
        this.boundingBox = new THREE.Box3().setFromObject(this.plane);
    }

    updateBoundingBox() {
        this.boundingBox.setFromObject(this.plane);
    }

    checkCollision(modelBoundingBox) {
        if (modelBoundingBox.intersectsBox(this.boundingBox)) {
            console.log('Collision with invisible plane!');
            if (!this.sound.playing()) {
                this.sound.play();
            }
        }
    }
}

// Instantiate planes with different positions, sizes, rotations, and sounds
const planes = [
    new InvisiblePlane({ x: 0, y: 0, z: -20 }, { x: 100, y: 100 }, { x: 0, y: dtr(180), z: 0 }, 'sounds/1.mp3'),
    new InvisiblePlane({ x: 0, y: 0, z: -65 }, { x: 100, y: 100 }, { x: 0, y: dtr(180), z: 0 }, 'sounds/2.mp3'),
    new InvisiblePlane({ x: 110, y: 0, z: -100 }, { x: 100, y: 100 }, { x: 0, y: dtr(180), z: 0 }, 'sounds/3.mp3'),
    new InvisiblePlane({ x: 110, y: 0, z: -150 }, { x: 100, y: 100 }, { x: 0, y: dtr(180), z: 0 }, 'sounds/4.mp3'),
    new InvisiblePlane({ x: 110, y: 0, z: -230 }, { x: 100, y: 100 }, { x: 0, y: dtr(180), z: 0 }, 'sounds/5.mp3'),
];








// Clock for animation timing
const _clock = new THREE.Clock();
let _walk = false;
let _walkSpeedX = 0, _walkSpeedZ = 0;

function animate() {
    const delta = _clock.getDelta();

    if (_mixer) _mixer.update(delta * (_walk ? 0.35 : 0.4));
    if (mixer2) mixer2.update(delta * 0.4);


    // Update the collision box's bounding box
    collisionBoxBoundingBox.setFromObject(collisionBox);

    // Update 3d model movement
    if (_3dmodel) {
        if (_walk) {
            _walkSpeedZ *= 1.05;
            if (_walkSpeedZ > 1) _walkSpeedZ = 1;
        }

        if (_walkSpeedX !== 0) {
            _3dmodel.rotation.y += dtr(_walkSpeedX);
        }

        _3dmodel.position.z -= Math.cos(_3dmodel.rotation.y) * _walkSpeedZ * 0.09;
        _3dmodel.position.x -= Math.sin(_3dmodel.rotation.y) * _walkSpeedZ * 0.09;

        // Update bounding box of the 3D model
        const _3dmodelBox = new THREE.Box3().setFromObject(_3dmodel);

        // Check for collisions with each plane
        planes.forEach(plane => {
            plane.updateBoundingBox();
            plane.checkCollision(_3dmodelBox);
        });

        // Camera smoothly follows the model
        const targetCamX = _3dmodel.position.x + Math.sin(_3dmodel.rotation.y) * 8;
        const targetCamY = _3dmodel.position.y + 10 + _cameraTilt;
        const targetCamZ = _3dmodel.position.z + Math.cos(_3dmodel.rotation.y) * 8;

        gsap.to(_camera.position, {
            x: targetCamX,
            y: targetCamY,
            z: targetCamZ,
            duration: 0.5,
            ease: "power1.out"
        });

        _camera.lookAt(
            _3dmodel.position.x, 
            _3dmodel.position.y + 12.5 + _cameraTilt,
            _3dmodel.position.z
        );
    }

    // Update the light's position to follow the camera
    _pointLight.position.set(_camera.position.x + 3, 15, _camera.position.z -10);

    // Check for collisions between _3dmodel and character2 or invisible collision box
    const _3dmodelBox = new THREE.Box3().setFromObject(_3dmodel);


    // Collision with invisible box
    if (_3dmodelBox.intersectsBox(collisionBoxBoundingBox)) {
        console.log("Collision detected with invisible box!");

        if (sound.playing()) {
            sound.stop();
        }

        if (!newSong.playing()) {
            newSong.play();
        }

        gsap.to(_ambiLight, { intensity: 0.1, duration: 10 });
        gsap.to(_pointLight.color, { duration: 10, r: 1, g: 0, b: 0.6 });


        bloomPass.enabled = true;
        luminosityPass.enabled = false;

        _scene.remove(_pointLight2);

        
    }

    // Render the scene with post-processing effects
    composer.render();
}

gsap.ticker.add(animate);

// Key press event listeners for walk/rotate
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

function keydown(e) {
    if (e.key === "ArrowUp") {
        _walk = true;
        _walkSpeedZ = Math.max(_walkSpeedZ, 0.1);
        switchToAction(_walkAction);
        if (!footsound.playing()) {
            footsound.play();
        }
    } else if (e.key === "ArrowLeft") {
        _walkSpeedX = 0.5;
        _walk = true;
        switchToAction(_walkAction);
    } else if (e.key === "ArrowRight") {
        _walkSpeedX = -0.5;
        _walk = true;
        switchToAction(_walkAction);
    }
}

function keyup(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        _walkSpeedZ = 0;
        _walkSpeedX = 0;
        _walk = false;
        switchToAction(_idleAction);
        footsound.stop(); 
    }
}

function switchToAction(newAction) {
    if (_currentAction !== newAction) {
        _currentAction.fadeOut(0.2);
        newAction.reset().fadeIn(0.2).play();
        _currentAction = newAction;
    }
}

function dtr(deg) {
    return deg * (Math.PI / 180);
}

// Update renderer and camera on window resize
window.addEventListener("resize", () => {
    _vw = window.innerWidth;
    _vh = window.innerHeight;
    _camera.aspect = _vw / _vh;
    _camera.updateProjectionMatrix();
    _renderer.setSize(_vw, _vh);
});

