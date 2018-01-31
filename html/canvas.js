// Get canvas
var canvas = document.getElementById('canvas');

// Box Declarations
var BOX_WIDTH = 50;
var BOX_HEIGHT = 50

var objects = [];
objects.push({id: "blueBox", w:BOX_WIDTH, h:BOX_HEIGHT, x:50,y:canvas.height/2 - BOX_HEIGHT/2, color: "blue", isSelected: false});
objects.push({id: "redBox", w:BOX_WIDTH, h:BOX_HEIGHT, x:canvas.width - 100,y:canvas.height/2 - BOX_HEIGHT/2, color: "red", isSelected: false});
objects.push({id: "yellowBox", w:BOX_WIDTH, h:BOX_HEIGHT, x:canvas.width/2 - BOX_WIDTH/2,y:canvas.height/2 - BOX_HEIGHT/2, color: "yellow", isSelected: false});
var squareBeingMoved;

// Math variables
var deltaX, deltaY;

// USER variables
var person;
var colorSelected;
var client = [];

// OBJ variables
var receivedData;

// Declaring hard-coded keys
var ENTER = 13;
var RIGHT_ARROW = 39;
var LEFT_ARROW = 37;
var UP_ARROW = 38;
var DOWN_ARROW = 40;

var drawCanvas = function(){
  // Get 2d context
  var context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height); // erase canvas

  for(var i = 0; i < objects.length; i++){
    if (objects[i].isSelected) {
      context.lineWidth = 8;
      if (colorSelected == objects[i].color)
        context.strokeStyle = 'navy';
      else context.strokeStyle = 'black';
      context.strokeRect(objects[i].x, objects[i].y, objects[i].w, objects[i].h);
      context.fillStyle = objects[i].color;
      context.fillRect(objects[i].x, objects[i].y, objects[i].w, objects[i].h);
      // Write name above box
      for (var j = 0; j < client.length; j++) {
        if (client[j].color == objects[i].color) {
          context.font = '12pt Courier';
          context.fillStyle = 'black';
          context.textAlign = 'center';
          context.fillText(client[j].name, objects[i].x + BOX_WIDTH/2, objects[i].y - 10);
        }
      }
    }
  }
}

////// FUNCTIONS //////

// Return object if mouse is within dimensions
function getObjectAtLocation(aCanvasX, aCanvasY){
  var endX = objects[0].x + objects[0].w;
  var endY = objects[0].y + objects[0].h;
  console.log(objects[0].id + ": " + objects[0].x + ", " + endX);
  console.log(objects[0].id + ": " + objects[0].y + ", " + endY);

  for(var i = 0; i < objects.length; i++){
    if(objects[i].x <= aCanvasX && objects[i].x + objects[i].w >= aCanvasX &&
       objects[i].y <= aCanvasY && objects[i].y + objects[i].h >= aCanvasY){
      console.log("Picked up " + objects[i].id);
      return objects[i];
    }
  }
  console.log('returning null');
  return null;
}

// When mouse click is pressed
function handleMouseDown(e){
  var rect = canvas.getBoundingClientRect();
  var canvasX = e.pageX - rect.left;
  var canvasY = e.pageY - rect.top;

  console.log("mouse down at (" + canvasX + ", " + canvasY + ")");

  squareBeingMoved = getObjectAtLocation(canvasX, canvasY);
  if (squareBeingMoved != null)
    if (squareBeingMoved.color == colorSelected){
      deltaX = squareBeingMoved.x - canvasX;
      deltaY = squareBeingMoved.y - canvasY;
      $('canvas').mousemove(handleMouseMove);
      $('canvas').mouseup(handleMouseUp);
    }

  e.stopPropagation();
  e.preventDefault();

  drawCanvas();
}

// When mouse click is pressed
function handleMouseMove(e){
  console.log("mouse move");
  // get mouse location relative to canvas top left
  var rect = canvas.getBoundingClientRect();
  var canvasX = e.pageX - rect.left;
  var canvasY = e.pageY - rect.top;
  if (squareBeingMoved != null){
    squareBeingMoved.x = canvasX + deltaX;
    squareBeingMoved.y = canvasY + deltaY;

    // Send Obj to server
    sendObject();
  }
  e.stopPropagation();
  drawCanvas(); // redraw the canvas
}

// When mouse click is released
function handleMouseUp(e){
  e.stopPropagation();
  // remove mouse move and mouse up handlers but leave mouse down handler
  $("#canvas").off("mousemove", handleMouseMove); // remove mouse move handler
  $("#canvas").off("mouseup", handleMouseUp); // remove mouse up handler
  drawCanvas(); // redraw the canvas
}

function handleTimer() {
  for (i in objects) {
    if (colorSelected == null) {
      if (objects[i].isSelected == true)
        document.getElementById(objects[i].id).style.display = 'none';
    }
    if (colorSelected != null) {
      if (objects[i].color != colorSelected)
        document.getElementById(objects[i].id).style.display = 'none';
    }
    // else if (objects[i].color != colorSelected)
    //   document.getElementById(objects[i].id).style.display = 'none';
  }
  drawCanvas();
}

$(document).ready(function(){
  // mouse down listener
  $("#canvas").mousedown(handleMouseDown);

  var timer = timer = setInterval(handleTimer, 30);
  drawCanvas();
  person = prompt("Please enter your name", "Harry Potter");
  alert("Welcome " + person);
  client.push({name: person, color: null});
});

// Color Selection
function blueSelection() {
  colorSelected = 'blue';
  for (var i = 0; i < client.length; i++) {
    if (client[i].name == person){
      client[i].color = colorSelected;
      ws.send(JSON.stringify(client[i]));
    }
  }
  objects[0].isSelected = true;
  ws.send(JSON.stringify(objects[0]));
}

function redSelection() {
  colorSelected = 'red';
  for (var i = 0; i < client.length; i++) {
    if (client[i].name == person){
      client[i].color = colorSelected;
      ws.send(JSON.stringify(client[i]));
    }
  }
  objects[1].isSelected = true;
  ws.send(JSON.stringify(objects[1]));
}

function yellowSelection() {
  colorSelected = 'yellow';
  for (var i = 0; i < client.length; i++) {
    if (client[i].name == person){
      client[i].color = colorSelected;
      ws.send(JSON.stringify(client[i]));
    }
  }
  objects[2].isSelected = true;
  ws.send(JSON.stringify(objects[2]));
}

// WebSocket Functions
var ws = new WebSocket('ws://' + window.document.location.host);

ws.onopen = function (event) {
  ws.send(JSON.stringify(client[0]));
  console.log(client[0]);
};

// Handle receiving messages
ws.onmessage = function(object) {
  receivedData = JSON.parse(object.data);
  // Receiving box coordinates from server
  if (receivedData.id == 'blueBox') {
    objects[0] = receivedData;
    objects[0].isSelected = true;
  }
  if (receivedData.id == 'redBox') {
    objects[1] = receivedData;
    objects[1].isSelected = true;
  }
  if (receivedData.id == 'yellowBox') {
    objects[2] = receivedData;
    objects[2].isSelected = true;
  }
  // Receiving client data from server
  if (receivedData.name != null) {
    client.push({name: receivedData.name, color: receivedData.color});
  }

  if (receivedData.color != null) {
    for (i in objects) {
      if (objects[i].color == receivedData.color)
        objects[i].isSelected = true
    }
  }

  drawCanvas();
}

function sendObject() {
  var object = squareBeingMoved;
  ws.send(JSON.stringify(object));
}
