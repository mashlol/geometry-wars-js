window.scene = new THREE.Scene();

var width = 30;
var height = 30;

var camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
// window.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var grid = new THREE.GridHelper(10, 1);
grid.rotation.x = Math.PI / 2;
grid.setColors(0x888888, 0x888888);
scene.add(grid);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true});
window.player = new THREE.Mesh(geometry, material);
scene.add(window.player);

camera.position.z = 15;
// camera.rotation.x = 0.8;
// camera.position.y = -15;

var lastBullet = Date.now();

var numLoops = 0;
var lastRender = Date.now();

var render = function () {
    webkitRequestAnimationFrame(render);
    var deltaTime = Date.now() - lastRender;
    lastRender = Date.now();

    for (var id in window.particles) {
        var particle = particles[id];

        particle.project(deltaTime);
    }

    for (var id in window.enemies) {
        var enemy = enemies[id];

        enemy.logic(deltaTime);
    }

    var timeSinceLastBullet = Date.now() - lastBullet;
    if (window.worldMousePos && window.mouseDown && timeSinceLastBullet > 100) {
        lastBullet = Date.now();
        var direction = new THREE.Vector3(window.worldMousePos.x, window.worldMousePos.y);
        direction.sub(window.player.position).normalize();

        var particle = new Particle({
            position: new THREE.Vector3(window.player.position.x, window.player.position.y, 0),
            direction: direction,
            mass: 2,
            startColor: new THREE.Color(0x22cccc)
        });
    }

    var speed = 0.2;
    var moved = false;
    if (window.keysPressed[87] && window.player.position.y + 0.5 + speed <= 10) {
        window.player.position.y += speed * deltaTime / 17;
        moved = true;
    }

    if (window.keysPressed[83] && window.player.position.y - 0.5 - speed >= -10) {
        window.player.position.y -= speed * deltaTime / 17;
        moved = true;
    }

    if (window.keysPressed[65] && window.player.position.x - 0.5 - speed >= -10) {
        window.player.position.x -= speed * deltaTime / 17;
        moved = true;
    }

    if (window.keysPressed[68] && window.player.position.x + 0.5 + speed <= 10) {
        window.player.position.x += speed * deltaTime / 17;
        moved = true;
    }

    if (moved && numLoops % 10 == 0) {
        for (var x=0; x<10; x++) {
            var particle = new Particle({
                position: new THREE.Vector3(window.player.position.x + Math.random() - 0.5, window.player.position.y + Math.random() - 0.5, 0),
                direction: new THREE.Vector3(window.player.position.x + Math.random() - 0.5, window.player.position.y + Math.random() - 0.5, 0).normalize(),
                mass: 1,
                speed: 0.01,
                lifetime: 200,
                startColor: new THREE.Color(0xb8860b)
            })
        }
    }

    // if (numLoops % 50 == 0) {
    //     new Enemy();
    // }

    renderer.render(scene, camera);
    numLoops++;
};

window.keysPressed = {};

render();

window.particles = {};

window.worldMousePos = null;
window.mouseDown = false;

window.onmousedown = function(event) {
    window.mouseDown = true;
    window.worldMousePos = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * -2 + 1,
        0.5
    );
    var projector = new THREE.Projector();
    projector.unprojectVector(window.worldMousePos, camera);
    window.worldMousePos.z = 0;
}

window.onmousemove = function(event) {
    window.worldMousePos = new THREE.Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * -2 + 1,
        0.5
    );
    var projector = new THREE.Projector();
    projector.unprojectVector(window.worldMousePos, camera);
    window.worldMousePos.z = 0;
}

window.onmouseup = function(event) {
    window.mouseDown = false;
}


window.onkeydown = function(event) {
    window.keysPressed[event.keyCode] = true;
}

window.onkeyup = function(event) {
    window.keysPressed[event.keyCode] = false;
}

window.onkey