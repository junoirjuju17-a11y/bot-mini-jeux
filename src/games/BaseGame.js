const { randomUUID } = require('node:crypto');

class BaseGame {
  constructor({ type, playerIds }) {
    this.id = randomUUID();
    this.type = type;
    this.playerIds = playerIds;
    this.finished = false;
    this.finishCallbacks = [];
  }

  onceFinished(callback) {
    this.finishCallbacks.push(callback);
  }

  finish() {
    if (this.finished) {
      return;
    }

    this.finished = true;

    for (const callback of this.finishCallbacks) {
      callback(this);
    }
  }
}

module.exports = {
  BaseGame,
};

