const express = require('express');
const { Client, GatewayIntentBits, REST, Routes, ChannelType, EmbedBuilder } = require('discord.js');

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent // Only include if enabled
    ]
});

// This endpoint keeps the bot alive and provides a URL to ping
app.get('/', (req, res) => {
    res.send('Bot is online!');
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const commands = [
        {
            name: 'createchannel',
            description: 'Create a specified number of channels under a specified category',
            options: [
                {
                    name: 'number',
                    type: 4, // INTEGER type
                    description: 'Number of channels to create',
                    required: true
                },
                {
                    name: 'category',
                    type: 3, // STRING type
                    description: 'Category name (or partial)',
                    required: true
                },
                {
                    name: 'name',
                    type: 3, // STRING type
                    description: 'Base name for the channels',
                    required: true
                },
                {
                    name: 'type',
                    type: 3, // STRING type
                    description: 'Type of channels to create (text or voice)',
                    required: true,
                    choices: [
                        { name: 'Text', value: 'text' },
                        { name: 'Voice', value: 'voice' }
                    ]
                }
            ]
        },
        {
            name: 'ping',
            description: 'Replies with Pong! Shows bot and API latency.'
        }
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'createchannel') {
        const number = options.getInteger('number');
        const categoryNamePartial = options.getString('category');
        const baseName = options.getString('name');
        const channelType = options.getString('type') === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice;

        const guild = interaction.guild;
        await guild.channels.fetch(); // Ensure all channels are fetched

        // Find all matching categories
        const matchingCategories = guild.channels.cache.filter(c => 
            c.type === ChannelType.GuildCategory && c.name.toLowerCase().startsWith(categoryNamePartial.toLowerCase())
        );

        if (matchingCategories.size === 0) {
            await interaction.reply({ content: 'No matching categories found', ephemeral: true });
            return;
        } else if (matchingCategories.size === 1) {
            const category = matchingCategories.first();
            for (let i = 0; i < number; i++) {
                await guild.channels.create({
                    name: `${baseName} #${i + 1}`,
                    type: channelType,
                    parent: category.id
                });
            }
            await interaction.reply({ content: `Created ${number} channels under ${category.name}`, ephemeral: true });
        } else {
            const categoryNames = matchingCategories.map(c => c.name).join(', ');
            await interaction.reply({ content: `Multiple categories found: ${categoryNames}. Please provide a more specific name.`, ephemeral: true });
        }
    } else if (commandName === 'ping') {
        // Calculate bot latency
        const botLatency = Date.now() - interaction.createdTimestamp;
        
        // Get API latency and ensure it is a positive number
        const apiLatency = Math.max(Math.round(client.ws.ping), 0);

        // Create an embed message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(':ping_pong: **PONG!**')
            .addFields(
                { name: ':hourglass: Bot Latency', value: `\`\`\`${botLatency}ms\`\`\``, inline: false },
                { name: ':hourglass: API Latency', value: `\`\`\`${apiLatency}ms\`\`\``, inline: false },
            )
            .addField(':bar_chart: Status', `${apiLatency < 100 ? '🟢 Excellent' : apiLatency < 200 ? '🟡 Good' : '🔴 Poor'}`)
            .setFooter({ text: 'Powered by Gyro Codes' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
});

// Log in with the token from Replit's Secrets
client.login(process.env.DISCORD_TOKEN); // Access the token from Secrets
