import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import {
    CommandInteraction,
    Guild,
    GuildMember,
    EmbedBuilder,
} from "discord.js";
import { addExp, getExp } from "../../database/functions/userexpFunction";
import { levelUpMessage } from "../../utils/modules/expSystem";

export default class GiveLevelCommand extends BaseCommand {
    constructor() {
        super("givelevel", "leveling");
    }
    async run(client: DiscordClient, interaction: CommandInteraction) {
        const member = interaction.options.data[0].member as GuildMember;
        const level = interaction.options.data[1].value as number;
        const guild = interaction.guild as Guild;
        if (!member || !member.user) {
            await interaction.followUp({
                content: "Couldn't find desired member",
            });
            return;
        }
        const userXP = await getExp(member.user.id);
        if (level === 0) {
            await interaction.followUp({ content: "Cannot add 0 levels" });
            return;
        }
        if (!userXP) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(
                    "This user is not in my database. They need to send message first to get registered"
                );
            await interaction.followUp({ embeds: [embed] });
            return;
        }
        const newLevel = Math.floor(Math.sqrt(userXP.xp || 0) * 0.1) + level;
        if (newLevel < 0) {
            await interaction.followUp({
                content: "Level cannot be less than 0",
            });
            return;
        }
        const newXP = Math.floor(newLevel ** 2 / 0.01);
        await addExp(member.user.id, newXP);
        await levelUpMessage(newLevel, guild, member, client);
        if (client.guildXP.userXP.has(member.user.id)) {
            client.guildXP.userXP.get(member.user.id)!.xp = newXP;
        }
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(
                `Changed ${member.user.username} level to ${newLevel}`
            );
        await interaction.followUp({ embeds: [embed] });
    }
}
