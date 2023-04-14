import nc from 'next-connect';
import Order from '../../../models/order';
import db from '../../../utils/db';
import { isAuth } from '../../../utils/auth';
import { onError } from '../../../utils/error';

const handler = nc({
  onError
});

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();
  const orders = await Order.find({ user: req.user._id });
  await db.disconnect();
  res.send(orders);
});

export default handler;
