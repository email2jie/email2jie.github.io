const Game = require('./game.js');
const bindListeners = require('./listeners');

$(() => {
  const rootEl = document.getElementById('g-o-l');
  const ctx = rootEl.getContext('2d');
  window.game = new Game(ctx);
  bindListeners(window.game);
});
