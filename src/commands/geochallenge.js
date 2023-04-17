const { SlashCommandBuilder } = require("discord.js");
const { getChallengeLink } = require("../geoguessr.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("geochallengetest")
    .setDescription("Replies with a geoguessr link!")
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("add a role to ping with the returned link")
    ),
  async execute(interaction, roleMap) {
    await interaction.deferReply();
    const challengeUrl = await getChallengeLink();

    const role =
      interaction.guild.roles.cache.find(
        (r) => r.name === interaction.options.getString("role")
      )
	  || roleMap.get(interaction.guildId)
	  || "defaultRoleId";
    const returnStr = `${
      role === "defaultRoleId" ? "" : `<@&${role.id}>`
    } Here is your geoguessr challenge: ${challengeUrl}`;
    if (role !== "defaultRoleId") {
      roleMap.set(interaction.guildId, role);
    }
    const message = await interaction.editReply(returnStr);
	
	const date = new Date();
    const thread = await interaction.channel.threads.create({
      name: `${date.getMonth() + 1}/${date.getDate()} GeoChallenge`,
      reason: "Separate thread for today's Geoguessr challenge",
	  startMessage: message,
    });
  },
};
