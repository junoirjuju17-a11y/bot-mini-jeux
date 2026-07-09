const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { BaseGame } = require('../BaseGame');

const CHALLENGE_TIMEOUT_MS = 60_000;
const CHOICE_TIMEOUT_MS = 90_000;

const MOVES = {
  rock: {
    label: 'Pierre',
    beats: 'scissors',
  },
  paper: {
    label: 'Feuille',
    beats: 'rock',
  },
  scissors: {
    label: 'Ciseaux',
    beats: 'paper',
  },
};

class RockPaperScissorsGame extends BaseGame {
  constructor({ challenger, opponent }) {
    super({
      type: 'rock-paper-scissors',
      playerIds: [challenger.id, opponent.id],
    });

    this.challenger = challenger;
    this.opponent = opponent;
    this.choices = new Map();
    this.accepted = false;
  }

  async start(interaction) {
    const message = await interaction.reply({
      content: `${this.opponent}, ${this.challenger} te défie à Pierre-Feuille-Ciseaux.`,
      components: [this.createChallengeButtons()],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: CHALLENGE_TIMEOUT_MS,
      filter: (buttonInteraction) => buttonInteraction.customId.startsWith(this.customIdPrefix),
    });

    collector.on('collect', async (buttonInteraction) => {
      await this.handleButton(buttonInteraction, message, collector);
    });

    collector.on('end', async (_, reason) => {
      if (this.finished) {
        return;
      }

      if (reason === 'completed' || reason === 'refused') {
        return;
      }

      await message.edit({
        content: 'La partie a expiré.',
        components: [],
      }).catch(console.error);

      this.finish();
    });
  }

  get customIdPrefix() {
    return `pfc:${this.id}:`;
  }

  createChallengeButtons() {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${this.customIdPrefix}accept`)
        .setLabel('Accepter')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`${this.customIdPrefix}refuse`)
        .setLabel('Refuser')
        .setStyle(ButtonStyle.Danger),
    );
  }

  createMoveButtons(disabled = false) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${this.customIdPrefix}move:rock`)
        .setLabel('Pierre')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`${this.customIdPrefix}move:paper`)
        .setLabel('Feuille')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`${this.customIdPrefix}move:scissors`)
        .setLabel('Ciseaux')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
    );
  }

  async handleButton(interaction, message, collector) {
    const action = interaction.customId.slice(this.customIdPrefix.length);

    if (action === 'accept') {
      await this.acceptChallenge(interaction, collector);
      return;
    }

    if (action === 'refuse') {
      await this.refuseChallenge(interaction, message, collector);
      return;
    }

    if (action.startsWith('move:')) {
      await this.registerMove(interaction, message, collector, action.replace('move:', ''));
    }
  }

  async acceptChallenge(interaction, collector) {
    if (interaction.user.id !== this.opponent.id) {
      await interaction.reply({
        content: 'Seul le joueur défié peut accepter cette partie.',
        ephemeral: true,
      });
      return;
    }

    if (this.accepted) {
      await interaction.reply({
        content: 'La partie a déjà commencé.',
        ephemeral: true,
      });
      return;
    }

    this.accepted = true;
    collector.resetTimer({ time: CHOICE_TIMEOUT_MS });

    await interaction.update({
      content: `${this.challenger} contre ${this.opponent}. Choisissez secrètement votre coup.`,
      components: [this.createMoveButtons()],
    });
  }

  async refuseChallenge(interaction, message, collector) {
    if (interaction.user.id !== this.opponent.id) {
      await interaction.reply({
        content: 'Seul le joueur défié peut refuser cette partie.',
        ephemeral: true,
      });
      return;
    }

    await interaction.update({
      content: `${this.opponent} a refusé le défi de ${this.challenger}.`,
      components: [],
    });

    collector.stop('refused');
    this.finish();
  }

  async registerMove(interaction, message, collector, move) {
    if (!this.accepted) {
      await interaction.reply({
        content: "La partie n'a pas encore commencé.",
        ephemeral: true,
      });
      return;
    }

    if (!this.playerIds.includes(interaction.user.id)) {
      await interaction.reply({
        content: 'Tu ne participes pas à cette partie.',
        ephemeral: true,
      });
      return;
    }

    if (!MOVES[move]) {
      await interaction.reply({
        content: 'Choix invalide.',
        ephemeral: true,
      });
      return;
    }

    if (this.choices.has(interaction.user.id)) {
      await interaction.reply({
        content: 'Ton choix est déjà enregistré.',
        ephemeral: true,
      });
      return;
    }

    this.choices.set(interaction.user.id, move);

    await interaction.reply({
      content: `Choix enregistré : ${MOVES[move].label}.`,
      ephemeral: true,
    });

    if (this.choices.size < 2) {
      await message.edit({
        content: this.getWaitingMessage(),
        components: [this.createMoveButtons()],
      });
      return;
    }

    await this.endGame(message, collector);
  }

  getWaitingMessage() {
    const challengerReady = this.choices.has(this.challenger.id) ? '[OK]' : '[...]';
    const opponentReady = this.choices.has(this.opponent.id) ? '[OK]' : '[...]';

    return [
      `${this.challenger} contre ${this.opponent}.`,
      `${challengerReady} ${this.challenger} a choisi.`,
      `${opponentReady} ${this.opponent} a choisi.`,
    ].join('\n');
  }

  async endGame(message, collector) {
    const challengerMove = this.choices.get(this.challenger.id);
    const opponentMove = this.choices.get(this.opponent.id);
    const result = this.getResult(challengerMove, opponentMove);

    await message.edit({
      content: [
        'Résultat de Pierre-Feuille-Ciseaux',
        `${this.challenger}: ${MOVES[challengerMove].label}`,
        `${this.opponent}: ${MOVES[opponentMove].label}`,
        result,
      ].join('\n'),
      components: [this.createMoveButtons(true)],
    });

    collector.stop('completed');
    this.finish();
  }

  getResult(challengerMove, opponentMove) {
    if (challengerMove === opponentMove) {
      return 'Égalité.';
    }

    if (MOVES[challengerMove].beats === opponentMove) {
      return `${this.challenger} gagne.`;
    }

    return `${this.opponent} gagne.`;
  }
}

module.exports = {
  RockPaperScissorsGame,
};
