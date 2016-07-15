const Cell = function(row, col, state, ctx) {
  this.size = 5;

  this.row = row;
  this.col = col;

  this.state = state;
  this.ctx = ctx;
};

Cell.prototype.renderOrb = function (percentage, offsets) {
  if (percentage > 1 || this.state === "retained") { percentage = 1; }

  let transitionModifier = this.state === "dying" ?
    1 - percentage :
    percentage;

  let displayRadius = this.size / 2 * transitionModifier;
  let alpha = transitionModifier;

  let radius = this.size / 2;
  let xPos = (this.row + offsets[0]) * this.size + radius;
  let yPos = (this.col + offsets[1]) * this.size + radius;

  let gradient = this.ctx.createRadialGradient(
    xPos,
    yPos,
    displayRadius,
    xPos,
    yPos,
    0
  );
  gradient.addColorStop(0, "black");
  gradient.addColorStop(1, "rgba(8, 146, 208, " + alpha + ")");

  this.ctx.beginPath();
  this.ctx.arc(xPos, yPos, radius, 0, 2*Math.PI);
  this.ctx.fillStyle = gradient;
  this.ctx.fill();
};

module.exports = Cell;
