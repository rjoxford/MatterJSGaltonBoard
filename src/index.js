import {
  Engine,
  Render,
  Mouse,
  MouseConstraint,
  World,
  Composite,
  Composites,
  Bodies,
  Body,
  Events
} from "matter-js";

///////////////////////////////////////////////// Describe Key Constants
// The key constants below allow for easier "tweaking"
// Where possible, consants are set relative to more fundamental constants
// Set key defaults for the applet
// Key dimensions
const width = 1000;
const height = 1000;

const xStart = width / 2;
const yStart = 100;

const rows = 14;

const ballRadius = 10;
// Make
const pegGap = 4 * ballRadius;
const pegRadius = 0.3 * ballRadius;

const maxBalls = 100;

// Physics Constants
const restitution = 1 / 100;
const friction = 0.01;
const frictionAir = 0.08;
const slop = 0;
const gravity = 1;
const gravitySF = 0.0018;
const timeScale = 1;

///////////////////////////////////////////////// Setup MatterJS
// 1. setup engine
let engine = Engine.create();
engine.timing.timeScale = timeScale;
Engine.run(engine);

// 2. setup render
let render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height,
    wireframe: false,
    showAngleIndicator: true
  }
});
Render.run(render);

// 3. get world from engine
let world = engine.world;
world.gravity.scale = gravitySF;

// For peg positions, consider positions from top left
// Row x offset according to total number rows
// Individual offset according to count within row

///////////////////////////////////////////////// (Above)Top: Bucket
let pegSet = () => {
  // Set gaps
  let xGap = pegGap;
  let yGap = xGap * Math.sin(Math.PI / 3);

  //each row
  let rowOffset = 3;
  for (let row = 0 + rowOffset; row + rowOffset < rows + 1 + rowOffset; row++) {
    let yOffset = yGap * (row - rowOffset) + 40;
    let xRowOffset = (xGap * row - xGap) / 2;
    //each peg
    for (let j = 0; j < row; j++) {
      let xOffset = xGap * j;
      let peg = Bodies.circle(xStart - xRowOffset + xOffset, yStart + yOffset, pegRadius, {
        restitution,
        friction,
        isStatic: true
      });
      World.add(world, peg);
    }
  }
};
pegSet();

///////////////////////////////////////////////// Base: Floor and Partitions
let floor = Bodies.rectangle(xStart, height - 20, width - 4, 20, {
  restitution,
  isStatic: true
});
World.add(world, floor);

const createPartitionSet = () => {
  let count = rows + 2;
  let wallheight = height - yStart - rows * pegGap * Math.sin(Math.PI / 3);
  for (let i = 0; i < count; i++) {
    let partition = Bodies.rectangle(
      xStart - (rows * pegGap) / 2 + (i - 0.5) * pegGap,
      height - yStart / 2 - wallheight / 2 + 16,
      4,
      wallheight,
      {
        isStatic: true
      }
    );
    World.add(world, partition);
  }
};
createPartitionSet();

// Show start position
// let addStartmark = () => {
//   let startmark = Bodies.circle(xStart, yStart, 1.5 * pegRadius, {
//     isStatic: true
//   });
//   World.add(world, startmark);
// };
// addStartmark();

// Create bucket
const bucketwallLength = 600;
const bucketwallAngle = Math.PI / 3;
let leftBumper_xpos =
  xStart - (3 / 2) * ballRadius - (bucketwallLength * Math.cos(bucketwallAngle)) / 2;
let leftBumper_ypos = 10 + yStart - (bucketwallLength * Math.sin(bucketwallAngle)) / 2;

let rightwall_xpos =
  xStart + (3 / 2) * ballRadius + (bucketwallLength * Math.cos(bucketwallAngle)) / 2;
let rightwall_ypos = leftBumper_ypos;

const createBoundaries = () => {
  let leftBumper = Bodies.rectangle(leftBumper_xpos, leftBumper_ypos, bucketwallLength, 5, {
    restitution,
    friction: 0,
    isStatic: true
  });
  Body.rotate(leftBumper, bucketwallAngle);
  World.add(world, leftBumper);
  let rightwall = Bodies.rectangle(rightwall_xpos, rightwall_ypos, bucketwallLength, 5, {
    restitution,
    friction: 0,
    isStatic: true
  });
  Body.rotate(rightwall, -bucketwallAngle);
  World.add(world, rightwall);
};
createBoundaries();

///////////////////////////////////////////////// Balls...
// Generate randomness
let randomPosNeg = () => {
  let random = Math.sin(2 * Math.PI * Math.random());
  // Add some skey for better bell curve
  return Math.pow(random, 3);
};
let vx = () => {
  return 0.3 * randomPosNeg();
};
// let vx = 1

// Define Balls
let addBall = (x, y) => {
  let ball = Bodies.circle(x, y, ballRadius, {
    restitution,
    friction,
    frictionAir,
    slop,
    isStatic: false,
    label: "ball"
  });
  Body.setVelocity(ball, { x: vx(), y: 0 });
  Body.setAngularVelocity(ball, randomPosNeg() / 8);
  World.add(world, ball);
};
let createBalls = (numberBalls) => {
  for (let i = 0; i < numberBalls; i++) {
    addBall(xStart + randomPosNeg() * numberBalls, yStart - 300 - i * ballRadius);
    //addBall(xStart, yStart-100)
  }
};
createBalls(maxBalls);

///////////////////////////////////////////////// Time controlled functions
//TODO - clear and reset interval on window active/inactive
// const Interval = setInterval(() => {
//   addBall(xStart, yStart);
//   // as a precaution remove plinkos from world.bodies if the array surpasses a certain threshold
//   const existingBalls = world.bodies.filter(body => body.label === "ball");
//   if (existingBalls.length > 200) {
//     World.remove(world, existingBalls[0]);
//   }
// }, 1200);

///////////////////////////////////////////////// Mouse Control
var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse
});
World.add(world, mouseConstraint);
// keep the mouse in sync with rendering
render.mouse = mouse;

Events.on(mouseConstraint, "mousedown", (event) => {
  //if (source.body === null) {
  //var box = Bodies.rectangle(mouse.position.x, mouse.position.y, 20, 20);
  //World.add(world, box);
  //}
  addBall();
});
