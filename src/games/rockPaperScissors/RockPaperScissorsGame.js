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

const TEXT_MOVES = {
  pierre: 'rock',
  feuille: 'paper',
  ciseaux: 'scissors',
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
    this.channelId = null;
    this.statusMessage = null;
    this.buttonCollector = null;
    this.timeout = null;
  }

  async start(interaction) {
    this.channelId = interaction.channelId;
    this.statusMessage = await interaction.reply({
      content: `${this.opponent}, ${this.challenger} te défie à Pierre-Feuille-Ciseaux.`,
      components: [this.createChallengeButtons()],
      fetchReply: true,
    });

    this.buttonCollector = this.statusMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: CHALLENGE_TIMEOUT_MS,
      filter: (buttonInteraction) => buttonInteraction.customId.startsWith(this.customIdPrefix),
    });

    this.buttonCollector.on('collect', async (buttonInteraction) => {
      await this.handleButton(buttonInteraction);
    });

    this.buttonCollector.on('end', async (_, reason) => {
      if (this.finished || reason === 'completed' || reason === 'refused') {
        return;
      }

      await this.statusMessage.edit({
        content: 'La partie a expiré.',
        components: [],
      }).catch(console.error);

      this.finish();
    });
  }

  async startFromTextCommand(message) {
    this.channelId = message.channelId;
    this.statusMessage = await message.channel.send([
      `${this.opponent}, ${this.challenger} te défie à Pierre-Feuille-Ciseaux.`,
      'Réponds avec `!accepter` ou `!refuser`.',
    ].join('\n'));

    this.startTimeout(CHALLENGE_TIMEOUT_MS, async () => {
      await this.statusMessage.edit('La partie a expiré.').catch(console.error);
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

  async handleButton(interaction) {
    const action = interaction.customId.slice(this.customIdPrefix.length);

    if (action === 'accept') {
      await this.acceptFromButton(interaction);
      return;
    }

    if (action === 'refuse') {
      await this.refuseFromButton(interaction);
      return;
    }

    if (action.startsWith('move:')) {
      await this.registerButtonMove(interaction, action.replace('move:', ''));
    }
  }

  async handleTextCommand(message, command) {
    if (command === 'accepter') {
      await this.acceptFromMessage(message);
      return;
    }

    if (command === 'refuser') {
      await this.refuseFromMessage(message);
      return;
    }

    if (TEXT_MOVES[command]) {
      await this.registerTextMove(message, TEXT_MOVES[command]);
    }
  }

  async acceptFromButton(interaction) {
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
    this.resetButtonCollectorTimer(CHOICE_TIMEOUT_MS);

    await interaction.update({
      content: `${this.challenger} contre ${this.opponent}. Choisissez secrètement votre coup.`,
      components: [this.createMoveButtons()],
    });
  }

  async acceptFromMessage(message) {
    if (!this.isExpectedChannel(message)) {
      await message.reply('Cette partie se joue dans le salon où elle a été lancée.');
      return;
    }

    if (message.author.id !== this.opponent.id) {
      await message.reply('Seul le joueur défié peut accepter cette partie.');
      return;
    }

    if (this.accepted) {
      await message.reply('La partie a déjà commencé.');
      return;
    }

    this.accepted = true;
    this.resetButtonCollectorTimer(CHOICE_TIMEOUT_MS);

    await this.statusMessage.edit({
      content: [
        `${this.challenger} contre ${this.opponent}.`,
        'Choisissez secrètement avec `!pierre`, `!feuille` ou `!ciseaux`.',
        'Le bot essaiera de supprimer votre message et de vous confirmer le choix en privé.',
      ].join('\n'),
      components: [],
    });

    this.startTimeout(CHOICE_TIMEOUT_MS, async () => {
      await this.statusMessage.edit({
        content: 'La partie a expiré : les deux joueurs n’ont pas choisi à temps.',
        components: [],
      }).catch(console.error);
      this.finish();
    });
  }

  async refuseFromButton(interaction) {
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

    this.stopButtonCollector('refused');
    this.finish();
  }

  async refuseFromMessage(message) {
    if (!this.isExpectedChannel(message)) {
      await message.reply('Cette partie se joue dans le salon où elle a été lancée.');
      return;
    }

    if (message.author.id !== this.opponent.id) {
      await message.reply('Seul le joueur défié peut refuser cette partie.');
      return;
    }

    await this.statusMessage.edit({
      content: `${this.opponent} a refusé le défi de ${this.challenger}.`,
      components: [],
    });

    this.stopButtonCollector('refused');
    this.finish();
  }

  async registerButtonMove(interaction, move) {
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
      await this.statusMessage.edit({
        content: this.getWaitingMessage(),
        components: [this.createMoveButtons()],
      });
      return;
    }

    await this.endButtonGame();
  }

  async registerTextMove(message, move) {
    if (!this.isExpectedChannel(message)) {
      await message.reply('Cette partie se joue dans le salon où elle a été lancée.');
      return;
    }

    if (!this.accepted) {
      await message.reply("La partie n'a pas encore commencé.");
      return;
    }

    if (!this.playerIds.includes(message.author.id)) {
      await message.reply('Tu ne participes pas à cette partie.');
      return;
    }

    if (!MOVES[move]) {
      await message.reply('Choix invalide.');
      return;
    }

    if (this.choices.has(message.author.id)) {
      await this.deleteMoveMessage(message);
      await this.confirmChoicePrivately(message.author, 'Ton choix est déjà enregistré.');
      return;
    }

    this.choices.set(message.author.id, move);
    await this.deleteMoveMessage(message);
    await this.confirmChoicePrivately(message.author, `Choix enregistré : ${MOVES[move].label}.`);

    if (this.choices.size < 2) {
      await this.statusMessage.edit({
        content: this.getWaitingMessage(),
        components: [],
      });
      return;
    }

    await this.endTextGame();
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

  async endButtonGame() {
    await this.statusMessage.edit({
      content: this.getResultMessage(),
      components: [this.createMoveButtons(true)],
    });

    this.stopButtonCollector('completed');
    this.finish();
  }

  async endTextGame() {
    await this.statusMessage.edit({
      content: this.getResultMessage(),
      components: [],
    });

    this.stopButtonCollector('completed');
    this.finish();
  }

  getResultMessage() {
    const challengerMove = this.choices.get(this.challenger.id);
    const opponentMove = this.choices.get(this.opponent.id);

    return [
      'Résultat de Pierre-Feuille-Ciseaux',
      `${this.challenger}: ${MOVES[challengerMove].label}`,
      `${this.opponent}: ${MOVES[opponentMove].label}`,
      this.getResult(challengerMove, opponentMove),
    ].join('\n');
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

  isExpectedChannel(message) {
    return !this.channelId || message.channelId === this.channelId;
  }

  resetButtonCollectorTimer(time) {
    if (this.buttonCollector && !this.buttonCollector.ended) {
      this.buttonCollector.resetTimer({ time });
    }
  }

  stopButtonCollector(reason) {
    if (this.buttonCollector && !this.buttonCollector.ended) {
      this.buttonCollector.stop(reason);
    }
  }

  startTimeout(time, callback) {
    this.clearTimeout();
    this.timeout = setTimeout(async () => {
      if (!this.finished) {
        await callback();
      }
    }, time);
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  async deleteMoveMessage(message) {
    await message.delete().catch(() => {});
  }

  async confirmChoicePrivately(user, content) {
    await user.send(content).catch(async () => {
      if (this.statusMessage) {
        await this.statusMessage.channel.send(`${user}, ton choix est enregistré.`).catch(console.error);
      }
    });
  }

  finish() {
    this.clearTimeout();
    super.finish();
  }
}

module.exports = {
  RockPaperScissorsGame,
};
