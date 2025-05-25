import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { CommandInteraction, EmbedBuilder } from 'discord.js';

export default class UnbanCommand extends BaseCommand {
  constructor() {
    super('unban', 'moderation');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    const bannedId = interaction.options.data[0].value as string;
    const reason =
      (interaction.options.get('reason', false)?.value as string) ||
      'No Reason Provided';
    const banList = await interaction.guild!.bans.fetch();
    const bannedUser = banList.get(bannedId);
    if (!bannedUser) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(`❗ This is user is not banned`);
      await interaction.reply({ embeds: [embed] });
      return;
    }
    await interaction.guild!.bans.remove(bannedId, reason);
    const channelEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`✅ **${bannedUser.user.tag} Unbanned**`);
    await interaction.reply({ embeds: [channelEmbed] });
    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Unban | ${bannedUser.user.tag}`,
        iconURL: bannedUser.user.displayAvatarURL(),
      })
      .addFields([
        {
          name: 'User',
          value: `<@${bannedUser.user.id}>`,
          inline: true,
        },
        {
          name: 'Moderator',
          value: `<@${interaction.member?.user.id}>`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setFooter({ text: bannedUser.user.id })
      .setTimestamp()
      .setColor('#7289da');
    await client.logChannel.send({ embeds: [logEmbed] });
  }
}
