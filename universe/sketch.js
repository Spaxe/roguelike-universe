function setup() {
  colorMode(HSB, 1);
  createCanvas(800, 800);
}

function draw() {
  background(1);

  push();
    scale(4, 2);
    translate(0, 50);

    fill(0.04, 0.8, 0.9, 1);
    noStroke();
    strokeWeight(0.5);

    beginShape();
    vertex(50, 15);
    bezierVertex(50, -5, 75, 5, 50, 45);
    endShape();

    beginShape();
    vertex(50, 15);
    bezierVertex(50, -5, 25, 5, 50, 45);
    endShape();
  pop();
}
