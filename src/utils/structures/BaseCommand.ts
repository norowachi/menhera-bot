import { CommandInteraction } from 'discord.js';
import DiscordClient from '../../client/client.js';

export default abstract class BaseCommand {
  constructor(
    private name: string,
    private category: string,
  ) {}

  getName(): string {
    return this.name;
  }
  getCategory(): string {
    return this.category;
  }

  abstract run(client: DiscordClient, data: CommandInteraction): Promise<void>;
}
