import { Types } from "mongoose";

export type WarningData = {
    _id?: Types.ObjectId;
    userId: string;
    warning: string;
    moderator: string;
    date: number;
};

export type ModerationData = {
    _id?: Types.ObjectId;
    userId: string;
    userTag: string;
    moderationType: string;
    moderationTime: number;
};

export type moderationMap = {
    timeout: NodeJS.Timeout;
    id: Types.ObjectId;
};

export type expData = {
    channel: Array<string>;
    userXP: Map<string, userXP>;
    weeklyUserExp: Map<string, WeeklyUserXP>;
    logChannel: string;
};

export type userXP = {
    userId: string;
    xp: number;
    lastTimestamp: number;
};

export type WeeklyUserXP = {
    userId: string;
    xp: number;
};

export type guildData = {
    guildId: string;
    exp: {
        xp?: number;
        cooldown?: number;
    };
    multi: { id: string; xp: number }[];
};

export interface CustomRespData {
    guildId: string;
    responses?: CustomResp[];
}
export interface CustomResp {
    id: string;
    keyword: string;
    reaction?: string;
    messages?: string[];
    createdBy: string;
}
