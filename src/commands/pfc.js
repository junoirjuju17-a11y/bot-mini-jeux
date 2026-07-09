const { SlashCommandBuilder } = require('discord.js');
const { RockPaperScissorsGame } = require('../games/rockPaperScissors/RockPaperScissorsGame');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pfc')
    .setDescription('Défie un membre à Pierre-Feuille-Ciseaux.')
    .addUserOption((option) =>
      option
        .setName('adversaire')
        .setDescription('Le membre que tu veux défier.')
        .setRequired(true),
    ),

  async execute(interaction, { gameManager }) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('adversaire', true);

    if (opponent.id === challenger.id) {
      await interaction.reply({
        content: 'Tu ne peux pas jouer contre toi-même.',
        ephemeral: true,
      });
      return;
    }

    if (opponent.bot) {
      await interaction.reply({
        content: 'Choisis un membre humain comme adversaire.',
        ephemeral: true,
      });
      return;
    }

    if (gameManager.isPlayerBusy(challenger.id) || gameManager.isPlayerBusy(opponent.id)) {
      await interaction.reply({
        content: 'Un des deux joueurs est déjà dans une partie.',
        ephemeral: true,
      });
      return;
    }

    const game = gameManager.createGame(
      new RockPaperScissorsGame({
        challenger,
        opponent,
      }),
    );

    try {
      await game.start(interaction);
    } catch (error) {
      gameManager.removeGame(game.id);
      throw error;
    }
  },
};
