import { Schema, model } from 'mongoose';

const ModerationSchema = new Schema({
  userId: String,
  userTag: String,
  moderationType: String,
  moderationTime: Number,
});

export const moderation = model('moderation', ModerationSchema);
