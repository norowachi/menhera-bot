import { warning } from '../schemas/WarningSchema.js';
import { WarningData } from '../../utils/GlobalTypes.js';
import { Types } from 'mongoose';
export const addWarning = async (WarningData: WarningData) => {
  const newWarning = new warning(WarningData);
  await newWarning.save();
};

export const getWarnings = async (userId: string) => {
  const userWarnings = await warning.find({ userId });
  return userWarnings;
};

export const deleteWarning = async (_id: Types.ObjectId) => {
  const getWarning = await warning.findOne({ _id });
  warning.deleteOne({ _id }).then(console.log);
  return getWarning;
};
