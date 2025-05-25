import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { inspect } from 'util';
import {
  CommandInteraction,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
} from 'discord.js';

export default class EvalCommand extends BaseCommand {
  constructor() {
    super('eval', 'dev');
  }
  async run(client: DiscordClient, interaction: CommandInteraction) {
    if (['534783899331461123'].includes(interaction.user.id)) {
      await evaluate(client, interaction);
    } else return;
  }
}

async function evaluate(
  client: DiscordClient,
  interaction: CommandInteraction,
) {
  const code = interaction.options.data[0].value!.toString();
  const XBtn =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('delete-' + interaction.user.id)
        .setStyle(ButtonStyle.Primary)
        .setEmoji('❌'),
    );
  try {
    const start = process.hrtime();
    let evaled = code.includes('await')
      ? eval(`(async () => { ${code} })()`)
      : eval(code);
    if (evaled instanceof Promise) {
      evaled = await evaled;
    }
    const stop = process.hrtime(start);
    const response = clean(inspect(evaled));
    if (response.length <= 2000) {
      const evmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setFooter({
          text: `Time Taken: ${(stop[0] * 1e9 + stop[1]) / 1e6}ms`,
          iconURL: client!.user!.displayAvatarURL(),
        })
        .setTitle('Eval')
        .setDescription(`\`\`\`js\n${response}\n\`\`\``)
        .addFields([{ name: `**Type:**`, value: typeof evaled }]);

      await interaction.reply({
        embeds: [evmbed],
        components: [XBtn],
      });
    } else if (response.length <= 4000) {
      await interaction.reply({
        content: '```js\n' + response + '\n```',
        components: [XBtn],
      });
    } else {
      const output = new AttachmentBuilder(Buffer.from(response)).setName(
        'output.txt',
      );
      await interaction.user!.send({ files: [output] });
      await interaction.reply({
        content: 'Sent Output in DM',
        components: [XBtn],
      });
    }
  } catch (err: any) {
    const errevmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`ERROR`)
      .setDescription(`\`\`\`xl\n${clean(err.toString())}\n\`\`\``)
      .setTimestamp()
      .setFooter({
        text: client!.user!.username,
        iconURL: client!.user!.displayAvatarURL(),
      });
    await interaction.reply({
      embeds: [errevmbed],
      components: [XBtn],
    });
  }
  function clean(text: string) {
    return text
      .replace(/`/g, `\\\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(
        new RegExp(client!.token!, 'gi'),
        `NrzaMyOTI4MnU1NT3oDA1rTk4.pPizb1g.hELpb6PAi1Pewp3wAwVseI72Eo`,
      );
  }
}
