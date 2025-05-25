import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import {
  ResetWeekly,
  SundayAT8,
} from '../../database/functions/weeklyuserexpFunctions.js';

export default class ResetWeeklyCommand extends BaseCommand {
  constructor() {
    super('resetweekly', 'leveling');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    try {
      await ResetWeekly(client);
      const Time = SundayAT8();
      const embed = new EmbedBuilder().setDescription(
        `Weekly Leaderboard was manually reseted.\
                \nThe next reset would be <t:${Time.toString().slice(
                  0,
                  Time.toString().length - 3,
                )}:R>`,
      );
      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({ content: `Errored out` });
      return console.error(err);
    }
  }
}
