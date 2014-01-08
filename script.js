var CURVE_ACCURACY = 60;

var xLines = [];
var yLines = [];

var spawnSpeed = 120;

window.particles = {};

var updateGrid = function() {
    var w = 20;
    var h = 20;

    var bullets = [];
    for (var id in window.particles) {
        var particle = window.particles[id];
        if (particle.lifetime == -1) {
            bullets.push(window.particles[id]);
        }
    }

    var gridIntersections = [];

    for (var x=0; x<19; x++) {
        for (var y=0; y<19; y++) {
            var expectedPos = {
                x: x - 9,
                y: y - 9
            };

            var worldPos = {
                x: x - 9,
                y: y - 9
            };

            for (var id in bullets) {
                var bullet = bullets[id];
                var bulletPos = {
                    x: bullet.object.position.x,
                    y: bullet.object.position.y
                }

                var distanceVector = new THREE.Vector2(expectedPos.x - bulletPos.x, expectedPos.y - bulletPos.y);
                var distance = distanceVector.length();

                var skewAmount = 1 / distance;
                if (skewAmount > 1)
                    skewAmount = 1;
                var direction = distanceVector.normalize();
                direction.multiplyScalar(skewAmount);

                worldPos.x += direction.x;
                worldPos.y += direction.y;
            }

            if (worldPos.x - expectedPos.x > 1) {
                worldPos.x = expectedPos.x + 1;
            }
            if (worldPos.x - expectedPos.x < -1) {
                worldPos.x = expectedPos.x - 1;
            }
            if (worldPos.y - expectedPos.y > 1) {
                worldPos.y = expectedPos.y + 1;
            }
            if (worldPos.y - expectedPos.y < -1) {
                worldPos.y = expectedPos.y - 1;
            }
            if (!gridIntersections[x])
                gridIntersections[x] = [];
            gridIntersections[x][y] = worldPos;
        }
    }

    for (var xLinePos in xLines) {
        var spline = new THREE.SplineCurve3([new THREE.Vector3(0, -10, 0)]);

        if (xLinePos != 0) {
            for (var y=0; y<19; y++) {
                var gridIntersection = gridIntersections[xLinePos-1][y];
                if (gridIntersection.x != xLinePos-10 || gridIntersection.y != y - 9) {
                    spline.points.push(new THREE.Vector3(gridIntersection.x - xLinePos + 10, gridIntersection.y, 0));
                }
            }
        }

        spline.points.push(new THREE.Vector3(0, 10, 0));

        var points = spline.getPoints(CURVE_ACCURACY);
        xLines[xLinePos].geometry.vertices = points;
        xLines[xLinePos].geometry.verticesNeedUpdate = true;
    }

    for (var yLinePos in yLines) {
        var spline = new THREE.SplineCurve3([new THREE.Vector3(-10, 0, 0)]);

        if (yLinePos != 0) {
            for (var x=0; x<19; x++) {
                var gridIntersection = gridIntersections[x][yLinePos-1];
                if (gridIntersection.y != yLinePos-10 || gridIntersection.x != x - 9) {
                    spline.points.push(new THREE.Vector3(gridIntersection.x, gridIntersection.y - yLinePos + 10, 0));
                }
            }
        }

        spline.points.push(new THREE.Vector3(10, 0, 0));

        var points = spline.getPoints(CURVE_ACCURACY);
        yLines[yLinePos].geometry.vertices = points;
        yLines[yLinePos].geometry.verticesNeedUpdate = true;
    }
}

window.onload = function() {
    window.scene = new THREE.Scene();

    var width = 20;
    var height = 20;

    window.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);

    var renderer = new THREE.WebGLRenderer();
    window.mapWidth = Math.min(window.innerWidth, window.innerHeight);
    renderer.setSize(window.mapWidth, window.mapWidth);
    document.body.appendChild(renderer.domElement);

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add(light);

    var mat = new THREE.LineBasicMaterial({color: 0x444444});
    for (var x = 0; x < 20; x++) {
        var tempGeo = new THREE.Geometry();
        var line = new THREE.Line(tempGeo, mat);
        line.position.x = x - 10;
        scene.add(line);
        xLines.push(line);
    }

    for (var y = 0; y < 20; y++) {
        var tempGeo = new THREE.Geometry();
        var line = new THREE.Line(tempGeo, mat);
        line.position.y = y - 10;
        scene.add(line);
        yLines.push(line);
    }

    updateGrid();

    var geometry = new THREE.PlaneGeometry(20, 20);
    var material = new THREE.MeshBasicMaterial({color: 0x111111});
    var plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    var geometry = new THREE.SphereGeometry(0.5, 20, 20);
    var material = new THREE.MeshBasicMaterial({color: 0xd35400});
    window.player = new THREE.Mesh(geometry, material);
    scene.add(window.player);

    window.player.position.z = 0.1;

    camera.position.z = 18;

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
        if (window.worldMousePos && window.mouseDown && timeSinceLastBullet > 250) {
            lastBullet = Date.now();
            var direction = new THREE.Vector3(window.worldMousePos.x, window.worldMousePos.y);
            direction.sub(window.player.position).normalize();

            var particle = new Particle({
                position: new THREE.Vector3(window.player.position.x, window.player.position.y, 0),
                direction: direction,
                mass: 2,
                startColor: new THREE.Color(0xf1c40f),
                speed: .3
            });
        }

        var speed = 0.2;
        var moved = false;

        var yourDirection = new THREE.Vector3(0, 0, 0);

        if (window.keysPressed[87] && window.player.position.y + 0.5 + speed <= 10) {
            window.player.position.y += speed * deltaTime / 17;
            moved = true;
            yourDirection.y = 1;
        }

        if (window.keysPressed[83] && window.player.position.y - 0.5 - speed >= -10) {
            window.player.position.y -= speed * deltaTime / 17;
            moved = true;
            yourDirection.y = -1;
        }

        if (window.keysPressed[65] && window.player.position.x - 0.5 - speed >= -10) {
            window.player.position.x -= speed * deltaTime / 17;
            moved = true;
            yourDirection.x = -1;
        }

        if (window.keysPressed[68] && window.player.position.x + 0.5 + speed <= 10) {
            window.player.position.x += speed * deltaTime / 17;
            moved = true;
            yourDirection.x = 1;
        }

        if (moved && numLoops % 1 == 0) {
            var particleTrailSize = 0.5;
            var particleDir = new THREE.Vector3(yourDirection.x, yourDirection.y, 0);
            particleDir.normalize().negate();
            for (var x=0; x<5; x++) {
                var particle = new Particle({
                    position: new THREE.Vector3(window.player.position.x + Math.random() * particleTrailSize - particleTrailSize/2, window.player.position.y + Math.random() * particleTrailSize - particleTrailSize/2, 0),
                    direction: particleDir,
                    mass: 1,
                    speed: 0.01,
                    lifetime: 1000,
                    startColor: new THREE.Color(0xb8860b)
                })
            }
        }

        if (numLoops % spawnSpeed == 0) {
            new Enemy();
            spawnSpeed = Math.round(spawnSpeed * 0.98);
        }

        updateGrid();

        renderer.render(scene, camera);
        numLoops++;
    };

    window.keysPressed = {};

    render();

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
            (event.clientX / window.mapWidth) * 2 - 1,
            (event.clientY / window.mapWidth) * -2 + 1,
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

};