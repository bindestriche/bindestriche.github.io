// Wait until the entire HTML document is loaded and parsed
window.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const debugInfo = document.getElementById("debugInfo");
    const inputMap = {};

    const createScene = () => {
        const scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 30, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        camera.upperBetaLimit = Math.PI / 2.2;
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 50;

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.8;
        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        scene.enablePhysics(gravityVector, physicsPlugin);

        const floorMaterial = new BABYLON.StandardMaterial("floorMat", scene);
        floorMaterial.diffuseTexture = new BABYLON.Texture("checkerboard.jpg", scene);
        floorMaterial.specularColor = BABYLON.Color3.Black();

        const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
        wallMaterial.diffuseTexture = new BABYLON.Texture("wood.jpg", scene);
        wallMaterial.specularColor = BABYLON.Color3.Black();

        const goalMaterial = new BABYLON.StandardMaterial("goalMat", scene);
        goalMaterial.diffuseColor = new BABYLON.Color3.Green();
        goalMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.7, 0.2);

        const levelMap = ["WWWWWWWWWW","WS-------W","W-WWWW-O-W","W-W----O-W","W-W-WWWW-W","W-O-W----W","W-O-WW-W-W","W---G--W-W","WWWWWWWWWW"];
        const tileSize = 2, wallHeight = 2;
        let startPosition = BABYLON.Vector3.Zero(), goalMesh = null;
        
        const createLevelFromMap = (map) => {
            const levelWidth = map[0].length, levelHeight = map.length;
            const offsetX = -(levelWidth * tileSize) / 2 + tileSize / 2, offsetZ = (levelHeight * tileSize) / 2 - tileSize / 2;
            for (let row = 0; row < map.length; row++) for (let col = 0; col < map[row].length; col++) {
                const char = map[row][col], x = col * tileSize + offsetX, z = -(row * tileSize - offsetZ);
                if (char === '-' || char === 'S' || char === 'G') {
                    const tile = BABYLON.MeshBuilder.CreateBox(`f_${row}_${col}`,{width:tileSize,height:0.1,depth:tileSize},scene);
                    tile.position = new BABYLON.Vector3(x,0,z); tile.material = floorMaterial;
                    // <-- FIX: Using full property names for physics
                    tile.physicsImpostor = new BABYLON.PhysicsImpostor(tile,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0,restitution:0.5,friction:0.5},scene);
                    if (char === 'S') startPosition = new BABYLON.Vector3(x, 1, z);
                    if (char === 'G') { tile.material = goalMaterial; goalMesh = tile; }
                } else if (char === 'W') {
                    const wall = BABYLON.MeshBuilder.CreateBox(`w_${row}_${col}`,{width:tileSize,height:wallHeight,depth:tileSize},scene);
                    wall.position = new BABYLON.Vector3(x, wallHeight / 2, z); wall.material = wallMaterial;
                     // <-- FIX: Using full property names for physics
                    wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall,BABYLON.PhysicsImpostor.BoxImpostor,{mass:0,restitution:0.5,friction:0.5},scene);
                }
            }
        };
        createLevelFromMap(levelMap);

        const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
        ballMaterial.diffuseTexture = new BABYLON.Texture("ball8.png", scene);
        ballMaterial.specularColor = BABYLON.Color3.Black();
        ball.material = ballMaterial;
        // <-- FIX: Using full property names for physics
        ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball,BABYLON.PhysicsImpostor.SphereImpostor,{mass:1,restitution:0.5,friction:0.1,damping:0.1});
        const resetBall = () => { ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero()); ball.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero()); ball.position = startPosition; };
        resetBall();

        scene.actionManager = new BABYLON.ActionManager(scene);
        if (goalMesh) {
            goalMesh.actionManager = new BABYLON.ActionManager(scene);
            goalMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger,parameter:ball}, () => { alert("You Win!"); resetBall(); }));
        }
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => { inputMap[evt.sourceEvent.key.toLowerCase()] = true; }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => { inputMap[evt.sourceEvent.key.toLowerCase()] = false; }));

        scene.onBeforeRenderObservable.add(() => {
            if (ball.position.y < -5) { alert("You fell! Try again."); resetBall(); }

            const moveForce = 15;
            const forceDirection = new BABYLON.Vector3.Zero();
            const cameraForward = camera.getDirection(BABYLON.Vector3.Forward());
            const forward = new BABYLON.Vector3(cameraForward.x, 0, cameraForward.z).normalize();
            const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward).normalize();
            
            if (inputMap["w"]) { forceDirection.addInPlace(forward); }
            if (inputMap["s"]) { forceDirection.subtractInPlace(forward); }
            if (inputMap["d"]) { forceDirection.addInPlace(right); }
            if (inputMap["a"]) { forceDirection.subtractInPlace(right); }
            
            if (forceDirection.length() > 0.01) {
                forceDirection.normalize().scaleInPlace(moveForce);
                ball.physicsImpostor.applyForce(forceDirection, ball.getAbsolutePosition());
            }
            
            if (debugInfo) {
                const alphaDeg = BABYLON.Tools.ToDegrees(camera.alpha).toFixed(2);
                const betaDeg = BABYLON.Tools.ToDegrees(camera.beta).toFixed(2);
                const radius = camera.radius.toFixed(2);
                debugInfo.innerHTML = `Alpha (Y-rot): ${alphaDeg}°<br>Beta (X-rot): ${betaDeg}°<br>Radius (Zoom): ${radius}`;
            }
        });

        return scene;
    };

    const setupButtonControls = (buttonId, key) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        const pressEvent = (e) => { e.preventDefault(); inputMap[key] = true; };
        const releaseEvent = (e) => { e.preventDefault(); inputMap[key] = false; };
        button.addEventListener("mousedown", pressEvent);
        button.addEventListener("mouseup", releaseEvent);
        button.addEventListener("mouseleave", releaseEvent);
        button.addEventListener("touchstart", pressEvent, { passive: false });
        button.addEventListener("touchend", releaseEvent);
        button.addEventListener("touchcancel", releaseEvent);
    };
    setupButtonControls("btn-up", "w");
    setupButtonControls("btn-down", "s");
    setupButtonControls("btn-left", "a");
    setupButtonControls("btn-right", "d");

    const scene = createScene();
    engine.runRenderLoop(() => { scene.render(); });
    window.addEventListener("resize", () => { engine.resize(); });

});