import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

import Layout from '../components/Layout';
import { Store } from '../utils/store';

export default function LoginScreen() {
  const router = useRouter();
  const { redirect } = router.query;
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
    getValues,
    formState: { errors }
  } = useForm();

  const submitHandler = async ({ name, email, password }) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password
      });

      dispatch({ type: 'USER_LOGIN', payload: data });
      Cookies.set('userInfo', JSON.stringify(data));
      toast.success('You have registered successfully');
      router.push(redirect || '/');
    } catch (err) {
      toast.error(err.response.data ? err.response.data.message : err.message);
    }
  };

  return (
    <Layout title='Create Account'>
      <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit(submitHandler)}>
        <h1 className='mb-4 text-xl'>Create Account</h1>
        <div className='mb-4'>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            className='w-full'
            id='name'
            autoFocus
            {...register('name', {
              required: 'Please enter name'
            })}
          />
          {errors.name && <div className='text-red-500'>{errors.name.message}</div>}
        </div>

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
            id='email'></input>
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
            autoFocus></input>
          {errors.password && <div className='text-red-500 '>{errors.password.message}</div>}
        </div>
        <div className='mb-4'>
          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input
            className='w-full'
            type='password'
            id='confirmPassword'
            {...register('confirmPassword', {
              required: 'Please enter confirm password',
              validate: value => value === getValues('password'),
              minLength: {
                value: 6,
                message: 'confirm password is more than 5 chars'
              }
            })}
          />
          {errors.confirmPassword && <div className='text-red-500 '>{errors.confirmPassword.message}</div>}
          {errors.confirmPassword && errors.confirmPassword.type === 'validate' && <div className='text-red-500 '>Password do not match</div>}
        </div>

        <div className='mb-4 '>
          <button className='primary-button'>Register</button>
        </div>
        <div className='mb-4 '>
          Already have an account? &nbsp;
          <Link href={`/login?redirect=${redirect || '/'}`}>Login</Link>
        </div>
      </form>
    </Layout>
  );
}
