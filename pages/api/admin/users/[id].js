import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import db from '../../../../utils/db';
import { isAdmin, isAuth, signToken } from '../../../../utils/auth';
import User from '../../../../models/user';

const handler = nc();

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  await db.disconnect();
  res.send(user);
});

handler.put(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !email.includes('@') || (password && password.trim().length < 5)) {
    res.status(422).json({
      message: 'Validation error'
    });
    return;
  }

  await db.connect();

  const user = await User.findById(req.query.id);
  if (user) {
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
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'User Not Found' });
  }
});

handler.delete(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user && user.isAdmin) {
    return res.status(400).send({ message: 'Can not delete admin' });
  } else if (user) {
    await user.remove();
    await db.disconnect();
    res.send({ message: 'User Deleted' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'User Not Found' });
  }
});

export default handler;
