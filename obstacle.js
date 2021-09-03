class Obstacle {

    constructor(x, y, z, r) {
        this.pos = createVector(x, y, z);
        this.r = r;
    }

    static getObstacle2D(x, y, r) {
        return new Obstacle(x, y, 0, r);
    }

    static getObstacle3D(x, y, z, r) {
        return new Obstacle(x, y, z, r);
    }

    isInside(pt) {
        return this.distanceTo(pt) < 0;
    }

    distanceTo(pt) {
        return this.pos.dist(pt) - this.r;
    }

    show2D() {
        noStroke();
        fill(150, 100);
        circle(this.pos.x, this.pos.y, 2 * this.r);
    }

    show3D() {
        push();
        translate(this.pos.x - width * 0.5, this.pos.y - height * 0.5, this.pos.z - width * 0.5);
        strokeWeight(0);
        fill(150, 100);
        sphere(this.r);
        pop();
    }
}