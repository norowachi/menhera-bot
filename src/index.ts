import {
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
  WebhookClient,
} from 'discord.js';
import DiscordClient from './client/client.js';
import { registerCommands, registerEvents } from './utils/registry.js';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import { createOcrWorker } from './utils/modules/imgScan.js';

config();

const client = new DiscordClient(
  {
    intents: [
      // all guild stuff
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      // for audit log
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      // DMs and DM reactions
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      // message content
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Reaction, Partials.User],
    allowedMentions: { parse: ['roles', 'users'], repliedUser: true },
    rest: {
      api: process.env.DISCORD_REST_PROXY || 'https://discord.com/api',
      version: '10',
    },
  },
  await createOcrWorker(),
); //.on('debug', console.log);

process.on('uncaughtException', async (error: any, origin) => {
  new WebhookClient({
    url: process.env.ERRORS_WEBHOOK!,
  }).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(new Date().toISOString())
        .setDescription([origin, error].join(':\n')),
    ],
  });
});

(async () => {
  await connect(process.env.DBURL!)
    .then(() => {
      console.log('Connected to DB');
    })
    .catch(console.error);
  await registerEvents(client, '../events');
  await registerCommands(client, '../commands');
  await client.login(process.env.TOKEN);
})();

process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});

async function shutdown() {
  console.log('Stopping workers…');
  await Promise.all([client.OCRWorker.terminate()]);
  console.log('All workers stopped.');
}
