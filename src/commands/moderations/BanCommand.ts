import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export default class BanCommand extends BaseCommand {
  constructor() {
    super('ban', 'moderation');
  }

  async run(client: DiscordClient, interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const reason =
      (interaction.options.get('reason', false)?.value as string) ||
      'No Reason Provided';
    if (!interaction.guild?.members.cache.get(user.id)?.bannable) {
      const embed = new EmbedBuilder()
        .setDescription("❌ Can't ban this user")
        .setColor('Red');
      await interaction.reply({
        embeds: [embed],
      });
      return;
    }
    const MemberEmbed = new EmbedBuilder()
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setDescription('You have been Banned from Menhera Chan Discord Server')
      .addFields([{ name: 'Reason', value: reason }])
      .setColor('Red');
    user
      .send({
        embeds: [MemberEmbed],
      })
      .catch(() => {
        interaction.reply({
          content: 'Cannot send messages to this user',
        });
      });

    const ChannelEmbed = new EmbedBuilder()
      .setDescription(`✅ **${user.tag} has been Banned**`)
      .setColor('Green');
    await interaction.reply({ embeds: [ChannelEmbed] });

    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Ban | ${user.tag}`,
        iconURL: user.displayAvatarURL(),
      })
      .addFields([
        { name: 'User', value: `<@${user.id}>`, inline: true },
        {
          name: 'Moderator',
          value: `<@${interaction.member?.user.id}>`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setFooter({ text: user.id })
      .setTimestamp()
      .setColor('#7289da');
    await client.logChannel.send({ embeds: [logEmbed] });
    await interaction.guild?.bans.create(user.id, { reason: reason });
  }
}
