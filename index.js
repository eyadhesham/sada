const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Load environment variables if needed
const keep_alive = require('./keep_alive.js'); // Ensure this file exists if using it

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Only include if enabled
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

// Use the token from the environment variable
client.login(process.env.DISCORD_TOKEN);
