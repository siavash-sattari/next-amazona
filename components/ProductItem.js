import Link from 'next/link';
import Rating from './Rating';

export default function ProductItem({ product, addToCartHandler }) {
  return (
    <div className='card'>
      <Link href={`/product/${product.slug}`}>
        <a>
          <img src={product.image} alt={product.name} className='rounded shadow object-cover h-64 w-full' />
        </a>
      </Link>
      <div className='flex flex-col items-center justify-center p-5'>
        <Link href={`/product/${product.slug}`}>
          <a>
            <h2 className='text-lg'>{product.name}</h2>
          </a>
        </Link>
        <Rating value={product.rating} />
        <p className='mb-2'>{product.brand}</p>
        <p>${product.price}</p>
        <button className='primary-button font-semibold' type='button' onClick={() => addToCartHandler(product)}>
          Add to cart
        </button>
      </div>
    </div>
  );
}
