class Boid {

    constructor(x, y, z) {
        this.pos = createVector(x, y, z);
        this.vel = p5.Vector.random3D();
        this.acc = createVector();
        this.maxForce = 0.2;
        this.r = 5;
        this.c = color(255, 100);

        this.updateSettings(5, 1.5 * PI, 1, 1, 1.5, 2, 150, 150, 50, 100);

        this.vel.setMag(this.maxVel);
    }

    static getBoid2D(x, y) {
        let boid = new Boid(x, y, 0);
        boid.vel.z = 0;
        return boid;
    }

    static getBoid3D(x, y, z) {
        return new Boid(x, y, z);
    }

    updateSettings(maxVel, fov, multC, multA, multS, multO, radiusC, radiusA, radiusS, radiusO) {
        this.maxVel = maxVel;
        this.fov = fov;
        this.multC = multC;
        this.multA = multA;
        this.multS = multS;
        this.multO = multO;
        this.radiusC = radiusC;
        this.radiusA = radiusA;
        this.radiusS = radiusS;
        this.radiusO = radiusO;
    }

    edges() {
        if (this.pos.x > width) {
            this.pos.x %= width;
        } else if (this.pos.x < 0) {
            this.pos.x += width;
        }
        if (this.pos.y > height) {
            this.pos.y %= height;
        } else if (this.pos.y < 0) {
            this.pos.y += height;
        }
        if (this.pos.z > width) {
            this.pos.z %= width;
        } else if (this.pos.z < 0) {
            this.pos.z += width;
        }
    }

    getNeighbors(flock, radius) {
        let neighbors = [];
        for (let boid of flock) {
            // self check
            if (boid === this)
                continue;

            // check if boid is in range
            let d = dist(this.pos.x, this.pos.y, this.pos.z, boid.pos.x, boid.pos.y, boid.pos.z);
            if (d > radius)
                continue;

            // check if boid is inside field of view
            if (!this.isInFov(boid))
                continue;

            neighbors.push(boid);
        }

        return neighbors;
    }

    isInFov(boid) {
        let v = p5.Vector.sub(this.pos, boid.pos);
        let angle = v.angleBetween(this.vel);

        return PI - abs(angle) <= this.fov * 0.5;
    }

    steer(flock) {
        this.acc = createVector();
        this.acc.add(this.cohesion(this.getNeighbors(flock, this.radiusC)).mult(this.multC))
            .add(this.alignment(this.getNeighbors(flock, this.radiusA)).mult(this.multA))
            .add(this.separation(this.getNeighbors(flock, this.radiusS)).mult(this.multS))
            .add(this.avoid(obstacles).mult(this.multO));
    }

    getNeighborsWithQuadTree(quadTree, radius) {
        let neighbors = quadTree.getObjectsInRadius(this.pos.x, this.pos.y, this.pos.z, radius).map(b => b.data);
        neighbors = neighbors.filter(neighbor => neighbor !== this && this.isInFov(neighbor));

        return neighbors;
    }

    steerWithQuadTree(quadTree, obstacles) {
        this.acc = createVector();
        this.acc.add(this.cohesion(this.getNeighborsWithQuadTree(quadTree, this.radiusC)).mult(this.multC))
            .add(this.alignment(this.getNeighborsWithQuadTree(quadTree, this.radiusA)).mult(this.multA))
            .add(this.separation(this.getNeighborsWithQuadTree(quadTree, this.radiusS)).mult(this.multS))
            .add(this.avoid(obstacles).mult(this.multO));
    }

    cohesion(neighbors) {
        if (neighbors.length === 0)
            return createVector();

        let target = neighbors.reduce((sum, current) => {
            if (current !== this) {
                return sum.add(current.pos);
            }
            return sum;
        }, createVector());
        target.div(neighbors.length);

        let force = p5.Vector.sub(target, this.pos);
        force.setMag(this.maxVel);
        force.sub(this.vel);
        force.limit(this.maxForce);

        return force;
    }

    separation(neighbors) {
        if (neighbors.length === 0)
            return createVector();

        let repulsion = neighbors.reduce((sum, current) => {
            if (current !== this) {
                let d = dist(this.pos.x, this.pos.y, this.pos.z, current.pos.x, current.pos.y, current.pos.z);
                return sum.add(p5.Vector.sub(this.pos, current.pos).div(d * d));
            }
            return sum;
        }, createVector());
        repulsion.div(neighbors.length);
        repulsion.setMag(this.maxVel);

        let force = p5.Vector.sub(repulsion, this.vel);
        force.limit(this.maxForce);

        return force;
    }

    alignment(neighbors) {
        if (neighbors.length === 0)
            return createVector();

        let dir = neighbors.reduce((sum, current) => {
            if (current !== this) {
                return sum.add(current.vel);
            }
            return sum;
        }, createVector());
        dir.div(neighbors.length);
        dir.setMag(this.maxVel);

        let force = p5.Vector.sub(dir, this.vel);
        force.limit(this.maxForce);

        return force;
    }

    avoid(obstacles) {
        let dir = p5.Vector.normalize(this.vel);
        let dynLen = this.vel.mag() / this.maxVel;
        let ahead = p5.Vector.add(this.pos, dir.mult(this.radiusO * dynLen));
        let prediction = p5.Vector.add(this.pos, dir.mult(0.5)); // p5.Vector.add(this.pos, this.vel)?
        prediction = p5.Vector.add(this.pos, this.vel);

        // find closest and most threatening obstacle
        let closest;
        let dMin = Infinity;
        for (let obstacle of obstacles) {
            if (obstacle.isWithin(ahead) || obstacle.isWithin(prediction) || obstacle.isWithin(this.pos)) {
                let d = obstacle.distanceTo(this.pos);
                if (d < dMin) {
                    dMin = d;
                    closest = obstacle;
                }
            }
        }

        if (!closest)
            return createVector(0, 0);

        // calculate steering force
        let force = p5.Vector.sub(ahead, closest.pos);
        force.setMag(this.maxForce);

        return force;
    }

    show2D() {
        push();
        translate(this.pos);
        rotate(this.vel.heading());
        strokeWeight(1);
        stroke(255);
        fill(this.c);
        triangle(-this.r, -this.r * 0.5, -this.r, this.r * 0.5, this.r, 0);
        pop();
    }

    show3D() {
        push();
        translate(this.pos.x - width * 0.5, this.pos.y - height * 0.5, this.pos.z - width * 0.5);
        strokeWeight(0);
        fill(this.c);
        sphere(this.r);
        translate(this.vel.setMag(this.r));
        sphere(this.r * 0.5);
        pop();
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxVel);
        this.pos.add(this.vel);
    }
}

class Traitor extends Boid {

    constructor() {
        super();
        this.c = color(255, 0, 0, 100);
    }

    steer() {
        // do nothing!
    }
}