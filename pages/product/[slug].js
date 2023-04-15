/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import db from '../../utils/db';
import { Store } from '../../utils/store';
import { getError } from '../../utils/error';
import Product from '../../models/product';
import Layout from '../../components/Layout';
import Rating from '../../components/Rating';

export default function ProductScreen({ product }) {
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const router = useRouter();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` }
        }
      );
      setLoading(false);
      toast.success('Review submitted successfully');
      fetchReviews();
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  // Refreshing Server-Side Props
  const refreshData = () => {
    router.replace(router.asPath);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
      refreshData();
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (!product) {
    return <Layout title='Produt Not Found'>Produt Not Found</Layout>;
  }

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find(x => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name}>
      <div className='py-2'>
        <Link href='/'>back to products</Link>
      </div>
      <div className='grid md:grid-cols-4 md:gap-3'>
        <div className='md:col-span-2'>
          <Image src={product.image} alt={product.name} width={640} height={640} layout='responsive'></Image>
          <h1 className='text-3xl my-3'>Customer Reviews :</h1>
          {reviews.length === 0 && <p className='bg-[#84d8ff] p-3 text-lg'>No review</p>}
          {reviews?.map(review => (
            <div key={review._id}>
              <div className='flex items-center'>
                <div>
                  <h6 className='font-bold mb-[10px]'>{review.name}</h6>
                  <h4>{review.createdAt.substring(0, 10)}</h4>
                </div>
                <div className='h-[4rem] w-[1px] bg-neutral-700 mx-3'></div>
                <div>
                  <Rating value={product.rating} />
                  <h4 className='mt-3'>{review.comment}</h4>
                </div>
              </div>
              <div className='h-[1px] w-full bg-neutral-700 my-3'></div>
            </div>
          ))}
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h1 className='text-3xl my-3'>Leave your review</h1>
              <div>
                <label htmlFor='comment' className='text-lg'>
                  Comment
                </label>
                <input
                  className='w-full my-2'
                  id='comment'
                  name='review'
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder='Enter your comment'
                />
              </div>
              <div>
                <label htmlFor='rating' className='text-lg'>
                  Rating
                </label>
                <select value={rating} onChange={e => setRating(e.target.value)} id='rating' className='w-full my-2'>
                  <option value=''>Select...</option>
                  <option value='1'>1 - Poor</option>
                  <option value='2'>2 - Fair</option>
                  <option value='3'>3 - Good</option>
                  <option value='4'>4 - Very Good</option>
                  <option value='5'>5 - Excellent</option>
                </select>
              </div>
              <button type='submit' className='primary-button w-full mt-3 mb-[10rem]'>
                Submit
              </button>
              {loading && 'loading ...'}
            </form>
          ) : (
            <h2 className='text-lg mt-5 mb-[10rem]'>
              Please <Link href={`/login?redirect=/product/${product.slug}`}>login</Link> to write a review
            </h2>
          )}
        </div>
        <div>
          <ul>
            <li>
              <h1 className='text-lg'>{product.name}</h1>
            </li>
            <li>Category: {product.category}</li>
            <li>Brand: {product.brand}</li>
            <li>
              <Rating value={product.rating} text={`(${product.rating} of ${product.numReviews} reviews)`} />
            </li>
            <li>Description: {product.description}</li>
          </ul>
        </div>
        <div>
          <div className='card p-5'>
            <div className='mb-2 flex justify-between'>
              <div>Price</div>
              <div>${product.price}</div>
            </div>
            <div className='mb-2 flex justify-between'>
              <div>Status</div>
              <div>{product.countInStock > 0 ? 'In stock' : 'Unavailable'}</div>
            </div>
            <button className='primary-button w-full' onClick={addToCartHandler}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();
  return {
    props: {
      product: product ? db.convertDocToObj(product) : null
    }
  };
}
