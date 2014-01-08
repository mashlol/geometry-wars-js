(function() {
    var _id = 0;

    var Particle = function(args) {
        if (Object.keys(window.particles).length > 1000) {
            return;
        }

        this.position = args.position;
        this.direction = args.direction;
        this.lifetime = args.lifetime || -1;
        this.speed = args.speed || 0.2;
        this.mass = (args.mass !== undefined) ? args.mass : 1;

        this.startColor = args.startColor || Math.round(Math.random() * 16777215);
        this.endColor = args.endColor || this.startColor;

        var size = 0.2 * this.mass || 0.08;
        if (this.lifetime != -1)
            size *= Math.random()

        if (this.lifetime != -1)
            this.lifetime *= Math.random();

        if (this.lifetime != -1 && this.lifetime < 50)
            this.lifetime = 50;

        if (size < 0.04)
            size = 0.04
        var geometry = new THREE.CubeGeometry(size, size / 6.7, 1);
        var material = new THREE.MeshBasicMaterial({color: this.startColor, transparent: true});
        var particle = new THREE.Mesh(geometry, material);
        particle.position = args.position;

        if (args.direction.y < 0)
            particle.rotation = new THREE.Euler(0, 0, 2 * Math.PI - args.direction.angleTo(new THREE.Vector3(1, 0, 0)));
        else
            particle.rotation = new THREE.Euler(0, 0, args.direction.angleTo(new THREE.Vector3(1, 0, 0)));
        window.scene.add(particle);

        this.object = particle;

        this.id = _id++;
        this.timeCreated = Date.now();
        window.particles[this.id] = this;
    };

    Particle.prototype.project = function(deltaTime) {
        var direction = new THREE.Vector3(this.direction.x, this.direction.y, this.direction.z);
        this.object.position.add(direction.multiplyScalar(this.speed * deltaTime / 17));

        if (this.object.position.x > 10 || this.object.position.y > 10 || this.object.position.x < -10 || this.object.position.y < -10) {
            this._destroy(true);
            return;
        }

        if (this.lifetime > 0) {
            var timeToDie = this.lifetime - Date.now() + this.timeCreated;
            var lifePercent = timeToDie / this.lifetime;
            if (lifePercent < 0)
                lifePercent = 0;
            this.object.material.opacity = lifePercent;
            if (this.endColor != this.startColor) {
                var red = this.startColor.r + (this.endColor.r - this.startColor.r) * Math.sqrt(1-lifePercent);
                var green = this.startColor.g + (this.endColor.g - this.startColor.g) * Math.sqrt(1-lifePercent);
                var blue = this.startColor.b + (this.endColor.b - this.startColor.b) * Math.sqrt(1-lifePercent);

                this.object.material.color.setRGB(red, green, blue);
            }
            if (Date.now() - this.timeCreated > this.lifetime) {
                this._destroy(false);
                return;
            }
        }

        // Check for collision
        for (var id in window.enemies) {
            var enemy = window.enemies[id];

            if (this.lifetime < 0 && this.collidesWith(enemy)) {
                enemy.damage();
                this._destroy(true);
                return;
            }
        }
    };

    Particle.prototype.collidesWith = function(enemy) {
        return this.collides(enemy.object.position.x, enemy.object.position.y, 1, 1);
    };

    Particle.prototype.collides = function(x, y, w, h) {
        var halfW = w / 2;
        var halfH = h / 2;
        if (this.object.position.x > x - halfW && this.object.position.x < x + halfW && this.object.position.y > y - halfH && this.object.position.y < y + halfH) {
            return true;
        }

        return false;
    };

    Particle.prototype._destroy = function(collided) {
        scene.remove(this.object);
        delete window.particles[this.id];

        if (this.mass > 0 && collided) { // && this.object.material.opacity > 0.1) {
            var numParticles = this.mass * 5;
            var lifetime = this.mass * 200;
            for (var theta = 0; theta <= 2 * Math.PI; theta += 2 * Math.PI / numParticles) {
                (function(particle, theta) {
                    setTimeout(function() {
                        var speed = particle.mass * 0.1 * Math.random();
                        theta = Math.round(theta * 100) / 100;
                        y = Math.sin(theta)
                        x = Math.cos(theta);

                        var position = new THREE.Vector3(particle.object.position.x, particle.object.position.y, particle.object.position.z);

                        new Particle({
                            position: position,
                            direction: new THREE.Vector3(x, y, 0).normalize(),
                            mass: particle.mass - 1,
                            lifetime: lifetime,
                            speed: speed,
                            startColor: new THREE.Color(0xc0392b),
                            endColor: new THREE.Color(0xd35400)
                        });
                    }, 1);
                })(this, theta);
            }
        }
    };

    window.Particle = Particle;
})();
