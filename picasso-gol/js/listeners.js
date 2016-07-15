const Structure = require('./structures/structure'),
    Structures = require('./structures/structures');

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
