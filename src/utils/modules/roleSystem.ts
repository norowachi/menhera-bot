import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  GuildMember,
  Interaction,
  StringSelectMenuBuilder,
} from 'discord.js';
import { getRoles } from '../../database/functions/rolesFunction.js';

export async function showRuleMenu(int: ButtonInteraction) {
  try {
    // random wait
    if (Math.floor(Math.random() * 2) == 1) {
      await new Promise((r) =>
        setTimeout(r, Math.floor(Math.random() * 1000) + 1000),
      );
    }

    const rolesMenu =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`rm-${int.user.id}`)
          .setPlaceholder('Select the role you want')
          .setMinValues(0),
      );
    const member = int.member as GuildMember;
    // document data
    const docData = await getRoles(int.message.id);
    if (!docData) return;
    // sorted roles
    const sortedRoles = docData.roles.sort((a, b) =>
      b.position!.localeCompare(a.position!),
    );

    // member can get the role or not
    let bean: boolean = true;
    if (docData.allow) {
      bean = false;
      for (let i = 0; i <= docData.allow.length; i++) {
        if (member.roles.cache.has(docData.allow[i])) {
          bean = true;
        }
      }
    }
    if (!bean) {
      int.reply({
        content: "You don't have the role required for this",
        ephemeral: true,
      });
      return;
    }
    // adding data to menu
    rolesMenu.components[0]
      .addOptions(
        sortedRoles.map((r) => {
          return {
            label: r.name!,
            value: r.id!,
            default: member.roles.cache.has(r.id!),
          };
        }),
      )
      .setMaxValues(docData.roles.length);
    await int.reply({
      content: sortedRoles.map((r) => `<@&${r.id}> - ${r.name}`).join('\n'),
      components: [rolesMenu],
      ephemeral: true,
    });
    int.client.on('interactionCreate', SelectMenuInteractionEvent);

    // remove interaction event after 10 minutes
    setTimeout(
      () => int.client.off('interactionCreate', SelectMenuInteractionEvent),
      10 * 60 * 1000,
    );

    async function SelectMenuInteractionEvent(interaction: Interaction) {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId !== `rm-${int.user.id}`) return;
      await member.roles.remove(
        docData!.roles
          .map((r) => r.id!)
          .filter((r) => !interaction.values.includes(r)),
      );
      await member.roles.add(interaction.values);
      interaction.update({
        content: `Changes were done!`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setCustomId('show-roles-' + int.message.id)
              .setLabel('Show Roles Again')
              .setStyle(ButtonStyle.Secondary),
          ),
        ],
      });
      int.client.off('interactionCreate', SelectMenuInteractionEvent);
      return;
    }
  } catch (err) {
    console.log(err);
    return;
  }
}
