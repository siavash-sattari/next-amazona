import nc from 'next-connect';
import db from '../../../../utils/db';
import { isAdmin, isAuth } from '../../../../utils/auth';
import User from '../../../../models/user';

const handler = nc();

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const users = await User.find({});
  await db.disconnect();
  res.send(users);
});

export default handler;
