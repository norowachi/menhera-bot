import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { CommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import { addWarning } from '../../database/functions/warningFunctions';

export default class WarnCommand extends BaseCommand {
  constructor() {
    super('warn', 'moderation');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    const member = interaction.options.data[0].member as GuildMember;
    const reason = interaction.options.data[1].value as string;
    if (reason.length > 500) {
      const embed = new EmbedBuilder()
        .setDescription('❌ Warning reason should not be more than 500 letters')
        .setColor('Red');
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const MemberEmbed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL(),
      })
      .setDescription('You have been warned on Menhera Chan Discord Server')
      .setColor(member.displayHexColor)
      .addFields([{ name: 'Reason', value: reason }]);
    member.send({ embeds: [MemberEmbed] }).catch((err) => {
      console.log(err);
    });

    const ChannelEmbed = new EmbedBuilder()
      .setDescription(`✅ **${member.user.tag} warned**`)
      .setColor('Green');
    await interaction.reply({ embeds: [ChannelEmbed] });

    const logEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Moderation | Warn | ${member.user.tag}`,
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
    await addWarning({
      userId: member.user.id,
      warning: reason,
      moderator: interaction.user.tag,
      date: Math.round(new Date().getTime() / 1000),
    });
  }
}
