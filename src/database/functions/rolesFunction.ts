import { roles } from '../schemas/RolesSchema.js';

export const getRoles = async (messageId: string) => {
  const Data = await roles.findOne({ messageId });
  if (!Data) return null;
  return Data;
};

export const initDoc = async (
  messageId: string,
  roleIDs: { name: string; id: string }[],
  allowIDs?: string[],
) => {
  const newDoc = new roles({
    messageId: messageId,
    roles: roleIDs,
    allow: allowIDs && allowIDs.length > 0 ? allowIDs : [],
  });
  newDoc.save().catch(console.error);
  return;
};
