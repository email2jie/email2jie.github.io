const Grid = require('./grid'),
    Viewport = require('./viewport');
    Structure = require('./structures/structure'),
    Structures = require('./structures/structures');

const Game = function(ctx) {
  this.ctx = ctx;
  this.grid = new Grid();
  this.viewport = new Viewport(this.grid, this.ctx);

  this.playing = false;
  this.speed = 1000;

  this.tabFocus = true;

  this.cycle();
};

Game.prototype.cycle = function () {
  let cycleStart = new Date().getTime();

  this.render(cycleStart);
};

Game.prototype.render = function (cycleStart) {
  let currentTime = new Date().getTime() - cycleStart;
  let percentage = currentTime / this.speed;

  if (percentage >= 1) {
    percentage %= 1;
    cycleStart += this.speed;

    if (!this.tabFocus) { this.playing = false; }
    this.playing ? this.grid.toggleCells() : this.grid.finishCycle();

    this.viewport.setCellStates(this.grid.states);
  }

  this.viewport.render(percentage);

  requestAnimationFrame(this.render.bind(this, cycleStart));
};

Game.prototype.togglePlayState = function () {
  this.playing = !this.playing;
};

Game.prototype.toggleGridlines = function () {
  this.viewport.toggleGridlines();
};

Game.prototype.setZoomLevel = function (newZoom) {
  this.viewport.setZoomLevel(newZoom);
};

Game.prototype.setSpeed = function (newSpeed) {
  this.speed = newSpeed;
};

Game.prototype.toggleTabFocus = function () {
  this.tabFocus = this.tabFocus ? false : true;
};

Game.prototype.highlightCells = function (mousePos) {
  let data = {
    mousePos: mousePos,
    width: this.selectedStructure.width,
    height: this.selectedStructure.height
  };

  this.viewport.setHighlightData(data);
};

Game.prototype.clearHighlightData = function () {
  this.viewport.setHighlightData(null);
};

Game.prototype.addStructure = function (structure, startPos) {
  structure.awaken(this.grid, startPos);


  let posKeys = structure.targetCells(startPos).map(function(pos) {
    return pos.join(',');
  });

  this.viewport.setCellStates(this.grid.states);
};

Game.prototype.addSelectedStructure = function (mousePos) {
  let pos = this.viewport.calculateGridPos(mousePos);

  this.addStructure(this.selectedStructure, pos);
};

Game.prototype.setSelectedStructure = function (structure) {
  this.selectedStructure = structure;
};

Game.prototype.setOffsets = function (startPos, endPos) {
  this.viewport.setOffsets(startPos, endPos);
};

Game.prototype.clearGrid = function () {
  this.grid.clear();
  this.viewport.setCellStates(this.grid.states);
};

module.exports = Game;
