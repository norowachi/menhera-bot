import {
  ApplicationCommandData,
  ApplicationCommandType,
  Client,
} from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

import { config } from 'dotenv';
config();

const client = new Client({
  intents: [],
});

client.login(process.env.TOKEN);

// Someone should change the description...
const commands: ApplicationCommandData[] = [
  {
    name: 'ban',
    description: 'Ban a user from the server',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to Ban',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason for the ban',
        required: false,
      },
    ],
    defaultMemberPermissions: ['BanMembers'],
  },
  {
    name: 'unban',
    description: 'Unban a user from the server',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'user-id',
        description: 'Id of the user',
        required: true,
      },
    ],
    defaultMemberPermissions: ['BanMembers'],
  },
  {
    name: 'mute',
    description: 'mute a user on the server',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to mute',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: 'for how long',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason for the mute',
        required: false,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'unmute',
    description: 'unmute a user on the server',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to mute',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'warn',
    description: 'warn a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to warn',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason for the warn',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'warnings',
    description: 'List warnings of a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to show warnings',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'delwarn',
    description: 'Delete a warning of a user',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'id',
        description: 'warning id',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'kick',
    description: 'Kick a user from the server',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to kick',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason for the kick',
        required: false,
      },
    ],
    defaultMemberPermissions: ['KickMembers'],
  },
  {
    name: 'givelevel',
    description: 'Give a level to a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to give level',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Number,
        name: 'level',
        description: 'Level to give',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
		name: "setlevel",
		description: "Set a user's level",
		options: [
			{
				type: ApplicationCommandOptionType.User,
				name: "user",
				description: "User to modify",
				required: true,
			},
			{
				type: ApplicationCommandOptionType.Number,
				name: "level",
				description: "Level to set",
				required: true,
			},
		],
	  defaultMemberPermissions: ["ModerateMembers"],
	},
  {
    name: 'purge',
    description: 'delete messages in bulk',
    options: [
      {
        type: ApplicationCommandOptionType.Number,
        name: 'amount',
        description: 'How many messages',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ManageMessages'],
  },
  {
    name: 'moderations',
    description: 'List active morderations',
    defaultMemberPermissions: ['ModerateMembers'],
  },
  {
    name: 'rank',
    description: 'Get you rank card',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'user whose rank card u want',
        required: false,
      },
    ],
  },
  {
    name: 'leaderboard',
    description: 'Shows the rank leaderboard',
  },
  {
    name: 'weeklylb',
    description: 'Shows the weekly rank leaderboard',
  },
  {
    name: 'resetweekly',
    description: 'Resets the weekly timer',
    defaultMemberPermissions: ['ManageGuild'],
  },
  {
    name: 'create-self-role',
    description: 'Create Self Roles Menu',
    options: [
      {
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'In which channel you want to create it',
        required: true,
      },
    ],
    defaultMemberPermissions: ['ManageGuild'],
  },
  {
    name: 'eval',
    description: 'Evaluate a peice of code',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'code',
        description: 'The "peice of code"',
        required: true,
      },
    ],
  },
  {
    name: 'draw',
    description: "Print text on menhera's pic",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'text',
        description: 'Text to print',
        required: true,
      },
    ],
  },
  {
    name: 'modifiers',
    description: `change "Exp per message"/"Exp cooldown" value`,
    options: [
      {
        name: 'exp',
        description: 'Exp per message',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'set',
            description: 'set exp to get per message',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },

      {
        name: 'cooldown',
        description: 'Exp cooldown',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'set',
            description: 'set cooldown between exp (in seconds)',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
    defaultMemberPermissions: ['ManageGuild'],
  },
  {
    name: 'multipliers',
    description: `Modify xp multiplier for some channels or roles`,
    options: [
      {
        name: 'role',
        description: 'modify a role',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'add',
            description: 'add a role multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'role',
                description: 'desired role',
                type: ApplicationCommandOptionType.Role,
                required: true,
              },
              {
                name: 'xp',
                description: 'xp value',
                type: ApplicationCommandOptionType.Integer,
                required: true,
              },
            ],
          },
          {
            name: 'edit',
            description: 'Edit role multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'role',
                description: 'desired role',
                type: ApplicationCommandOptionType.Role,
                required: true,
              },
              {
                name: 'xp',
                description: 'xp value',
                type: ApplicationCommandOptionType.Integer,
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'Delete a role multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'role',
                description: 'desired role',
                type: ApplicationCommandOptionType.Role,
                required: true,
              },
            ],
          },
        ],
      },

      {
        name: 'channel',
        description: 'Exp cooldown',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'add',
            description: 'add a channel multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'channel',
                description: 'desired channel',
                type: ApplicationCommandOptionType.Channel,
                required: true,
              },
              {
                name: 'xp',
                description: 'xp users get in that channel',
                type: ApplicationCommandOptionType.Integer,
                required: true,
              },
            ],
          },
          {
            name: 'edit',
            description: 'Edit a channel multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'channel',
                description: 'desired channel',
                type: ApplicationCommandOptionType.Channel,
                required: true,
              },
              {
                name: 'xp',
                description: 'xp users get in that channel',
                type: ApplicationCommandOptionType.Integer,
                required: true,
              },
            ],
          },
          {
            name: 'remove',
            description: 'Delete a channel multiplier',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'channel',
                description: 'desired channel',
                type: ApplicationCommandOptionType.Channel,
                required: true,
              },
            ],
          },
        ],
      },
    ],
    defaultMemberPermissions: ['ManageGuild'],
  },
  {
    name: 'birthday',
    description: 'Set your birthday to congratulations and a cake role on it!',
    options: [
      {
        name: 'set',
        description: "set your bday's date",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'date',
            description: "You Bday's Date in mm-dd format",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Report Message',
    type: ApplicationCommandType.Message,
  },
  {
    name: 'report',
    description: 'Report a user',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'User to report',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: 'Reason for the report',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'message',
        description: 'Message ID reference for the report',
        required: false,
      },
    ],
  },
];

client.on('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}\n`);
  try {
    const argv1 = process.argv.slice(2)[0];
    if (!argv1) {
      const rl = readline.createInterface({ input, output });
      rl.question(
        'Do you want to \x1b[32m[C]reate\x1b[0m new commands or \x1b[31m[D]elete\x1b[0m current ones? ',
        async (reply) => {
          await CreateOrDelete(reply);
          rl.close();
        },
      );
    } else {
      await CreateOrDelete(argv1);
    }
  } catch (err) {
    console.error('Error When Registering:', err);
  }
});

async function CreateOrDelete(reply: string) {
  if (reply.toLowerCase().startsWith('c')) {
    console.log('\x1b[32m%s\x1b[0m', 'Started creating...');
    await client.application!.commands.set(commands);
    console.log('\x1b[36m%s\x1b[0m', 'Completed Registering\nExiting Now');
  } else if (reply.toLowerCase().startsWith('d')) {
    console.log('\x1b[31m%s\x1b[0m', 'Started deleting...');
    await client.application!.commands.set([]);
    console.log('\x1b[36m%s\x1b[0m', 'Finished Deleting\nExiting Now');
  } else {
    console.error('\nYou can only use (C)reate or (D)elete');
  }
  process.exit(0);
}
