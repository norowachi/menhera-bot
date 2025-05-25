import BaseEvent from '../../utils/structures/BaseEvent.js';
import DiscordClient from '../../client/client.js';
import {
  CommandInteraction,
  GuildMemberRoleManager,
  Interaction,
} from 'discord.js';
import { showRuleMenu } from '../../utils/modules/roleSystem.js';
import { IsMenheraServer } from '../../utils/functions.js';

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super('interactionCreate');
  }
  async run(client: DiscordClient, interaction: Interaction) {
    if (!interaction.inGuild()) return;
    if (interaction.isButton()) {
      if (interaction.customId === 'show-roles') {
        await showRuleMenu(interaction);
        return;
      }
      // show-roles-{msg id}
      if (interaction.customId.includes('show-roles-')) {
        interaction.message = await interaction.channel?.messages.fetch(
          interaction.customId.split(/-/g)[2],
        )!;
        await showRuleMenu(interaction);
        return;
      }
      if (interaction.customId === 'join-server') {
        const roleId = '930981633593585684'; //member role id
        const HubPostJoinDM = `Yippe!!!!! I can't believe you want to meet me and everyone else. This is sooo cool. I look forward to seeing you in chat`;
        const HubPostJoinDm_Extra = `<:MenheraHearts1:998700732846968902>`;

        // already got the role
        if (
          (interaction.member.roles as GuildMemberRoleManager).cache.has(roleId)
        ) {
          return await interaction
            .reply({ content: "You're already a member!", ephemeral: true })
            .catch(() => {});
        }

        // adding the role and sending the message
        (interaction.member.roles as GuildMemberRoleManager).add(roleId);
        await interaction.user
          .send({
            content: HubPostJoinDM,
          })
          .catch(() => {});
        await interaction.user.send(HubPostJoinDm_Extra).catch(() => {});
        // ack the interaction
        return await interaction
          .reply({
            content:
              'Thank you for joining us! <:MenheraNya4:998751929205268581>',
            ephemeral: true,
          })
          .catch(() => {});
      }
      if (interaction.customId.includes('delete')) {
        const [_action, userId] = interaction.customId.split('-');
        if (interaction.user.id == userId)
          return await interaction.message.delete().catch(() => {});
        return await interaction
          .reply({
            content: 'Not your interaction!',
            ephemeral: true,
          })
          .catch();
      }
      return;
    }
    if (!interaction.isCommand()) return;
    try {
      const command = client.commands.get(interaction.commandName);
      if (command) {
        if (
          ['moderation', 'leveling'].includes(command.getCategory()) &&
          !IsMenheraServer(interaction.guildId)
        ) {
          await interaction.reply(
            'You cannot use that command outside menhera servers, https://discord.gg/menhera & https://discord.gg/menherachan',
          );
          return;
        }
        await command.run(client, interaction as CommandInteraction);
        return;
      } else {
        return;
      }
    } catch (err) {
      return console.error(interaction.commandName, err);
    }
  }
}
