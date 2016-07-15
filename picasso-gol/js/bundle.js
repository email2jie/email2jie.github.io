/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(2);
	const bindListeners = __webpack_require__(18);
	
	$(() => {
	  const rootEl = document.getElementById('g-o-l');
	  const ctx = rootEl.getContext('2d');
	  window.game = new Game(ctx);
	  bindListeners(window.game);
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Grid = __webpack_require__(3),
	    Viewport = __webpack_require__(4);
	    Structure = __webpack_require__(6),
	    Structures = __webpack_require__(7);
	
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


/***/ },
/* 3 */
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	let Cell = __webpack_require__(5);
	
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


/***/ },
/* 5 */
/***/ function(module, exports) {

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


/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	const Structures = {
	  SingleCell: __webpack_require__(8),
	  Eraser: __webpack_require__(9),
	};
	
	module.exports = Structures;


/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {
	  name: "Single Cell",
	  height: 1,
	  width : 1,
	  liveCellDeltas : [
	    [0,0],
	  ]
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
	  name: "Eraser",
	  height: 1,
	  width : 1,
	  liveCellDeltas : []
	};


/***/ },
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	const Structure = __webpack_require__(6),
	    Structures = __webpack_require__(7);
	
	const bindListeners = function(game) {
	  $('#play-button').click(function(event) {
	    game.togglePlayState();
	    setPlayButtonText();
	  });
	
	  function setPlayButtonText() {
	    $('#play-button').text(function(){
	      return game.playing ? "Pause" : "Play";
	    });
	  }
	
	  $('#gridlines-button').click(game.toggleGridlines.bind(game));
	
	  $('#clear-button').click(game.clearGrid.bind(game));
	
	  $('#speed-slider').slider({
	    min: -100,
	    max: 450,
	    value: 0,
	    slide: function(event, ui) {
	      game.setSpeed(1000 / Math.pow(2, ui.value / 100));
	    }
	  });
	
	  $('#zoom-slider').slider({
	    min: 0,
	    max: 500,
	    value: 200,
	    slide: function(event, ui) {
	      game.setZoomLevel(Math.pow(2, ui.value / 100));
	    }
	  });
	
	  // Canvas Events
	  let panning = false,
	      panStart = null;
	
	  function sendPanData(panEnd) {
	    game.setOffsets(panStart, panEnd);
	  }
	
	  function resetPanData() {
	    $('#g-o-l').removeClass("pan-grab");
	    panStart = null;
	  }
	
	  function calcMousePos(event) {
	    let canvas = event.currentTarget,
	        x = event.pageX - canvas.offsetLeft,
	        y = event.pageY - canvas.offsetTop;
	
	    x = Math.floor(x/20);
	    y = Math.floor(y/20);
	    console.log(x, y);
	    let pos = [x * 19, y * 19];
	
	
	    return pos;
	  }
	
	  $(window).keydown(event => {
	    if (event.key === "Alt") {
	      panning = true;
	      game.clearHighlightData();
	      $('#g-o-l').addClass("pan-hover");
	    }
	  });
	
	  $(window).keyup(event => {
	    if (event.key === "Alt") {
	      panning = false;
	      $('#g-o-l').removeClass("pan-hover pan-grab");
	    }
	  });
	
	  $('#g-o-l').mousemove(function(event) {
	    let pos = calcMousePos(event);
	
	    if (panning) {
	      if (panStart) {
	        sendPanData(pos);
	        panStart = pos;
	      }
	    } else {
	      game.highlightCells(pos);
	    }
	  });
	
	  $('#g-o-l').mouseleave(function () {
	    game.clearHighlightData();
	    resetPanData();
	  });
	
	
	  $('#g-o-l').mouseup(resetPanData);
	
	  // Structures Panel
	
	  let selectedStructure = Structures.SingleCell;
	  let idx = undefined;
	  window.selectedCell = [];
	
	  $('#g-o-l').mousedown(function(event) {
	    select(Structures.SingleCell, event);
	    let pos = calcMousePos(event);
	     idx = posExist(window.selectedCell, pos);
	
	      if(idx){
	        select(Structures.Eraser, event);
	        delete window.selectedCell[idx]; 
	        console.log(window.selectedCell);
	      }else{
	
	      window.selectedCell.push(pos);
	      console.log(window.selectedCell);
	      
	    }
	    if (panning) {
	      panStart = pos;
	      $('#g-o-l').addClass("pan-grab");
	    } else {
	      game.addSelectedStructure(pos);
	    }
	
	  });
	
	  function posExist(posArr, currPos){
	    let idx = undefined;
	    posArr.forEach((pos, i)=>{
	      if(pos[0] === currPos[0] && pos[1] === currPos[1]){
	        idx = i;
	      }
	    });
	    return idx;
	  }
	
	  function select(structure, event) {
	    selectedStructure = structure;
	    game.setSelectedStructure(new Structure(structure));
	
	    $('.sidebar *').removeClass("selected");
	   
	    $(event.currentTarget).addClass("selected");
	  }
	
	  $(()=>{
	    $('#g-o-l').ready(select.bind(null, Structures.SingleCell));
	  });
	};
	
	module.exports = bindListeners;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map