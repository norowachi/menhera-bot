import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import {
  ChatInputCommandInteraction,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';

export default class KickCommand extends BaseCommand {
  constructor() {
    super('kick', 'moderation');
  }
  async run(client: DiscordClient, interaction: ChatInputCommandInteraction) {
    const member = interaction.options.getMember('user') as GuildMember;
    const reason =
      (interaction.options.get('reason', false)?.value as string) ||
      'No Reason Provided';
    if (!member.kickable) {
      const embed = new EmbedBuilder()
        .setDescription("❌ Can't kick this user")
        .setColor('Red');
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }
    const memberEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription('You have been kicked from Menhera Discord Server')
      .addFields([{ name: 'Reason', value: reason }]);
    member.send({ embeds: [memberEmbed] }).catch(() => {
      interaction.reply({ content: 'Cannot send messages to this user' });
    });
    const channelEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`✅ **${member.user.tag} kicked**`);
    await interaction.reply({ embeds: [channelEmbed] });
    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Kick | ${member.user.tag}`,
        iconURL: member.user.displayAvatarURL(),
      })
      .addFields([
        { name: 'User', value: `<@${member.user.id}>`, inline: true },
        {
          name: 'Moderator',
          value: `<@${interaction.member?.user.id}>`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setFooter({ text: member.user.id })
      .setTimestamp()
      .setColor('#7289da');
    await client.logChannel.send({ embeds: [logEmbed] });
    await member.kick(reason);
  }
}
