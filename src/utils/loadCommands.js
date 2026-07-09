const fs = require('node:fs');
const path = require('node:path');

const commandsPath = path.join(__dirname, '..', 'commands');

function getCommandFiles() {
  return fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
}

function loadCommands() {
  return getCommandFiles().map((file) => {
    const commandPath = path.join(commandsPath, file);
    const command = require(commandPath);

    if (!command.data || !command.execute) {
      throw new Error(`Commande invalide: ${commandPath}`);
    }

    return command;
  });
}

function loadCommandData() {
  return loadCommands().map((command) => command.data.toJSON());
}

module.exports = {
  loadCommands,
  loadCommandData,
};

