import BaseCommand from "../../utils/structures/BaseCommand";
import DiscordClient from "../../client/client";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    ResetWeekly,
    SundayAT8,
} from "../../database/functions/weeklyuserexpFunctions";

export default class ResetWeeklyCommand extends BaseCommand {
    constructor() {
        super("resetweekly", "leveling");
    }
    async run(client: DiscordClient, interaction: CommandInteraction) {
        try {
            await ResetWeekly(client);
            const Time = SundayAT8();
            const embed = new EmbedBuilder().setDescription(
                `Weekly Leaderboard was manually reseted.\
                \nThe next reset would be <t:${Time.toString().slice(
                    0,
                    Time.toString().length - 3
                )}:R>`
            );
            interaction.editReply({ embeds: [embed] });
        } catch (err) {
            interaction.followUp({ content: `Errored out` });
            return console.error(err);
        }
    }
}
