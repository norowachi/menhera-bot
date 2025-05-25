import { ModerationData } from '../../utils/GlobalTypes.js';
import { Types } from 'mongoose';
import { moderation } from '../schemas/ModerationSchema.js';

export const addModeration = async (ModerationData: ModerationData) => {
  const id = new Types.ObjectId();
  const newMod = new moderation({
    _id: id,
    userId: ModerationData.userId,
    userTag: ModerationData.userTag,
    moderationType: ModerationData.moderationType,
    moderationTime: ModerationData.moderationTime,
  });
  await newMod.save();
  return id;
};

export const removeModeration = async (_id: Types.ObjectId) => {
  moderation.deleteOne({ _id }).catch(console.error);
};

export const getModeration = async () => {
  const moderations: ModerationData[] = await moderation.find();
  return moderations;
};
