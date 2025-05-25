import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import {
  CommandInteraction,
  Guild,
  GuildMember,
  EmbedBuilder,
} from 'discord.js';
import { setExp, getExp } from '../../database/functions/userexpFunction.js';
import { levelUpMessage } from '../../utils/modules/expSystem.js';

export default class GiveLevelCommand extends BaseCommand {
  constructor() {
    super('setlevel', 'leveling');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    const member = interaction.options.data[0].member as GuildMember;
    const newLevel = interaction.options.data[1].value as number;
    const guild = interaction.guild as Guild;
    if (newLevel < 0) {
      await interaction.reply({ content: 'Cannot set level to negative' });
      return;
    }
    if (!member || !member.user) {
      await interaction.reply({
        content: "Couldn't find desired member",
      });
      return;
    }
    const userXP = await getExp(member.user.id);
    if (!userXP) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(
          'This user is not in my database. They need to send message first to get registered',
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const newXP = Math.floor(newLevel ** 2 / 0.01);
    await setExp(member.user.id, newXP);
    await levelUpMessage(newLevel, guild, member, client);
    if (client.guildXP.userXP.has(member.user.id)) {
      client.guildXP.userXP.get(member.user.id)!.xp = newXP;
    }
    const embed = new EmbedBuilder()
      .setColor('Green')
      .setDescription(`Changed ${member.user.username} level to ${newLevel}`);
    await interaction.reply({ embeds: [embed] });
  }
}
