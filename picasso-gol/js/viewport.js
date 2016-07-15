let Cell = require('./cell');

const Viewport = function(grid, ctx) {
  this.grid = grid;
  this.ctx = ctx;
  this.gridlines = true;
  this.zoomLevel = 4;
  this.offsets = [0, 0];
  this.cellOffsets = [0, 0];
  this.cellFractionOffsets = [0, 0];

  this.cells = [];
};

Viewport.prototype.render = function (percentage) {
  this.recontextualize();
  this.clear();

  this.cells.forEach(function(cell) {
    cell.renderOrb(percentage, this.cellOffsets)
  }.bind(this));

  if (this.highlightData) { this.highlightCells(); }
  if (this.gridlines) { this.addGridlines(); }
};

Viewport.prototype.recontextualize = function () {
  this.ctx.setTransform(
    this.zoomLevel,
    0,
    0,
    this.zoomLevel,
    this.ctx.canvas.width / 2 + this.cellFractionOffsets[0] * 5 * this.zoomLevel,
    this.ctx.canvas.height / 2 + this.cellFractionOffsets[1] * 5 * this.zoomLevel
  );
};

Viewport.prototype.clear = function () {
  let width = this.ctx.canvas.width,
      height = this.ctx.canvas.height;

  this.ctx.fillStyle = 'black';
  this.ctx.fillRect(width * -1, height * -1, width * 2, height * 2);
};

Viewport.prototype.addGridlines = function () {
  this.ctx.beginPath();
  for(let i = -80; i < 80; i++) {
    this.ctx.moveTo(this.ctx.canvas.width / -2, i * 5);
    this.ctx.lineTo(this.ctx.canvas.width / 2, i * 5);

    this.ctx.moveTo(i * 5, this.ctx.canvas.height / -2);
    this.ctx.lineTo(i * 5, this.ctx.canvas.height / 2);
  }

  this.ctx.strokeStyle = "gray";
  this.ctx.lineWidth = 0.125;
  this.ctx.stroke();
};

Viewport.prototype.highlightCells = function () {
  let pos = this.calculateGridPos(this.highlightData.mousePos),
      row = pos[0],
      col = pos[1];

  this.ctx.fillStyle = 'rgba(255,255,0,0.2)';
  this.ctx.fillRect(
    (row + this.cellOffsets[0]) * 5,
    (col + this.cellOffsets[1]) * 5,
    this.highlightData.width * 5,
    this.highlightData.height * 5
  );
};

Viewport.prototype.calculateGridPos = function (mousePos) {
  let offsets = [
    this.ctx.canvas.width / 2 + this.cellFractionOffsets[0] * 5 * this.zoomLevel,
    this.ctx.canvas.height / 2 + this.cellFractionOffsets[1] * 5 * this.zoomLevel
  ];

  return mousePos.map(function(dim, idx) {
    let offset = dim - offsets[idx];
    return Math.floor(offset / 5 / this.zoomLevel) - this.cellOffsets[idx];
  }.bind(this));
};

Viewport.prototype.toggleGridlines = function () {
  this.gridlines = this.gridlines ? false : true;
};

Viewport.prototype.setCellStates = function (states) {
  this.cells = [];
  let self = this;

  Object.keys(states).forEach(function(state) {
    states[state].forEach(function(posKey) {
      let pos = posKey.split(',').map(function(i) { return parseInt(i); });


      cell = new Cell(...pos, state, self.ctx);
      self.cells.push(cell);
    });
  });
};

Viewport.prototype.setHighlightData = function (data) {
  this.highlightData = data;
};

Viewport.prototype.setZoomLevel = function (level) {
  this.zoomLevel = level;
};

Viewport.prototype.setOffsets = function (startPos, endPos) {
  let xOffset = (endPos[0] - startPos[0]) / 5 / this.zoomLevel,
      yOffset = (endPos[1] - startPos[1]) / 5 / this.zoomLevel,
      offsets = [this.offsets[0] + xOffset, this.offsets[1] + yOffset];

  this.offsets = offsets;
  this.calcCellOffsets();
};

Viewport.prototype.calcCellOffsets = function () {
  this.cellFractionOffsets = this.offsets.map(offset => offset % 1 );
  this.cellOffsets = this.offsets.map(offset => {
    if (offset === 0) { return 0; }

    negationMod = offset / Math.abs(offset);

    return Math.floor(offset * negationMod) * negationMod;
  });
};

module.exports = Viewport;
