import { useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import db from '../utils/db';
import { Store } from '../utils/store';
import Product from '../models/product';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';

const PAGE_SIZE = 10;

const prices = [
  {
    name: '$1 to $50',
    value: '1-50'
  },
  {
    name: '$51 to $200',
    value: '51-200'
  },
  {
    name: '$201 to $1000',
    value: '201-1000'
  }
];

const ratings = [1, 2, 3, 4, 5];

const Search = props => {
  const router = useRouter();
  const { query = 'all', category = 'all', brand = 'all', price = 'all', rating = 'all', sort = 'featured' } = router.query;
  const { products, countProducts, categories, brands } = props;

  const filterSearch = ({ page, category, brand, sort, min, max, searchQuery, price, rating }) => {
    const path = router.pathname;
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: path,
      query: query
    });
  };

  const categoryHandler = e => {
    filterSearch({ category: e.target.value });
  };

  const brandHandler = e => {
    filterSearch({ brand: e.target.value });
  };

  const sortHandler = e => {
    filterSearch({ sort: e.target.value });
  };

  const priceHandler = e => {
    filterSearch({ price: e.target.value });
  };

  const ratingHandler = e => {
    filterSearch({ rating: e.target.value });
  };

  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async product => {
    const existItem = state.cart.cartItems.find(x => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };

  return (
    <Layout title='Search'>
      <div className='grid md:grid-cols-5 md:gap-5'>
        <ul>
          <li className='mb-3'>
            <h2 className='mb-1 font-semibold'>Categories</h2>
            <select value={category} onChange={categoryHandler} className='w-full'>
              <option value='all'>All</option>
              {categories &&
                categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </li>
          <li className='mb-3'>
            <h2 className='mb-1 font-semibold'>Brands</h2>
            <select value={brand} onChange={brandHandler} className='w-full'>
              <option value='all'>All</option>
              {brands &&
                brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
            </select>
          </li>
          <li className='mb-3'>
            <h2 className='mb-1 font-semibold'>Prices</h2>
            <select value={price} onChange={priceHandler} className='w-full'>
              <option value='all'>All</option>
              {prices.map(price => (
                <option key={price.value} value={price.value}>
                  {price.name}
                </option>
              ))}
            </select>
          </li>
          <li className='mb-3'>
            <h2 className='mb-1 font-semibold'>Ratings</h2>
            <select value={rating} onChange={ratingHandler} className='w-full'>
              <option value='all'>All</option>
              {ratings.map(rating => (
                <option dispaly='flex' key={rating} value={rating}>
                  <p>{rating} &amp; Up</p>
                </option>
              ))}
            </select>
          </li>
          <li className='mt-5'>
            {(query !== 'all' && query !== '') || category !== 'all' || brand !== 'all' || rating !== 'all' || price !== 'all' ? (
              <button onClick={() => router.push('/search')} className='primary-button w-full font-semibold'>
                Reset Filters
              </button>
            ) : null}
          </li>
        </ul>

        <div className='overflow-x-auto md:col-span-4 ml-5'>
          <div className='flex justify-between items-center mb-5'>
            <div className='font-semibold'>
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ' - ' + query}
              {category !== 'all' ? ` - ${category}` : ''}
              {brand !== 'all' ? ` - ${brand}` : ''}
              {price !== 'all' ? ` - ${price}` : ''}
              {rating !== 'all' ? ` - Rating ${rating} & up` : ''}
            </div>

            <div className='flex items-center'>
              <span className='mr-2 font-semibold'>Sort by</span>
              <select value={sort} onChange={sortHandler}>
                <option value='featured'>Featured</option>
                <option value='lowest'>Price: Low to High</option>
                <option value='highest'>Price: High to Low</option>
                <option value='toprated'>Customer Reviews</option>
                <option value='newest'>Newest Arrivals</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3'>
            {products.map(product => (
              <div item md={4} key={product.name}>
                <ProductItem product={product} addToCartHandler={addToCartHandler} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;

export async function getServerSideProps({ query }) {
  await db.connect();
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i'
          }
        }
      : {};

  const categoryFilter = category && category !== 'all' ? { category } : {};

  const brandFilter = brand && brand !== 'all' ? { brand } : {};

  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating)
          }
        }
      : {};

  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1])
          }
        }
      : {};

  const order =
    sort === 'featured'
      ? { featured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  const categories = await Product.find().distinct('category');

  const brands = await Product.find().distinct('brand');

  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter
    },
    '-reviews'
  )
    .sort(order)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter
  });

  await db.disconnect();

  const products = productDocs.map(db.convertDocToObj);

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands
    }
  };
}
