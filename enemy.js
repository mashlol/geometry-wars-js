(function() {
    window.enemies = {};
    var _id = 0;

    var material = new THREE.MeshBasicMaterial({color: 0x2980b9});
    var Enemy = function(position) {
        var geometry = new THREE.CubeGeometry(0.5, 0.5, 1);
        var enemy = new THREE.Mesh(geometry, material);
        window.scene.add(enemy);

        this.object = enemy;
        this.health = 1;

        this.speed = Math.random() * 0.12;

        if (this.speed < 0.04)
            this.speed = 0.04;

        var spawnPoint;
        while (true) {
            spawnPoint = new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, 0);
            if ((spawnPoint.x > window.player.position.x + 1 || spawnPoint.x < window.player.position.x - 1)
                && (spawnPoint.y > window.player.position.y + 1 || spawnPoint.y < window.player.position.y - 1)) {
                break;
            }
        }
        this.object.position = spawnPoint;

        this.id = _id++;
        window.enemies[this.id] = this;
    };

    Enemy.prototype.logic = function(deltaTime) {
        var playerPos = new THREE.Vector3(window.player.position.x, window.player.position.y, 0);
        var direction = playerPos.sub(this.object.position).normalize().multiplyScalar(this.speed * deltaTime / 17);

        var collidedEnemy = this.collidesWithAnyEnemy();
        if (collidedEnemy) {
            var yourPos = new THREE.Vector3(this.object.position.x, this.object.position.y);
            var fixDir = yourPos.sub(collidedEnemy.object.position);
            this.object.position.add(fixDir.multiplyScalar(0.1));
        }
        this.object.position.add(direction);
        this.direction = direction.normalize();

        if (this.collidesWith(window.player)) {
            // document.body.innerHTML = "Game Over!";
        }
    }

    Enemy.prototype.collidesWithAnyEnemy = function() {
        for (var id in window.enemies) {
            var enemy = window.enemies[id];

            if (id != this.id && this.collidesWithEnemy(enemy)) {
                return enemy;
            }
        }
        return false;
    }

    Enemy.prototype.collidesWithEnemy = function(enemy) {
        return this.collides(enemy.object.position.x, enemy.object.position.y, 0.5, 0.5);
    };

    Enemy.prototype.collidesWith = function(player) {
        return this.collides(player.position.x, player.position.y, 1, 1);
    };

    Enemy.prototype.collides = function(x, y, w, h) {
        var halfW = w / 2;
        var halfH = h / 2;

        var halfOurW = 0.25;
        var halfOurH = 0.25;

        if (this.object.position.x + halfOurW > x - halfW && this.object.position.x - halfOurW < x + halfW && this.object.position.y + halfOurH > y - halfH && this.object.position.y - halfOurH < y + halfH) {
            return true;
        }

        return false;
    };

    Enemy.prototype.damage = function() {
        this.health -= 1;
        if (this.health <= 0) {
            scene.remove(this.object);
            delete window.enemies[this.id];
        }
    }

    window.Enemy = Enemy;
})();