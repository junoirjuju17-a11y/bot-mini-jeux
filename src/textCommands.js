const { RockPaperScissorsGame } = require('./games/rockPaperScissors/RockPaperScissorsGame');

const MOVE_COMMANDS = {
  pierre: 'rock',
  feuille: 'paper',
  ciseaux: 'scissors',
};

async function handleTextCommand(message, { gameManager, prefix }) {
  if (!message.guild || message.author.bot || !message.content.startsWith(prefix)) {
    return;
  }

  const [rawCommand] = message.content
    .slice(prefix.length)
    .trim()
    .toLowerCase()
    .split(/\s+/);

  if (!rawCommand) {
    return;
  }

  try {
    if (rawCommand === 'pfc') {
      await startRockPaperScissors(message, gameManager);
      return;
    }

    if (rawCommand === 'accepter' || rawCommand === 'refuser') {
      await handleGameAction(message, gameManager, rawCommand);
      return;
    }

    if (MOVE_COMMANDS[rawCommand]) {
      await handleGameAction(message, gameManager, rawCommand);
    }
  } catch (error) {
    console.error(error);
    await message.reply("Une erreur est survenue pendant l'exécution de la commande.").catch(console.error);
  }
}

async function startRockPaperScissors(message, gameManager) {
  const challenger = message.author;
  const opponent = message.mentions.users.first();

  if (!opponent) {
    await message.reply('Utilisation : `!pfc @joueur`.');
    return;
  }

  if (opponent.id === challenger.id) {
    await message.reply('Tu ne peux pas jouer contre toi-même.');
    return;
  }

  if (opponent.bot) {
    await message.reply('Choisis un membre humain comme adversaire.');
    return;
  }

  if (gameManager.isPlayerBusy(challenger.id) || gameManager.isPlayerBusy(opponent.id)) {
    await message.reply('Un des deux joueurs est déjà dans une partie.');
    return;
  }

  const game = gameManager.createGame(
    new RockPaperScissorsGame({
      challenger,
      opponent,
    }),
  );

  try {
    await game.startFromTextCommand(message);
  } catch (error) {
    gameManager.removeGame(game.id);
    throw error;
  }
}

async function handleGameAction(message, gameManager, command) {
  const game = gameManager.getGameForPlayer(message.author.id);

  if (!game || typeof game.handleTextCommand !== 'function') {
    await message.reply('Tu ne participes à aucune partie en cours.');
    return;
  }

  await game.handleTextCommand(message, command);
}

module.exports = {
  handleTextCommand,
};
