import { userExp } from "../schemas/UserExpSchema";

export const addExp = async (userId: string, xp: number) => {
    userExp.updateOne({ userId }, { $set: { xp: xp } }).catch(console.error);
};

export const getExp = async (userId: string) => {
    const userData = await userExp.findOne({ userId });
    return userData;
};

export const initExp = async (userId: string) => {
    const newExp = new userExp({
        userId: userId,
        xp: 1,
    });
    newExp.save().catch(console.error);
};

export const getAllUser = async () => {
    const allUsers = await userExp.find();
    return allUsers;
};

export const DelUserExp = async (id: string) => {
    const user = await getExp(id);
    if(user) {
        user.deleteOne().catch((err: any) => console.error(`DelUserExp:`, err));
    } else return null;
};
