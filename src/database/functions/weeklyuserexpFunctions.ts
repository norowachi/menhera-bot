import { EmbedBuilder, TextChannel } from 'discord.js';
import DiscordClient from '../../client/client';
import { weeklyUserExp as weekly } from '../schemas/WeeklyExpSchema';
import { WeeklyUserXP } from '../../utils/GlobalTypes';

export const setWeeklyExp = async (userId: string, xp: number) => {
  try {
    weekly.updateOne({ userId }, { $set: { xp: xp } }).catch(console.error);
  } catch {
    return null;
  }
};

export const getWeeklyExp = async (userId: string) => {
  return await weekly.findOne({ userId });
};

export const initWeeklyExp = async (userId: string) => {
  const newExp = new weekly({
    userId: userId,
    xp: 1,
  });
  newExp.save().catch(console.error);
};

export const getAllWeeklyUser = async () => {
  return await weekly.find<WeeklyUserXP>();
};

export const DelWeeklyUserExp = async (id: string) => {
  const user = await getWeeklyExp(id);
  if (user) {
    user.deleteOne().catch((err: any) => console.error(`DelUserExp:`, err));
  } else return null;
};

export const getWeeklyTimer = async () => {
  const userData = await weekly.findOne({ userId: '000' });
  if (!userData) return null;
  return userData.xp;
};

export const ResetWeekly = async (client: DiscordClient) => {
  // all users except "000", sorted
  const allusers = (await getAllWeeklyUser())
    .map((d: any) => d)
    .filter((v: any) => v.userId !== '000')
    .sort((a: any, b: any) => b.xp - a.xp);
  // top 3 winners
  const winners = allusers.filter((_v: any, i: number) => i < 3);
  client.guilds.cache
    .get('551888982905192459')
    ?.roles.cache.get('1039971890434936912')
    ?.members.filter((m) => !winners.find((w) => w.userId == m.id))
    .forEach((m) => {
      m.roles.remove('1039971890434936912');
    });
  winners.forEach(async (user: any) => {
    // getting guild and giving out the role
    (
      await client.guilds.cache
        .get('551888982905192459')
        ?.members.fetch(user.userId)
    )?.roles.add('1039971890434936912');
  });
  setTimeout(async () => {
    // sending the message to #general
    ((await client.channels.fetch('880776818527981598')) as TextChannel).send({
      content: `Winners got the <@&1039971890434936912> role for this week as their reward! <:MenheraAngelBow:998717598357274694>`,
      embeds: [
        new EmbedBuilder()
          .setTitle('A new week and new winners! 🎉')
          .setDescription('Top 3 Communicators of last week were:')
          .addFields([
            { name: '#1', value: `<@${winners[0]?.userId}>` },
            { name: '#2', value: `<@${winners[1]?.userId}>` },
            { name: '#3', value: `<@${winners[2]?.userId}>` },
          ]),
      ],
    });

    // deleting old data
    await weekly.deleteMany();
    client.guildXP.weeklyUserExp.clear();
    await initWeeklyTimer().catch(console.error);
    return;
  }, 30 * 1000);
};

export const initWeeklyTimer = async () => {
  const newExp = new weekly({
    userId: '000',
    xp: SundayAT8(),
  });
  return newExp.save().catch(console.error);
};

export function SundayAT8() {
  const today = new Date();
  today.setDate(today.getDate() + ((0 - 1 - today.getDay() + 7) % 7) + 1);
  today.setHours(8);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today.getTime();
}
