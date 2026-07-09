class GameManager {
  constructor() {
    this.games = new Map();
    this.playerGames = new Map();
  }

  createGame(game) {
    for (const playerId of game.playerIds) {
      if (this.playerGames.has(playerId)) {
        throw new Error('Un des joueurs est déjà dans une partie.');
      }
    }

    this.games.set(game.id, game);

    for (const playerId of game.playerIds) {
      this.playerGames.set(playerId, game.id);
    }

    game.onceFinished(() => this.removeGame(game.id));
    return game;
  }

  removeGame(gameId) {
    const game = this.games.get(gameId);

    if (!game) {
      return;
    }

    this.games.delete(gameId);

    for (const playerId of game.playerIds) {
      if (this.playerGames.get(playerId) === gameId) {
        this.playerGames.delete(playerId);
      }
    }
  }

  isPlayerBusy(playerId) {
    return this.playerGames.has(playerId);
  }

  getGameForPlayer(playerId) {
    const gameId = this.playerGames.get(playerId);
    return gameId ? this.games.get(gameId) : null;
  }
}

module.exports = {
  GameManager,
};
