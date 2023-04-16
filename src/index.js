const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const geochallenge = require('./commands/geochallenge.js');
const fs = require('fs');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

client.commands.set(geochallenge.data.name, geochallenge);

let roleMap;
try {
  const jsonString = fs.readFileSync('./roles.json');
  const mapAsArray = JSON.parse(jsonString);
  roleMap = new Map(mapAsArray);
} catch (err) {
  // If the file doesn't exist or is empty, create an empty object
  roleMap = new Map();
}
// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction, roleMap);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

setInterval(() => {
	// Convert the object to a JSON string
	const jsonString = JSON.stringify([...roleMap]);
	// Write the JSON string to a file
	fs.writeFileSync('./roles.json', jsonString);
  }, 5 * 60 * 1000);

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN_TEST);