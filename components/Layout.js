import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

import Cookies from 'js-cookie';
import { Menu } from '@headlessui/react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Store } from '../utils/store';
import DropdownLink from './DropdownLink';

export default function Layout({ title, children }) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const [query, setQuery] = useState('');
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

  const logoutClickHandler = () => {
    dispatch({ type: 'USER_LOGOUT' });
    toast.success('You have logout successfully');
    Cookies.remove('userInfo');
    Cookies.remove('cart');
    router.push('/');
  };

  const queryChangeHandler = e => {
    setQuery(e.target.value);
  };

  const submitHandler = e => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  return (
    <>
      <Head>
        <title>{title ? title + ' - Amazona' : 'Amazona'}</title>
        <meta name='description' content='Ecommerce Website' />
      </Head>
      <div className='flex min-h-screen flex-col justify-between '>
        <header>
          <nav className='flex h-12 items-center px-4 py-10 justify-between shadow-md'>
            <Link href='/'>
              <a className='text-xl font-bold'>amazona</a>
            </Link>
            <form onSubmit={submitHandler}>
              <div className='flex items-center justify-center '>
                <div className='flex border-2 border-gray-200 rounded'>
                  <input type='text' className='px-4 w-80' placeholder='Search...' onChange={queryChangeHandler} />
                  <button className='px-4 text-white bg-[#2E4EB7] border-l '>Search</button>
                </div>
              </div>
            </form>
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
                <Menu as='div' className='relative inline-block'>
                  <Menu.Button className='text-blue-600 flex items-center'>
                    {userInfo.name} <HiChevronDown />
                  </Menu.Button>
                  <Menu.Items className='absolute right-0 top-9 w-40 origin-top-right bg-white shadow-lg '>
                    <Menu.Item>
                      <DropdownLink className='dropdown-link' href='/profile'>
                        Profile
                      </DropdownLink>
                    </Menu.Item>
                    <Menu.Item>
                      <DropdownLink className='dropdown-link' href='/order-history'>
                        Order History
                      </DropdownLink>
                    </Menu.Item>
                    {userInfo.isAdmin && (
                      <Menu.Item>
                        <DropdownLink className='dropdown-link' href='/admin/dashboard'>
                          Admin Dashboard
                        </DropdownLink>
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      <a className='dropdown-link' href='#' onClick={logoutClickHandler}>
                        Logout
                      </a>
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
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
