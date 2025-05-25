import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { CommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import ms from 'ms';

export default class MuteCommand extends BaseCommand {
  constructor() {
    super('mute', 'moderation');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    const member = interaction.options.data[0].member as GuildMember;

    const time = ms(interaction.options.data[1].value as string);
    const reason = interaction.options.data[2]
      ? (interaction.options.data[2].value as string)
      : 'No Reason Provided';
    if (!time) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Provide correct time for the mute')
        .setColor('Red');
      await interaction.reply({ embeds: [embed] });
      return;
    }
    if (member.permissions.has(['ManageMessages'])) {
      const embed = new EmbedBuilder()
        .setDescription("❌ I don't have right to mute a member of Staff Team")
        .setColor('Red');
      await interaction.reply({ embeds: [embed] });
      return;
    }
    await member.timeout(time, reason);
    const memberEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription('You have been muted on Menhera Chan Discord Server')
      .addFields([
        {
          name: 'Ends In',
          value: `<t:${Math.round(
            (new Date().getTime() + time) / 1000,
          )}:R> (<t:${Math.round((new Date().getTime() + time) / 1000)}:f>)`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ]);
    member.send({ embeds: [memberEmbed] }).catch(() => {
      interaction.reply({
        content: 'Cannot send messages to this user',
      });
    });
    const channelEmbed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`✅ **${member.user.tag} muted**`);
    await interaction.reply({ embeds: [channelEmbed] });

    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Mute | ${member.user.tag}`,
        iconURL: member.user.displayAvatarURL(),
      })
      .addFields([
        { name: 'User', value: `<@${member.user.id}>`, inline: true },
        {
          name: 'Moderator',
          value: `<@${interaction.member?.user.id}>`,
          inline: true,
        },
        {
          name: 'Ends in',
          value: `<t:${Math.round(
            (new Date().getTime() + time) / 1000,
          )}:R> (<t:${Math.round((new Date().getTime() + time) / 1000)}:f>)`,
          inline: true,
        },
        { name: 'Reason', value: reason, inline: true },
      ])
      .setFooter({ text: member.user.id })
      .setTimestamp()
      .setColor('#7289da');
    await client.logChannel.send({ embeds: [logEmbed] });
  }
}
