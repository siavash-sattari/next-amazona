import nc from 'next-connect';
import db from '../../../utils/db';
import Order from '../../../models/order';
import { isAuth } from '../../../utils/auth';
import { onError } from '../../../utils/error';

const handler = nc({ onError });
handler.use(isAuth);

handler.post(async (req, res) => {
  await db.connect();
  const newOrder = new Order({
    ...req.body,
    user: req.user._id
  });
  const order = await newOrder.save();
  res.status(201).send(order);
});

export default handler;
