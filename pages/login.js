import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

import Layout from '../components/Layout';
import { Store } from '../utils/Store';

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = router.query; // login?redirect=/shipping
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (userInfo) {
      router.push('/');
    }
  }, [router, userInfo]);

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm();

  const submitHandler = async ({ email, password }) => {
    try {
      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      });

      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      router.push(redirect || '/');
    } catch (err) {
      toast.error(err.response.data ? err.response.data.message : err.message);
    }
  };

  return (
    <Layout title='Login'>
      <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit(submitHandler)}>
        <h1 className='mb-4 text-xl'>Login</h1>
        <div className='mb-4'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email'
              }
            })}
            className='w-full'
            id='email'
            autoFocus
          />
          {errors.email && <div className='text-red-500'>{errors.email.message}</div>}
        </div>
        <div className='mb-4'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            {...register('password', {
              required: 'Please enter password',
              minLength: { value: 6, message: 'password is more than 5 chars' }
            })}
            className='w-full'
            id='password'
            autoFocus
          />
          {errors.password && <div className='text-red-500 '>{errors.password.message}</div>}
        </div>
        <div className='mb-4 '>
          <button className='primary-button'>Login</button>
        </div>
        <div className='mb-4 '>
          Don&apos;t have an account? &nbsp;
          <Link href='register'>Register</Link>
        </div>
      </form>
    </Layout>
  );
}
