let flock = [];
let tree;
let obstacles = [];
const TOTAL = 50;

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (let i = 0; i < TOTAL; i++) {
        flock.push(Boid.getBoid2D(random(width), random(height)));
    }
    tree = Quadtree.getQuadTree2D(0, 0, width, height, 25);

    let boid = Boid.getBoid2D();
    buildUI(
        width - 150, 20,
        tree.capacity,
        flock.length,
        obstacles.length,
        boid.maxVel,
        degrees(boid.fov),
        boid.multC,
        boid.multA,
        boid.multS,
        boid.multO,
        boid.radiusC,
        boid.radiusA,
        boid.radiusS,
        boid.radiusO
    );
}

function draw() {
    // adjust settings to user input
    if (inputChanged) {
        tree.capacity = sliderCap.value();

        let len = flock.length;
        for (let i = 0; i < sliderPop.value() - len; i++) {
            flock.push(Boid.getBoid2D(random(width), random(height)));
        }
        flock = flock.slice(0, sliderPop.value());

        len = obstacles.length;
        for (let i = 0; i < sliderObstacle.value() - len; i++) {
            let r = random(height * 0.05, height * 0.2);
            obstacles.push(Obstacle.getObstacle2D(random(r, width - r), random(r, height - r), r));
        }
        obstacles = obstacles.slice(0, sliderObstacle.value());


        for (let boid of flock) {
            boid.updateSettings(
                sliderMaxVel.value(),
                radians(sliderFov.value()),
                sliderMultC.value(),
                sliderMultA.value(),
                sliderMultS.value(),
                sliderMultO.value(),
                sliderRadiusC.value(),
                sliderRadiusA.value(),
                sliderRadiusS.value(),
                sliderRadiusO.value()
            );
        }

        inputChanged = false;
    }

    // build quadtree
    tree.clear();
    for (let boid of flock) {
        tree.insert(new Point(boid.pos.x, boid.pos.y, boid.pos.z, boid));
    }

    // show elements and simulate flock behaviour 
    background(0);
    if (checkboxTree.checked()) {
        tree.show();
    }

    for (let boid of flock) {
        // boid.flock(flock);
        boid.flockWithQuadTree(tree);
        boid.avoid(obstacles);
    }

    for (let obstacle of obstacles) {
        obstacle.show2D();
    }

    for (let boid of flock) {
        boid.edges();
        boid.update();
        boid.show2D();
    }

    showFrames();
}