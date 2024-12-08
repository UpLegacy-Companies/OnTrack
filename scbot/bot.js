const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const sqlite3 = require('sqlite3').verbose();

// Your bot token and client ID and guild ID directly in the script
const token = '';
const clientId = '';  // Your bot's client ID
const guildId = '';    // The server (guild) ID where to register the command
const resetRoleId = '';  // Replace with your admin role's ID
const activityRoleId= '';  // Replace with your role ID for activity command

// Connect to the SQLite database
const db = new sqlite3.Database('/home/admin/projects/scdb/activity.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

// Create the table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS activity (
        username TEXT PRIMARY KEY,
        time INTEGER
    )
`);

// Initialize the bot client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Register slash commands with Discord's API
const commands = [
  new SlashCommandBuilder()
    .setName('activity')
    .setDescription('Get the activity of a user.')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username of the player')
        .setRequired(true)
        .setAutocomplete(true)  // Enable autocomplete for this option
    ),
  new SlashCommandBuilder()
    .setName('resetactivity')
    .setDescription('Reset the activity data of all users.')
    .setDefaultMemberPermissions(1)  // Only available to users with admin permissions
].map(command => command.toJSON());

// Register the commands on startup
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error reloading commands:', error);
  }
})();

// Listen for the /activity command and autocomplete event
client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const { commandName } = interaction;

        // Check if the interaction is for the /activity command
        if (commandName === 'activity') {
            const focusedOption = interaction.options.getFocused(true);
            const value = focusedOption.value;

            // Query the database for matching usernames
            db.all('SELECT username FROM activity WHERE username LIKE ?', [`${value}%`], (err, rows) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return interaction.respond([]);
                }

                // Return matching usernames as suggestions
                const suggestions = rows.map(row => ({ name: row.username, value: row.username }));
                interaction.respond(suggestions);
            });
        }
    }

    // Handle the activity command
    if (interaction.isCommand()) {
        const { commandName } = interaction;

        if (commandName === 'activity') {
            // Check if the user has the right role for /activity
            if (!interaction.member.roles.cache.has(activityRoleId)) {
                return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }

            const username = interaction.options.getString('username');

            // Query the database for the user's activity
            db.get('SELECT * FROM activity WHERE username = ?', [username], (err, row) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return interaction.reply({ content: 'An error occurred while fetching activity.', ephemeral: true });
                }

                // Check if user data exists
                if (row) {
                    // Respond with an embed if the data is found
                    const embed = new EmbedBuilder()
                        .setColor('#0898cf')  // Custom color
                        .setTitle(`Activity Data for ${username}`)
                        .setDescription(`${username} has been active for ${row.time} minutes.`)
                        .setFooter({ text: 'Activity Tracker' })
                        .setTimestamp();

                    interaction.reply({ embeds: [embed] });
                } else {
                    // If no data is found
                    interaction.reply({ content: `No activity found for ${username}.`, ephemeral: true });
                }
            });
        }

        // Command to reset all activity data (admin-only)
        if (commandName === 'resetactivity') {
            // Check if user has the right role for /resetactivity
            if (!interaction.member.roles.cache.has(resetRoleId)) {
                return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            }

            // Reset all activity data in the database
            db.run('DELETE FROM activity', (err) => {
                if (err) {
                    console.error('Database error:', err.message);
                    return interaction.reply({ content: 'Failed to reset activity data.', ephemeral: true });
                }
                interaction.reply({ content: 'All activity data has been reset.', ephemeral: true });
            });
        }
    }
});

// When the bot is ready
client.once('ready', () => {
    console.log('Bot is logged in as ' + client.user.tag);
});

// Log in to Discord with the bot's token
client.login(token);
