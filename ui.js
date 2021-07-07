let x, y;
const FONT_SIZE = 12;
let framesP;
let frames = [];
let inputChanged;
let sliderPop,
    sliderCap,
    sliderMultC,
    sliderMultA,
    sliderMultS,
    sliderMaxVel,
    sliderRadiusC,
    sliderRadiusA,
    sliderRadiusS,
    checkboxTree;

function buildUI(_x, _y, capacity, population, maxVel, multC, multA, multS, radiusC, radiusA, radiusS) {
    x = _x;
    y = _y;
    inputChanged = false;

    framesP = createP();
    framesP.position(x + 5, y);
    framesP.style('font-size', `${FONT_SIZE}px`);

    checkboxTree = buildCheckbox("show Quadtree", x, getNextY(FONT_SIZE * 3));
    sliders = [
        sliderCap = buildSlider("Capacity", x, getNextY(FONT_SIZE * 3), 1, 50, capacity, 1),
        sliderPop = buildSlider("Population", x, getNextY(FONT_SIZE * 4), 1, 200, population, 1),
        sliderMaxVel = buildSlider("Velocity", x, getNextY(FONT_SIZE * 4), 0.1, 10, maxVel, 0.1),
        sliderMultC = buildSlider("Cohesion", x, getNextY(FONT_SIZE * 4), 0, 5, multC, 0.1),
        sliderMultA = buildSlider("Alignment", x, getNextY(FONT_SIZE * 4), 0, 5, multA, 0.1),
        sliderMultS = buildSlider("Separation", x, getNextY(FONT_SIZE * 4), 0, 5, multS, 0.1),
        sliderRadiusC = buildSlider("Cohesion Radius", x, getNextY(FONT_SIZE * 4), 10, max(windowWidth, windowHeight), radiusC, 1),
        sliderRadiusA = buildSlider("Alignment Radius", x, getNextY(FONT_SIZE * 4), 10, max(windowWidth, windowHeight), radiusA, 1),
        sliderRadiusS = buildSlider("Separation Radius", x, getNextY(FONT_SIZE * 4), 10, max(windowWidth, windowHeight), radiusS, 1)
    ];

    y = _y; // reset y
}


function showFrames() {
    framesP.html(`Frame Rate: ${getAvgFrames()}`);
}

function getAvgFrames() {
    const totalFrames = 20;

    frames.push(frameRate());
    if (frames.length > totalFrames) {
        frames = frames.slice(1);
    }

    return round(frames.reduce((sum, current) => sum + current) / frames.length);
}

function buildSlider(label, _x, _y, minVal, maxVal, currentVal, step) {
    let slider = createSlider(minVal, maxVal, currentVal, step)
    slider.position(_x, _y);

    let p = createP(`${label}: ${slider.value()}`);
    p.position(_x + 5, _y + FONT_SIZE * 1.5);
    p.style('font-size', `${FONT_SIZE}px`);

    slider.input(() => {
        inputChanged = true
        p.html(`${label}: ${slider.value()}`);
    });

    return slider;
}

function buildCheckbox(label, _x, _y) {
    let checkbox = createCheckbox();
    checkbox.position(_x, _y);

    let p = createP(`${label}`);
    p.position(_x + 25, _y);
    p.style('font-size', `${FONT_SIZE}px`);

    return checkbox;
}

function getNextY(offset) {
    return y += offset;
}