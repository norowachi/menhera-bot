import BaseEvent from '../utils/structures/BaseEvent';
import DiscordClient from '../client/client';
import { EmbedBuilder, TextChannel } from 'discord.js';
import {
  getWeeklyTimer,
  initWeeklyTimer,
  ResetWeekly,
} from '../database/functions/weeklyuserexpFunctions';
import { getBdays } from '../database/functions/birthday';

export default class ReadyEvent extends BaseEvent {
  constructor() {
    super('ready');
  }
  async run(client: DiscordClient) {
    console.log(`${client.user?.tag} has logged in.`);
    const channel = (await client.channels.fetch(
      '881546015705026610', //mod-logs
    )) as TextChannel;
    client.logChannel = channel;

    client.guildXP.channel = [
      '881292562332258394', //spam
      '894044004927283261', //mudae
      '880777835323744296', //bot-channel
    ];

    client.guildXP.role = '1250541847705555024'; //no-exp role
    client.guildXP.logChannel = '880776818527981598'; //general

    setInterval(
      () => {
        Promise.all([
          // weekly lb reset and announcement
          (async () => {
            const timer = await getWeeklyTimer();
            if (!timer) return await initWeeklyTimer();
            if (Date.now() >= timer) await ResetWeekly(client);
            return;
          })(),
          (async () => {
            const bdays = await getBdays();
            if (!bdays || bdays.length == 0) return;

            // set Bday congratulations in #general
            ((await client.channels.fetch('880776818527981598')) as TextChannel)
              .send({
                // mentioning users
                // content: bdays.map((doc) => "<@" + doc.userId + ">").join(", "),
                embeds: [
                  new EmbedBuilder()
                    .setTitle('Happy BirthDay!')
                    .setDescription(
                      `Today is the Birthday of ${
                        bdays.length <= 1
                          ? bdays.map((d) => `<@${d.userId}>`)[0]
                          : [
                              bdays
                                .slice(0, -1)
                                .map((d) => `<@${d.userId}>`)
                                .join(', '),
                              `<@${bdays[-1].userId}>`,
                            ].join(' and ') + ' (yes they share a bday)'
                      }\nWish them a happy birthday!`,
                    )
                    .setFooter({ text: ':3' }),
                ],
              })
              .catch((err) => console.error(err));

            bdays.forEach(async (d) => {
              try {
                // get member in menhera hub
                const member = await client.guilds.cache
                  .get('551888982905192459')
                  ?.members.fetch(d.userId!);
                // if member not found, skip
                if (!member) return;
                // add cake role
                member?.roles.add('1212489708446416936');
                setTimeout(
                  () => member?.roles.remove('1212489708446416936'),
                  24 * 60 * 60 * 1000,
                ); // 24 hours

                const [month, day] = d.birthday!.split('-');
                const BDayDate = new Date(
                  `${month}-${day}-${new Date().getFullYear() + 1}`,
                );
                d.in = BDayDate.getTime();

                await d.save();
              } catch (e) {
                console.log(e);
                return;
              }
            });
            return;
          })(),
        ]);
      },
      60 * 60 * 1000,
    ); //1 hour
  }
}
