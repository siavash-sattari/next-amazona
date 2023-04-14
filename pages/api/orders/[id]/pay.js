import nc from 'next-connect';
import Order from '../../../../models/order';
import db from '../../../../utils/db';
import onError from '../../../../utils/error';
import { isAuth } from '../../../../utils/auth';

const handler = nc({
  onError
});

handler.use(isAuth);

handler.put(async (req, res) => {
  await db.connect();
  const order = await Order.findById(req.query.id);
  if (order) {
    if (order.isPaid) {
      return res.status(400).send({ message: 'Error: order is already paid' });
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address
    };
    const paidOrder = await order.save();
    await db.disconnect();
    res.send({ message: 'order paid successfully', order: paidOrder });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'order not found' });
  }
});

export default handler;
