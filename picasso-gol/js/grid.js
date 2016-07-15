const Grid = function() {
  this.neighborCounts = {};
  this.livingCells = new Set;
  this.states = { retained: new Set, awakening: new Set, dying: new Set };
};

Grid.NEIGHBOR_DELTAS = [
  [-1, -1],
  [-1,  0],
  [-1,  1],
  [ 0, -1],
  [ 0,  1],
  [ 1, -1],
  [ 1,  0],
  [ 1,  1]
];

Grid.prototype.toggleCells = function (ctx) {
  let self = this;

  this.livingCells.forEach(function(posKey){
    let pos = posKey.split(','),
        row = parseInt(pos[0]),
        col = parseInt(pos[1]);

    self.incrementNeighbors(row, col);
  });

  let retained = new Set,
      awakening = new Set,
      dying = new Set,
      newLiveSet = new Set;

  Object.keys(this.neighborCounts).forEach(function(posKey){
    let neighborCount = self.neighborCounts[posKey],
        alive = self.livingCells.has(posKey);

    if (neighborCount === 2 && alive) {
      newLiveSet.add(posKey);
      retained.add(posKey);
    } else if (neighborCount === 3) {
      newLiveSet.add(posKey);
      alive ? retained.add(posKey) : awakening.add(posKey);
    } else {
      if (alive) { dying.add(posKey); }
    }
  });

  this.livingCells = newLiveSet;
  this.neighborCounts = {};

  this.states = {
    retained: retained,
    awakening: awakening,
    dying: dying
  };
};

Grid.prototype.finishCycle = function () {
  this.states = {
    retained: this.livingCells,
    awakening: new Set,
    dying: new Set
  };
};

Grid.prototype.incrementNeighbors = function (row, col) {
  Grid.NEIGHBOR_DELTAS.forEach(function(delta) {
    let x = delta[0] + row,
        y = delta[1] + col,
        posKey = [x,y].join(',');

    this.neighborCounts[posKey] = this.neighborCounts[posKey] || 0;
    this.neighborCounts[posKey] += 1;
  }.bind(this));

  let thisPosKey = [row, col].join(',');

  this.neighborCounts[thisPosKey] = this.neighborCounts[thisPosKey] || 0;
};

Grid.prototype.awakenCells = function (cells) {
  cells.forEach(function(cellPos) {
    let posKey = cellPos.join(',');
    this.livingCells.add(posKey);
    this.states.retained.add(posKey);
    this.states.dying.delete(posKey);
  }.bind(this));
};

Grid.prototype.killCells = function (cells) {
  cells.forEach(function(cellPos) {
    let posKey = cellPos.join(',');
    this.livingCells.delete(posKey);
    this.states.retained.delete(posKey);
    this.states.awakening.delete(posKey);
  }.bind(this));
};

Grid.prototype.alive = function (pos) {
  return this.livingCells.has(pos.join(','));
};

Grid.prototype.clear = function () {
  this.livingCells = new Set;
  this.states = {
    retained: new Set,
    awakening: new Set,
    dying: new Set
  };
};

module.exports = Grid;
