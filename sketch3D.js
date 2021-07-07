let flock = [];
let tree;
const TOTAL = 50;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    camera(0, 0, width * 1.2);

    for (let i = 0; i < TOTAL; i++) {
        flock.push(Boid.getBoid3D());
    }
    tree = Quadtree.getQuadTree3D(0, 0, 0, width, height, width, 25);

    let boid = Boid.getBoid3D();
    buildUI(width - 150, 20, tree.capacity, flock.length, boid.maxVel, boid.multC,
        boid.multA, boid.multS, boid.radiusC, boid.radiusA, boid.radiusS);
}

function draw() {
    orbitControl();

    // adjust settings to user input
    if (inputChanged) {
        tree.capacity = sliderCap.value();

        let len = flock.length
        for (let i = 0; i < sliderPop.value() - len; i++) {
            flock.push(Boid.getBoid2D());
        }
        flock = flock.slice(0, sliderPop.value());

        for (let boid of flock) {
            boid.updateSettings(sliderMaxVel.value(), sliderMultC.value(), sliderMultA.value(), sliderMultS.value(), sliderRadiusC.value(), sliderRadiusA.value(), sliderRadiusS.value());
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
        boid.steerWithQuadTree(tree);
    }

    for (let boid of flock) {
        boid.edges();
        boid.update();
        boid.show3D();
    }

    noFill();
    strokeWeight(2);
    stroke(255, 0, 0);
    box(width, height, width);

    showFrames();
}