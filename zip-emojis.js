const { Client, Intents, Permissions } = require('discord.js'); 
 const fetch = require('node-fetch'); 
 const Zip = require('adm-zip'); 
  
 require('dotenv-safe').config({ 
     path: require('path').join(__dirname, '.env') 
 }); 
  
 const client = new Client({ 
     intents: [ 
         Intents.FLAGS.GUILDS, 
         Intents.FLAGS.GUILD_MESSAGES, 
         Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS 
     ], 
     allowedMentions: { 
         parse: ['users'], 
         repliedUser: false 
     } 
 }); 
  
 client.on('messageCreate', async (message) => { 
     if (message.author.bot || !message.guild) return; 
  
     if (message.content.toLowerCase().startsWith('!zip')) { 
         if ( 
             !message.member.permissions.has( 
                 Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS 
             ) 
         ) 
             return; 
  
         const emojis = [...message.guild.emojis.cache.values()]; 
         if (!emojis.length) return message.reply('Guild has no emojis.'); 
  
         const msg = await message.reply('Zipping...'); 
         const zip = new Zip(); 
         let i = 0; 
         for (const emoji of emojis) { 
             const buffer = await fetch(emoji.url).then((res) => 
                 res.arrayBuffer() 
             ); 
             zip.addFile( 
                 `${emoji.name}.${emoji.animated ? 'gif' : 'png'}`, 
                 Buffer.from(buffer) 
             ); 
             if (++i % 5 === 0) 
                 await msg.edit( 
                     `Zipping ${i}/${emojis.length} \`[${( 
                         (i / emojis.length) * 
                         100 
                     ).toFixed(2)}%]\`` 
                 ); 
         } 
         return msg.edit({ 
             content: null, 
             files: [ 
                 { attachment: zip.toBuffer(), name: `${message.guild.id}.zip` } 
             ] 
         }); 
     } 
 }); 
  
 async function main() { 
     console.log('Logging in...'); 
     await client.login(); 
     console.log(`Logged in as ${client.user.tag}.`); 
 } 
  
 void main();
