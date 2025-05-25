import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { CommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import { getWarnings } from '../../database/functions/warningFunctions.js';
import { WarningData } from '../../utils/GlobalTypes.js';

export default class WarningsCommand extends BaseCommand {
  constructor() {
    super('warnings', 'moderation');
  }
  async run(_client: DiscordClient, interaction: CommandInteraction) {
    const member = interaction.options.data[0].member as GuildMember;
    const warnings = (await getWarnings(member.user.id)) as WarningData[];
    if (!warnings.length) {
      const embed = new EmbedBuilder().setDescription(
        '❗ There are no warnings',
      );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    let string = '';
    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor)
      .setAuthor({
        name: `${warnings.length} Logged for ${member.user.tag}`,
        iconURL: member.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setFooter({ text: member.user.id });
    for (const warning of warnings) {
      if (string.length >= 1500) {
        embed.setDescription(string);
        await interaction.reply({ embeds: [embed] });
        string = '';
      }
      string += `**ID: ${warning._id!} | Moderator: ${warning.moderator}**\n${
        warning.warning
      } - <t:${warning.date}:f>\n\n`;
    }
    embed.setDescription(string);
    await interaction.reply({ embeds: [embed] });
  }
}
