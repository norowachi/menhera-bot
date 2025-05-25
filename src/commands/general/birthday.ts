import BaseCommand from '../../utils/structures/BaseCommand.js';
import DiscordClient from '../../client/client.js';
import { CommandInteraction } from 'discord.js';
import { setBday } from '../../database/functions/birthday.js';

export default class CustomCommand extends BaseCommand {
  constructor() {
    super('birthday', 'utils');
  }
  async run(_client: DiscordClient, data: CommandInteraction) {
    const subCMD = data.options.data[0].name;
    switch (subCMD) {
      case 'set': {
        await setBdayCmd(data);
        return;
      }
      // nothing
      default: {
        return;
      }
    }
  }
}

async function setBdayCmd(interaction: CommandInteraction) {
  const bdayDate = interaction.options.get('date', true).value as string;

  if (!/\d{1,2}-\d{1,2}/.test(bdayDate)) {
    interaction.reply({
      content:
        'Please enter a correct date in the mm-dd format.\nexample: 1-2 or 01-02',
    });
    return;
  }

  const [month, day] = bdayDate.split('-').map((s) => parseInt(s));

  if (month > 12) {
    interaction.reply({
      content:
        'Are you on Mars? Cuz if I recall correctly Earth has 12 months only',
    });
    return;
  }
  if (day > 31) {
    interaction.reply({
      content: `Really? And which month has ${day} days then?`,
    });
    return;
  }

  // save to db
  const resp = await setBday(interaction.user.id, bdayDate);

  return interaction.reply({
    content: resp
      ? 'Bday saved successfully'
      : 'Either you tried setting *another* bday or **There was an Error!**',
  });
}
