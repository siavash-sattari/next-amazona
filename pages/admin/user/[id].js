import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { Store } from '../../../utils/store';
import { getError } from '../../../utils/error';
import Layout from '../../../components/Layout';
import Cookies from 'js-cookie';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    default:
      return state;
  }
}

function UserEdit() {
  const { query } = useRouter();
  const userId = query.id;

  const { state, dispatch: dispatchLogin } = useContext(Store);
  const { userInfo } = state;

  const router = useRouter();

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: ''
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: 'FETCH_REQUEST' });
          const { data } = await axios.get(`/api/admin/users/${userId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` }
          });
          setValue('name', data.name);
          setValue('email', data.email);
          dispatch({ type: 'FETCH_SUCCESS' });
        } catch (err) {
          dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
        }
      };
      fetchData();
    }
  }, [router, setValue, userId, userInfo]);

  const submitHandler = async ({ name, email, password }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          email,
          password
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      // update name in navbar
      // update name & email in user profile page:
      if (userInfo.isAdmin && userId == '633cb227bd8ec38c9ba8fc82') {
        Cookies.set('userInfo', data);
        dispatchLogin({ type: 'USER_LOGIN', payload: data });
      }

      dispatch({ type: 'UPDATE_SUCCESS' });
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit User ${userId}`}>
      <div className='grid md:grid-cols-4 md:gap-5'>
        <div>
          <ul>
            <li>
              <Link href='/admin/dashboard'>Dashboard</Link>
            </li>
            <li>
              <Link href='/admin/orders'>Orders</Link>
            </li>
            <li>
              <Link href='/admin/products'>
                <a className='font-bold'>Products</a>
              </Link>
            </li>
            <li>
              <Link href='/admin/users'>Users</Link>
            </li>
          </ul>
        </div>
        <div className='md:col-span-3'>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <form className='mx-auto max-w-screen-md' onSubmit={handleSubmit(submitHandler)}>
              <h1 className='mb-4 text-xl'>{`Edit User ${userId}`}</h1>
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
                  // make auto-complete off
                  autoComplete='new-password'
                  {...register('password', {
                    minLength: { value: 6, message: 'password is more than 5 chars' }
                  })}
                />
                {errors.password && <div className='text-red-500 '>{errors.password.message}</div>}
              </div>
              <div className='mb-4'>
                <button disabled={loadingUpdate} className='primary-button'>
                  {loadingUpdate ? 'Loading' : 'Update'}
                </button>
              </div>
              <div className='mb-4'>
                <Link href={`/admin/users`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserEdit;
