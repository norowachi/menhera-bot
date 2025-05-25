import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/client';
import { GuildMember, AttachmentBuilder, TextChannel } from 'discord.js';
import { Canvas, createCanvas, loadImage } from 'canvas';
import { IsMenheraServer } from '../../utils/functions';
import path from 'path';

const HubChannelId = '554449488693952512'; //welcome channel id - of menhera hub
const LoungeChannelId = '763799665995939870'; //welcome channel id - of menhera lounge

export default class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super('guildMemberAdd');
  }
  async run(client: DiscordClient, member: GuildMember) {
    if (member.guild.id === '763799459808149525') {
      return await MenheraLoungeWelcomeCard(member);
    }
    if (!IsMenheraServer(member.guild.id)) return;
    if (member.guild.id === '551888982905192459') {
      const channel = client.channels.cache.get(HubChannelId) as TextChannel;

      const welcomeImage = await getWelcomeCard(member);

      await channel.send({
        content: `Welcome <@!${member.user.id}>, in case you don't have access to the community channels, please check <#880768861123792896>\nAnd don't forget to check out discord.gg/menherachan for more menhera emotes!`,
        files: [welcomeImage],
      });
    }
    await stickyNotes(member);
    client.emit('guildMemberUpdate', member, member);
    return;
  }
}

async function getWelcomeCard(member: GuildMember) {
  const canvas = createCanvas(845, 475);
  const ctx = canvas.getContext('2d');
  const background = await loadImage(
    path.join(process.cwd(), 'images/server_invite_background.png'),
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#74037b';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  // Select the font size and type from one of the natively available fonts

  ctx.font = applyText(canvas, 'Welcome', 70);
  // Select the style that will be used to fill the text in
  ctx.fillStyle = '#fdf6da';
  // Actually fill the text with a solid color
  ctx.fillText('Welcome', canvas.width / 3.0, canvas.height / 2.3);

  ctx.font = applyText(canvas, member.user.tag, 50);
  // Select the style that will be used to fill the text in
  ctx.fillStyle = '#7289da';
  // Actually fill the text with a solid color
  ctx.fillText(member.user.tag, canvas.width / 3.0, canvas.height / 1.7);
  // Pick up the pen

  ctx.beginPath();
  // Start the arc to form a circle
  ctx.arc(175, 225, 75, 0, Math.PI * 2, true);
  // Put the pen down

  ctx.closePath();
  // Clip off the region you drew on
  ctx.clip();
  const avatar = await loadImage(
    member.user.displayAvatarURL({ extension: 'png' }),
  );
  // Draw a shape onto the main canvas
  ctx.drawImage(avatar, 100, 150, 150, 150);

  return new AttachmentBuilder(canvas.toBuffer()).setName('welcome.png');
}

const applyText = (canvas: Canvas, text: string, size: number) => {
  const ctx = canvas.getContext('2d');

  // Declare a base size of the font
  let fontSize = size;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    ctx.font = `bold ${(fontSize -= 10)}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (ctx.measureText(text).width > 250);

  // Return the result to use in the actual canvas
  return ctx.font;
};

async function stickyNotes(member: GuildMember) {
  const hubchannel = '554449488693952512';
  const minichannel = '1077107046857592893';

  const mainLink = 'discord.gg/menhera';
  const miniLink = 'discord.gg/menherachan'; //CTvDe6PYNc";

  // const hubmsg = `Welcome <@${member.id}>! Click on the \`join\` button to join me and everyone in the server. I would love to chat with everyone who joins and become great friends! Understand however that everyone who joins understands the rules. If you're just here to see cute stickers and emotes of me, don't forget to join our other server ${miniLink} I look forward to seeing you soon!`;
  const HubJoinDM = `Welcome to my server! Make sure you join my secondary mini server with even more stickers and emotes!\nhttps://${miniLink}`;
  const HubLeaveDM = `You don't love me??? <a:MenheraPhoneCry4:1044832211641307137> Please come back, I promise I'll change! Please don't leave me!`;
  const HubRejoinDM = `You came back!!!!! Thank you, thank you, I missed you soo much <:MenheraCry5:998700712131297351>`;

  const minimsg = `Welcome everyone to my mini server! If you want more emotes and to perhaps chat with me, make sure to join our main server!\nhttps://${mainLink}`;
  const miniJoinDM = `Welcome to my mini server! If you want access to even more stickers, and perhaps even chat with me and many others, make sure to join the main server. I'll be waiting for you.\nhttps://${mainLink}`;

  if (member.guild.channels.cache.has(hubchannel)) {
    /* hub sticky note
		const arrival = member.guild.channels.cache.get(hubchannel) as TextChannel;
		await (await arrival.messages.fetch())
			.find(
				(m) => m.content.replace(/<@.*>/, "") == hubmsg.replace(/<@.*>/, "")
			)
			?.delete();
		await arrival.send({
			content: hubmsg,
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					new ButtonBuilder()
						.setCustomId("join-server")
						.setLabel("Join")
						.setStyle(ButtonStyle.Success)
				),
			],
		});
		*/
    await member.send(HubJoinDM).catch(() => {});
    // if rejoins
    const leaveMsg = (
      await member.dmChannel?.messages.fetch({ limit: 3 })
    )?.find((m) => m.author.id === m.client.user.id && m.content == HubLeaveDM);
    if (!leaveMsg) return;
    await member.send(HubRejoinDM).catch(() => {});
    return;
  }
  if (member.guild.channels.cache.has(minichannel)) {
    const arrival = member.guild.channels.cache.get(minichannel) as TextChannel;
    await (await arrival.messages.fetch())
      .find((m) => m.content == minimsg)
      ?.delete();
    await arrival.send(minimsg);
    await member.send(miniJoinDM).catch(() => {});
    return;
  }
  return;
}

async function MenheraLoungeWelcomeCard(member: GuildMember) {
  const applyText = (canvas: Canvas, text: string) => {
    const ctx = canvas.getContext('2d');

    // Declare a base size of the font
    let fontSize = 40;

    do {
      // Assign the font to the context and decrement it so it can be measured again
      ctx.font = `bold ${(fontSize -= 10)}px sans-serif`;
      // Compare pixel width of the text to the canvas minus the approximate avatar size
    } while (ctx.measureText(text).width > 217);

    // Return the result to use in the actual canvas
    return ctx.font;
  };

  const canvas = createCanvas(845, 475);
  const ctx = canvas.getContext('2d');
  const background = await loadImage('././././images/welcome.png');

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#74037b';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  // Select the font size and type from one of the natively available fonts
  ctx.font = applyText(canvas, member.displayName);
  // Select the style that will be used to fill the text in
  ctx.fillStyle = '#efefef';
  // Actually fill the text with a solid color
  ctx.fillText(member.displayName, canvas.width / 3.4, canvas.height / 1.7);
  // Pick up the pen
  ctx.beginPath();
  // Start the arc to form a circle
  ctx.arc(175, 225, 75, 0, Math.PI * 2, true);
  // Put the pen down
  ctx.closePath();
  // Clip off the region you drew on
  ctx.clip();
  const avatar = await loadImage(
    member.user.displayAvatarURL({ extension: 'png' }),
  );
  // Draw a shape onto the main canvas
  ctx.drawImage(avatar, 100, 150, 150, 150);
  const attachment = new AttachmentBuilder(canvas.toBuffer()).setName(
    'welcome-image.png',
  );

  const channel = (await member.guild.channels.fetch(
    LoungeChannelId,
  )) as TextChannel;
  try {
    return channel?.send({
      content: `Welcome to ${member.guild.name}, <@!${member.id}>!`,
      files: [attachment],
    });
  } catch (err) {
    return console.error(err);
  }
}
