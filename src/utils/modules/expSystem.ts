import DiscordClient from "../../client/client";
import {
	Guild,
	GuildMember,
	Message,
	EmbedBuilder,
	TextChannel,
} from "discord.js";
import {
	setExp,
	getExp,
	initExp,
} from "../../database/functions/userexpFunction";
import {
	setWeeklyExp,
	getWeeklyExp,
	initWeeklyExp,
} from "../../database/functions/weeklyuserexpFunctions";
import { getGuildSettings } from "../../database/functions/guildSettingsFunctions";

export const expSystem = async (client: DiscordClient, message: Message) => {
	if (!message.guild || !message.member) return;
	// if the user has the no-exp role, ignore 'em
	if (message.member.roles.cache.has(client.guildXP.role)) return;
	// if channel is on the list, ignore
	//! waiting for mista head mod approval
	// if (client.guildXP.channel.includes(message.channelId)) return;

	const guildData = await getGuildSettings(message.guild.id);
	const multi = guildData.multi.filter(
		(elm) =>
			elm.id == message.channelId || message.member?.roles.cache.has(elm.id)
	);
	const addedXp =
		(multi.length >= 1
			? multi.map((d) => d.xp)?.reduce((a, b) => (a || 0) + b)
			: 1) * (guildData.exp.xp || 1);
	const cooldown = guildData.exp.cooldown
		? guildData.exp.cooldown * 1000
		: 8 * 1000;

	if (!client.guildXP.userXP.has(message.author.id)) {
		const userXP = await getExp(message.author.id);
		if (!userXP) {
			await initExp(message.author.id);
			client.guildXP.userXP.set(message.author.id, {
				userId: message.author.id,
				xp: addedXp,
				lastTimestamp: message.createdTimestamp,
			});
		} else {
			const userXP = await getExp(message.author.id);
			client.guildXP.userXP.set(message.author.id, {
				userId: message.author.id,
				xp: userXP?.xp || 0,
				lastTimestamp: message.createdTimestamp,
			});
		}
		return;
	}
	if (!client.guildXP.weeklyUserExp.has(message.author.id)) {
		const GetWeeklyUserExp = await getWeeklyExp(message.author.id);
		if (!GetWeeklyUserExp) {
			await initWeeklyExp(message.author.id);
			client.guildXP.weeklyUserExp.set(message.author.id, {
				userId: message.author.id,
				xp: 1,
			});
		} else {
			client.guildXP.weeklyUserExp.set(message.author.id, {
				userId: message.author.id,
				xp: GetWeeklyUserExp.xp || 0,
			});
		}
	}

	const userXP = client.guildXP.userXP.get(message.author.id)!;
	const WeeklyUserExp = client.guildXP.weeklyUserExp.get(message.author.id)!;

	if (message.createdTimestamp - userXP.lastTimestamp < cooldown) return;
	await setExp(message.author.id, userXP.xp + addedXp);
	await setWeeklyExp(message.author.id, WeeklyUserExp.xp + 1);
	const oldLevel = Math.floor(Math.sqrt(userXP.xp) * 0.1);
	const newLevel = Math.floor(Math.sqrt(userXP.xp + addedXp) * 0.1);
	userXP.xp += addedXp;
	WeeklyUserExp.xp += 1;
	userXP.lastTimestamp = message.createdTimestamp;
	if (newLevel > oldLevel)
		return await levelUpMessage(
			newLevel,
			message.guild,
			message.member,
			client,
			message
		);
};

export const levelUpMessage = async (
	level: number,
	guild: Guild,
	member: GuildMember,
	client: DiscordClient,
	message?: Message
) => {
	const embed = new EmbedBuilder()
		.setColor(member.displayHexColor)
		.setAuthor({ name: member.displayName })
		.addFields({
			name: "Congratulations 🎉",
			value: `You are now level **${level}**!`,
		})
		.setThumbnail(member.user.displayAvatarURL());

	if (message) {
		message
			.reply({ embeds: [embed], failIfNotExists: false })
			.catch(console.error);
	} else {
		const channel = guild!.channels.cache.get(
			client.guildXP.logChannel
		) as TextChannel;

		channel
			.send({ content: `<@!${member.user.id}>`, embeds: [embed] })
			.catch(console.error);
	}
	return await LevelUpRole(member, level);
};

export const sortUserXP = (data: Array<{ userId?: string; xp?: number }>) => {
	return data.sort((a, b) => b.xp! - a.xp!);
};

async function LevelUpRole(user: GuildMember, newLevel: number) {
	const roles = [
		"882331852562653187", //1st role
		"882332167047380993", //2nd role
		"882332149557104690", //3rd role
		"882332248114860052", //4th role
		"882332292754849862", //5th role
		"1147524923955355781", //6th role
		"1147525186929831957", //7th role
		"1147525494129037333", //8th role
	];
	const rolesTill = (n: number) => roles.slice(0, n + 1);

	if (newLevel >= 100) {
		if (user.roles.cache.has(roles[7])) return;
		return await user.roles.add(rolesTill(7));
	}
	if (newLevel >= 85) {
		if (user.roles.cache.has(roles[6])) return;
		return await user.roles.add(rolesTill(6));
	}
	if (newLevel >= 70) {
		if (user.roles.cache.has(roles[5])) return;
		return await user.roles.add(rolesTill(5));
	}
	if (newLevel >= 50) {
		if (user.roles.cache.has(roles[4])) return;
		return await user.roles.add(rolesTill(4));
	}
	if (newLevel >= 25) {
		if (user.roles.cache.has(roles[3])) return;
		return await user.roles.add(rolesTill(3));
	}
	if (newLevel >= 15) {
		if (user.roles.cache.has(roles[2])) return;
		return await user.roles.add(rolesTill(2));
	}
	if (newLevel >= 10) {
		if (user.roles.cache.has(roles[1])) return;
		return await user.roles.add(rolesTill(1));
	}
	if (newLevel >= 5) {
		if (user.roles.cache.has(roles[0])) return;
		return await user.roles.add(rolesTill(0));
	}
	return;
}
