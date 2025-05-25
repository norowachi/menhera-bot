import {
  Client,
  ClientOptions,
  Collection,
  Role,
  Snowflake,
  TextChannel,
} from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';
import { expData, moderationMap, userXP } from '../utils/GlobalTypes';

export default class DiscordClient extends Client {
  private _commands = new Collection<string, BaseCommand>();
  private _events = new Collection<string, BaseEvent>();
  private _prefix: string = 'm.';
  private _logChannel!: TextChannel;
  private _muteRole!: Role;

  public mutes = new Map<Snowflake, moderationMap>();
  public guildXP: expData = {
    channel: [],
    logChannel: '',
    role: '',
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
}
