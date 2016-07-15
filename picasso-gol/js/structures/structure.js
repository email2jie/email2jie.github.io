let Structure = function(options, rotationCount) {
  this.height = options.height;
  this.width = options.width;
  this.liveCellDeltas = options.liveCellDeltas;

  this.rotationCount = rotationCount || 0;
  this.rotate();
};

Structure.prototype.awaken = function (grid, startPos) {
  this.clearArea(grid, startPos);

  let positions = this.liveCellDeltas.map(function(delta){
    return [startPos[0] + delta[0], startPos[1] + delta[1]];
  });

  grid.awakenCells(positions);
};

Structure.prototype.clearArea = function (grid, startPos) {
  grid.killCells(this.targetCells(startPos));
};

Structure.prototype.targetCells = function (startPos) {
  let targetCells = [];

  for (let y = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++) {
      targetCells.push([startPos[0] + x, startPos[1] + y]);
    }
  }

  return targetCells;
};

Structure.prototype.rotate = function () {
  for (let i = 0; i < this.rotationCount % 4; i++) {
    this.rotateNinetyDegrees();
  }
};

Structure.prototype.rotateNinetyDegrees = function () {
  let temp = this.height;
  this.height = this.width;
  this.width = temp;

  let offset = this.height - 1;

  this.liveCellDeltas = this.liveCellDeltas.map(function(delta){
    return [delta[1], (delta[0] * -1) + offset];
  });
};

module.exports = Structure;
