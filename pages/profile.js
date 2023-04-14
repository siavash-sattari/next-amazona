import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Store } from '../utils/store';
import { getError } from '../utils/error';
import Layout from '../components/Layout';

export default function ProfileScreen() {
  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors }
  } = useForm();

  const { state, dispatch } = useContext(Store);

  const router = useRouter();
  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    setValue('name', userInfo.name);
    setValue('email', userInfo.email);
  }, [router, setValue, userInfo]);

  const submitHandler = async ({ name, email, password }) => {
    try {
      const { data } = await axios.put(
        '/api/auth/update-profile',
        {
          name,
          email,
          password
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      Cookies.set('userInfo', data);
      toast.success('Profile updated successfully');
      dispatch({ type: 'USER_LOGIN', payload: data });
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title='Profile'>
      <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit(submitHandler)}>
        <h1 className='mb-4 text-xl'>Update Profile</h1>

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
            className='w-full'
            id='email'
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email'
              }
            })}
          />
          {errors.email && <div className='text-red-500'>{errors.email.message}</div>}
        </div>

        <div className='mb-4'>
          <label htmlFor='password'>Password</label>
          <input
            className='w-full'
            type='password'
            id='password'
            {...register('password', {
              minLength: { value: 6, message: 'password is more than 5 chars' }
            })}
          />
          {errors.password && <div className='text-red-500 '>{errors.password.message}</div>}
        </div>

        <div className='mb-4'>
          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input
            className='w-full'
            type='password'
            id='confirmPassword'
            {...register('confirmPassword', {
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
        <div className='mb-4'>
          <button className='primary-button'>Update Profile</button>
        </div>
      </form>
    </Layout>
  );
}
