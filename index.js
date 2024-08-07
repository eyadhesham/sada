const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.MTI3MDc2MTU0Mjc0NDUzOTI3OA.Gk5rX7.vNGQ6NUfStUWwtnhcNbxNyBLDA2CVOb93v_E1E;
const GUILD_ID = process.env.1270760112788733974;

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.log('Guild not found');
    return;
  }

  // Reset permissions for all channels and categories
  const channels = guild.channels.cache;
  channels.forEach(async (channel) => {
    try {
      // Fetch the channel to ensure it's fully loaded
      const fetchedChannel = await channel.fetch();

      // Clone the channel and delete the old one to reset permissions
      const newChannel = await fetchedChannel.clone();
      await fetchedChannel.delete();

      console.log(`Reset permissions for ${newChannel.name}`);
    } catch (error) {
      console.error(`Failed to reset permissions for ${channel.name}:`, error);
    }
  });

  console.log('Finished resetting permissions.');
  process.exit();
});

client.login(TOKEN);

