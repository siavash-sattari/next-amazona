import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/user';
import db from '../../../utils/db';
import { signToken, isAuth } from '../../../utils/auth';

const handler = nc();

handler.use(isAuth);

handler.put(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !email.includes('@') || (password && password.trim().length < 5)) {
    res.status(422).json({
      message: 'Validation error'
    });
    return;
  }

  await db.connect();

  const user = await User.findById(req.user._id);
  user.name = name;
  user.email = email;
  user.password = password ? bcrypt.hashSync(password) : user.password;

  await user.save();

  await db.disconnect();

  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    message: 'User updated successfully'
  });
});

export default handler;
