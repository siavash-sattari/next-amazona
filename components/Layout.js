import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Store } from '../utils/Store';

export default function Layout({ title, children }) {
  const { state } = useContext(Store);
  const { cart, userInfo } = state;

  const [hasMounted, setHasMounted] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  // Fix Error : Hydration failed because the initial UI does not match what was rendered on the server.
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title ? title + ' - Amazona' : 'Amazona'}</title>
        <meta name='description' content='Ecommerce Website' />
      </Head>
      <ToastContainer position='top-right' limit={1} />
      <div className='flex min-h-screen flex-col justify-between '>
        <header>
          <nav className='flex h-12 items-center px-4 justify-between shadow-md'>
            <Link href='/'>
              <a className='text-xl font-bold'>amazona</a>
            </Link>
            <div>
              <Link href='/cart'>
                <a className='p-2'>
                  Cart
                  {cartItemsCount > 0 && (
                    <span className='ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white'>{cartItemsCount}</span>
                  )}
                </a>
              </Link>
              {userInfo ? (
                userInfo.name
              ) : (
                <Link href='/login'>
                  <a className='p-2 text-lg'>Login</a>
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className='container m-auto mt-4 px-4'>{children}</main>
        <footer className='flex h-10 justify-center items-center shadow-inner'>
          <p>Copyright © 2022 Amazona</p>
        </footer>
      </div>
    </>
  );
}
