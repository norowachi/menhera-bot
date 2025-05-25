import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { AttachmentBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { getAllUser } from '../../database/functions/userexpFunction.js';
import { sortUserXP } from '../../utils/modules/expSystem.js';
import { Rank } from '../../utils/modules/rankAttachment.js';
import { join } from 'path';

export default class RankCommand extends BaseCommand {
  constructor() {
    super('rank', 'leveling');
  }
  async run(_: DiscordClient, interaction: CommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.data[0]
      ? (interaction.options.data[0].member as GuildMember)
      : (interaction.member as GuildMember);

    const allUser = await getAllUser();
    const sortedUser = sortUserXP(allUser);
    const rank = sortedUser.findIndex((e) => e.userId === member.id) + 1;
    if (!rank) {
      interaction.followUp({
        content: "User doesn't exist in the database",
      });
      return;
    }
    const level = Math.floor(Math.sqrt(sortedUser[rank - 1].xp || 0) * 0.1);
    const data = {
      xp: sortedUser[rank - 1].xp,
      level,
      requiredXP: (level + 1) ** 2 / 0.01,
      previousXP: (level * 0.1) ** 2 / 0.01,
    };
    const rankCard = new Rank()
      .setAvatar(member.user.displayAvatarURL({ extension: 'png' }))
      .setBackground(
        'IMAGE',
        join(process.cwd(), 'images/small_background.png'),
      )
      .setCurrentXP(data.xp || 0, '#000000')
      .setRequiredXP(data.requiredXP, '#000000')
      .setPreviousXP(data.previousXP, '#000000')
      .setLevel(data.level)
      .setRank(rank)
      .setUsername(member.user.username, member.displayHexColor)
      .setDiscriminator(member.user.discriminator, member.displayHexColor)
      .setProgressBar(member.displayHexColor, 'COLOR')
      .setOverlay('#FFFFFF', 0, false)
      .setLevelColor(member.displayHexColor, member.displayHexColor)
      .setRankColor(member.displayHexColor, member.displayHexColor);
    const rankCardAttachment = new AttachmentBuilder(
      await rankCard.build(),
    ).setName('rank.png');
    await interaction.editReply({
      files: [rankCardAttachment],
    });
  }
}
