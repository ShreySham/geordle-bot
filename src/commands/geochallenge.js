const { SlashCommandBuilder } = require('discord.js');
const { getChallengeLink } = require('../geoguessr.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('geochallenge')
		.setDescription('Replies with a geoguessr link!'),
	async execute(interaction) {
		await interaction.deferReply();
        const challengeUrl = await getChallengeLink();
        await interaction.reply(`Here is your geoguessr challenge: ${challengeUrl}`);
	},
};