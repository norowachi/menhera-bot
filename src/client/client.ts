import {
	Client,
	ClientOptions,
	Collection,
	Role,
	Snowflake,
	TextChannel,
	User,
} from "discord.js";
import BaseEvent from "../utils/structures/BaseEvent";
import BaseCommand from "../utils/structures/BaseCommand";
import { expData, moderationMap, userXP } from "../utils/GlobalTypes";
export type RpTypes =
	| "bully"
	| "bite"
	| "cry"
	| "cuddle"
	| "greet"
	| "highfive"
	| "kill"
	| "kiss"
	| "pat"
	| "tickle"
	| "tsundere"
	| "yeet"
	| "smile"
	| "punch"
	| "lick";

export default class DiscordClient extends Client {
	private _commands = new Collection<string, BaseCommand>();
	private _events = new Collection<string, BaseEvent>();
	private _prefix: string = "m.";
	private _logChannel!: TextChannel;
	private _muteRole!: Role;
	private _roleplay_text = new Collection<RpTypes, string[]>()
		.set("bite", [`<@!{AUTHOR}> *bites* <@!{MEMBER}>`])
		.set("bully", [`<@!{AUTHOR}> *bullies* <@!{MEMBER}>!!`])
		.set("cry", [
			`<@!{AUTHOR}> *cries* to <@!{MEMBER}>`,
			`<@!{AUTHOR}> is crying`,
		])
		.set("cuddle", [`<@!{AUTHOR}> cuddles <@!{MEMBER}>, adorable!`])
		.set("greet", [
			`<@!{AUTHOR}> *greets* <@!{MEMBER}>`,
			`<@!{AUTHOR}> says hello to <@!{MEMBER}>`,
			`<@!{AUTHOR}> welcomes <@!{MEMBER}>`,
		])
		.set("highfive", [
			`<@!{AUTHOR}> gave <@!{MEMBER}> a high-five`,
			`<@!{AUTHOR}>: *high five*`,
		])
		.set("kill", [
			`<@!{AUTHOR}> killed <@!{MEMBER}>`,
			`<@!{MEMBER}> was killed by <@!{AUTHOR}> `,
		])
		.set("kiss", [
			`<@!{AUTHOR}> *kisses* <@!{MEMBER}>`,
			`<@!{AUTHOR}> kissed <@!{MEMBER}> OwO!`,
		])
		.set("lick", [
			`Woah <@!{AUTHOR}> licked <@!{MEMBER}>`,
			`<@!{AUTHOR}> *licks* <@!{MEMBER}>`,
			`<@!{MEMBER}> is being licked by <@!{AUTHOR}>`,
		])
		.set("pat", [`<@!{AUTHOR}> pats <@!{MEMBER}>`])
		.set("punch", [
			`<@!{AUTHOR}> *punches* <@!{MEMBER}>`,
			`<@!{AUTHOR}> punches <@!{MEMBER}>`,
			`<@!{AUTHOR}> *punched* <@!{MEMBER}>`,
		])
		.set("smile", [`<@!{AUTHOR}> *smiles* to <@!{MEMBER}> :D`])
		.set("tickle", [
			`<@!{AUTHOR}> *tickles* <@!{MEMBER}>`,
			`<@!{AUTHOR}> *tickles* <@!{MEMBER}> tehehe`,
			`<@!{AUTHOR}> *tickles* <@!{MEMBER}> hehe!`,
		])
		.set("yeet", [`<@!{AUTHOR}> *yeets* <@!{MEMBER}>`]);
	public mutes = new Map<Snowflake, moderationMap>();
	public guildXP: expData = {
		channel: [],
		logChannel: "",
		userXP: new Map<string, userXP>(),
		weeklyUserExp: new Map<string, userXP>(),
	};

	constructor(options: ClientOptions) {
		super(options);
	}

	get commands(): Collection<string, BaseCommand> {
		return this._commands;
	}
	get events(): Collection<string, BaseEvent> {
		return this._events;
	}
	get prefix(): string {
		return this._prefix;
	}

	set prefix(prefix: string) {
		this._prefix = prefix;
	}

	get logChannel(): TextChannel {
		return this._logChannel;
	}

	set logChannel(channel: TextChannel) {
		this._logChannel = channel;
	}

	get muteRole(): Role {
		return this._muteRole;
	}

	set muteRole(role: Role) {
		this._muteRole = role;
	}

	public rpText(type: RpTypes, authorID: string, memberID: string) {
		const list = this._roleplay_text.get(type)!;
		return list[Math.floor(Math.random() * list.length)]
			.replace(/{AUTHOR}/g, authorID)
			.replace(/{MEMBER}/g, memberID);
	}
}
