import BaseEvent from "../../utils/structures/BaseEvent";
import DiscordClient from "../../client/client";
import { GuildBan } from "discord.js";
import { IsMenheraServer } from "../../utils/functions";

export default class GuildBanRemoveEvent extends BaseEvent {
	constructor() {
		super("guildBanRemove");
	}
	async run(client: DiscordClient, ban: GuildBan) {
		if (!IsMenheraServer(ban.guild.id)) return;
		const hub = "551888982905192459";
		const mini = "1071581732807122956";
		if (ban.guild.id !== hub) return;
		client.guilds.cache
			.get(mini)
			?.bans.remove(
				ban.user.id,
				"Cross Unban from " + ban.guild.name + ", Reason: " + ban.reason ||
					"No Reason"
			);
	}
}
