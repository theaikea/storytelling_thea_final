// 3dmodel.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function placeModelsAtPositions(scene, modelPath, models) {
    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
        const originalModel = gltf.scene;

        models.forEach((modelData, index) => {
            const clonedModel = originalModel.clone();

            // Set position from the array
            const { position, rotation } = modelData;
            clonedModel.position.set(position.x, position.y, position.z);

            // Set rotation if provided
            if (rotation) {
                clonedModel.rotation.set(rotation.x, rotation.y, rotation.z);
            }

            // Set scale (optional)
            clonedModel.scale.set(3, 3, 3);

            // Enable shadows for meshes
            clonedModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Add cloned model to the scene
            scene.add(clonedModel);

            console.log("hej")
        });
    });
}

//hej