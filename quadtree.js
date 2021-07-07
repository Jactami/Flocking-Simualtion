class Point {

    constructor(x, y, z, data) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.data = data;
    }
}

class Cuboid {

    constructor(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.h = h;
        this.d = d;
    }
}

class Quadtree {

    constructor(x, y, z, w, h, d, capacity) {
        this.bounds = new Cuboid(x, y, z, w, h, d);
        this.capacity = capacity || 1;
        this.objects = [];
        this.nodes = [];
    }

    static getQuadTree2D(x, y, w, h, capacity) {
        return new Quadtree(x, y, 0, w, h, 0, capacity);
    }

    static getQuadTree3D(x, y, z, w, h, d, capacity) {
        return new Quadtree(x, y, z, w, h, d, capacity);
    }

    insert(obj) {
        if (this.nodes.length) {
            // insert into subnodes
            for (let node of this.nodes) {
                if (node.isInside(obj)) {
                    node.insert(obj);
                    return;
                }
            }
            return;
        }

        // "leaf" reached
        this.objects.push(obj);

        // split into subnodes if capacity is exceeded
        if (this.objects.length > this.capacity) {
            let x = this.bounds.x;
            let y = this.bounds.y;
            let z = this.bounds.z;
            let subWidth = this.bounds.w * 0.5;
            let subHeight = this.bounds.h * 0.5;
            let subDepth = this.bounds.d * 0.5;

            // 2D cuboids
            this.nodes[0] = new Quadtree(x, y, z, subWidth, subHeight, subDepth, this.capacity);
            this.nodes[1] = new Quadtree(x + subWidth, y, z, subWidth, subHeight, subDepth, this.capacity);
            this.nodes[2] = new Quadtree(x, y + subHeight, z, subWidth, subHeight, subDepth, this.capacity);
            this.nodes[3] = new Quadtree(x + subWidth, y + subHeight, z, subWidth, subHeight, subDepth, this.capacity);

            // 3D cuboids
            if (subDepth !== 0) {
                this.nodes[4] = new Quadtree(x, y, z + subDepth, subWidth, subHeight, subDepth, this.capacity);
                this.nodes[5] = new Quadtree(x + subWidth, y, z + subDepth, subWidth, subHeight, subDepth, this.capacity);
                this.nodes[6] = new Quadtree(x, y + subHeight, z + subDepth, subWidth, subHeight, subDepth, this.capacity);
                this.nodes[7] = new Quadtree(x + subWidth, y + subHeight, z + subDepth, subWidth, subHeight, subDepth, this.capacity);
            }

            // add objects into new subnodes
            for (let object of this.objects) {
                this.insert(object);
            }
            this.objects = [];
        }
    }

    isInside(obj) {
        let minX = this.bounds.x;
        let minY = this.bounds.y;
        let minZ = this.bounds.z;
        let maxX = minX + this.bounds.w;
        let maxY = minY + this.bounds.h;
        let maxZ = minZ + this.bounds.d;
        return obj.x >= minX && obj.x <= maxX && obj.y >= minY && obj.y <= maxY && obj.z >= minZ && obj.z <= maxZ;
    }

    isInRange(x, y, z, range) {
        return x >= this.bounds.x - range && x < this.bounds.x + this.bounds.w + range &&
            y >= this.bounds.y - range && y < this.bounds.y + this.bounds.h + range &&
            z >= this.bounds.z - range && z < this.bounds.z + this.bounds.d + range;
    }

    getObjectsInRadius(x, y, z, radius) {
        let inRadius = [];
        if (this.nodes.length) {
            for (let node of this.nodes) {
                if (node.isInRange(x, y, z, radius)) {
                    inRadius.push(...node.getObjectsInRadius(x, y, z, radius));
                }
            }
        } else if (this.objects.length) {
            for (let object of this.objects) {
                let distSqrd = (object.x - x) ** 2 + (object.y - y) ** 2 + (object.z - z) ** 2;
                if (distSqrd <= radius ** 2) {
                    inRadius.push(object);
                }
            }
        }

        return inRadius;
    }

    clear() {
        this.objects = [];
        this.nodes = [];
    }

    countObjects() {
        let counter = 0;

        if (this.nodes.length) {
            for (let node of this.nodes) {
                counter += node.countObjects();
            }
        }

        if (this.objects.length) {
            return this.objects.length;
        }

        return counter;
    }

    show() {
        if (this.bounds.d === 0) {
            this.show2D();
        } else {
            this.show3D();
        }
    }

    show2D() {
        stroke(255, 20);
        strokeWeight(1);
        noFill()
        rect(this.bounds.x, this.bounds.y, this.bounds.w, this.bounds.h);
        for (let node of this.nodes) {
            node.show2D();
        }
    }

    show3D() {
        push();
        stroke(255, 10);
        strokeWeight(1);
        noFill();
        let dx = this.bounds.x + this.bounds.w * 0.5 - width * 0.5;
        let dy = this.bounds.y + this.bounds.h * 0.5 - height * 0.5;
        let dz = this.bounds.z + this.bounds.d * 0.5 - width * 0.5;
        translate(dx, dy, dz);
        box(this.bounds.w, this.bounds.h, this.bounds.d);
        pop();
        for (let node of this.nodes) {
            node.show3D();
        }
    }
}