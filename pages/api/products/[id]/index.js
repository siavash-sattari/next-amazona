import nc from 'next-connect';
import db from '../../../../utils/db';
import Product from '../../../../models/product';

const handler = nc();

handler.get(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
});

export default handler;
