import {
	EmbedBuilder,
	GatewayIntentBits,
	Partials,
	WebhookClient,
} from "discord.js";
import DiscordClient from "./client/client";
import { registerCommands, registerEvents } from "./utils/registry";
import { connect } from "mongoose";
require("dotenv").config();

const client = new DiscordClient({
	intents: [
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Reaction],
	allowedMentions: { parse: ["roles", "users"], repliedUser: true },
}); //.on("debug", console.log);

process.on("uncaughtException", async (error: any, origin) => {
	new WebhookClient({
		url: "https://discord.com/api/webhooks/1172216802831519764/RaWGn4lwUaZlruXg65ijLxdMWBbYSZ9BkexLbYhYwxIhbgrETNzldQGyD-RlDG45NEDT",
	}).send({
		embeds: [
			new EmbedBuilder()
				.setTitle(new Date().toISOString())
				.setDescription([origin, error].join(":\n")),
		],
	});
});

(async () => {
	await connect(process.env.DBURL!)
		.then(() => {
			console.log("Connected to DB");
		})
		.catch(console.error);
	await registerEvents(client, "../events");
	await registerCommands(client, "../commands");
	await client.login(process.env.TOKEN);
})();
