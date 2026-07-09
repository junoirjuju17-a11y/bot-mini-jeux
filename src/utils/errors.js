async function handleInteractionError(interaction, error) {
  console.error(error);

  const message = {
    content: "Une erreur est survenue pendant l'exécution de la commande.",
    ephemeral: true,
  };

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp(message).catch(console.error);
    return;
  }

  await interaction.reply(message).catch(console.error);
}

async function safeReply(interaction, options) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp(options);
  }

  return interaction.reply(options);
}

module.exports = {
  handleInteractionError,
  safeReply,
};

