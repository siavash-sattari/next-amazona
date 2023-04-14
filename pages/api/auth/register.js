import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/user';
import db from '../../../utils/db';
import { signToken } from '../../../utils/auth';

const handler = nc();

handler.post(async (req, res) => {
  const { name, email, password } = req.body;

  if (req.method !== 'POST') {
    return;
  }

  if (!name || !email || !email.includes('@') || !password || password.trim().length < 5) {
    res.status(422).json({
      message: 'Validation error'
    });
    return;
  }

  await db.connect();

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    res.status(422).json({ message: 'User exists already!' });
    await db.disconnect();
    return;
  }

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password),
    isAdmin: false
  });

  const user = await newUser.save();
  
  await db.disconnect();

  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    message: 'Created user!'
  });
});

export default handler;
