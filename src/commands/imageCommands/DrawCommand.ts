import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { CommandInteraction } from 'discord.js';
import CreateImage from '../../utils/modules/imgModule';
import path from 'path';

export default class DrawCommand extends BaseCommand {
  constructor() {
    super('draw', 'images');
  }
  async run(_client: DiscordClient, interaction: CommandInteraction) {
    await interaction.deferReply();

    const text = interaction.options.get('text', true).value as string;

    const file = new CreateImage()
      .setText(text, 170, 22)
      .setImage(path.join(process.cwd(), 'images/draw.png'))
      .setX(55)
      .setY(40)
      .setRect('#FFF', 10, 25, 180, 290);

    const attachment = await file.create();
    interaction.followUp({ files: [attachment] });
    return;
  }
}
