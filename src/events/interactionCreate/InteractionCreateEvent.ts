import BaseEvent from '../../utils/structures/BaseEvent.js';
import DiscordClient from '../../client/client.js';
import {
  ButtonStyle,
  ChannelType,
  CommandInteraction,
  ComponentType,
  GuildMemberRoleManager,
  GuildTextBasedChannel,
  Interaction,
  ThreadAutoArchiveDuration,
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
        interaction.message =
          (await interaction.channel?.messages.fetch(
            interaction.customId.split(/-/g)[2],
          )) ?? interaction.message;
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
      // ticket system, technically could be used outside menhera servers
      if (
        interaction.customId === 'open-ticket' &&
        interaction.channel?.type === ChannelType.GuildText
      ) {
        // check if user already has a ticket opened (we dont want dups, do we?)
        const activeThreads = await interaction.channel.threads.fetchActive();
        if (
          activeThreads.threads.find(
            (t) => t.name === `ticket-${interaction.user.username}`,
          )
        ) {
          return await interaction
            .reply({
              content: 'You already have an open ticket!',
              ephemeral: true,
            })
            .catch(() => {});
        }
        // create the thread
        const thread = await interaction.channel.threads
          .create({
            name: `ticket-${interaction.user.username}`,
            autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
            reason: 'User opened a ticket',
            type: ChannelType.PrivateThread,
            // make the thread uninvitable, in case the user is reporting
            // someone and mentions them by mistake maybe?
            invitable: false,
          })
          .catch(console.error);
        if (!thread)
          return await interaction
            .reply({
              content:
                'Failed to create a ticket, please contact staff about this error',
              ephemeral: true,
            })
            .catch(() => {});
        // ping user to add them to the thread
        const firstMsg = await thread.send(`<@${interaction.user.id}>`);
        // edit message to add mods to thread
        await firstMsg
          .edit({
            // ping mod role
            content: `<@&880737692864888843>`,
          })
          .then((m) => {
            // then finally delete that message cuz, yk, aesthetics and stuff
            m.delete().catch(() => {});
          })
          .catch(() => {});

        // send the info embed
        await thread
          .send({
            embeds: [
              {
                title: 'Ticket',
                description: `Hello <@${interaction.user.id}>, please state your issues or questions, a staff member will be with you shortly.\nTo close this ticket, press the "Close" button below.`,
                color: 0xff66aa,
                timestamp: new Date().toISOString(),
              },
            ],
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Danger,
                    label: 'Close',
                    //? i dont think there's a need for perm checking since it'll  just get archived
                    //? (also anyone in the thread has perms to close it methinks)
                    custom_id: `close-ticket`,
                    emoji: { name: '🔒' },
                  },
                ],
              },
            ],
          })
          .catch(() => {});
        // send log of ticket creation in reports channel
        await (
          interaction.guild?.channels.cache.get(
            '1122654657915912307',
          ) as GuildTextBasedChannel
        ) // mod reports channel
          ?.send({
            embeds: [
              {
                title: 'Ticket opened',
                description: `Ticket <#${thread.id}> opened by <@${interaction.user.id}>`,
                color: 0xff66aa,
                timestamp: new Date().toISOString(),
              },
            ],
          })
          .catch(() => {});
        // ack the interaction
        await interaction
          .reply({
            content: `Your ticket has been created: ${thread}`,
            ephemeral: true,
          })
          .catch(() => {});
        return;
      }
      // close ticket button
      if (
        interaction.customId === 'close-ticket' &&
        interaction.channel?.type === ChannelType.PrivateThread
      ) {
        await interaction
          .reply({
            content: 'Closing ticket...',
            ephemeral: true,
          })
          .catch(() => {});
        interaction.channel
          .setLocked(true, 'Ticket closed by @' + interaction.user.username)
          .catch(() => {
            console.log('failed to lock thread');
          });
        interaction.channel
          .setArchived(true, 'Ticket closed by @' + interaction.user.username)
          .catch(() => {
            console.log('failed to archive thread');
          });
        // log the ticket closure
        await (
          interaction.guild?.channels.cache.get(
            '1122654657915912307',
          ) as GuildTextBasedChannel
        ) // mod reports channel
          ?.send({
            embeds: [
              {
                title: 'Ticket closed',
                description: `Ticket <#${interaction.channelId}> closed by <@${interaction.user.id}>`,
                color: 0xff66aa,
                timestamp: new Date().toISOString(),
              },
            ],
          })
          .catch(() => {});

        return;
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
