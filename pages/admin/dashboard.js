import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Store } from '../../utils/Store';
import { getError } from '../../utils/error';
import Layout from '../../components/Layout';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    }
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

function AdminDashboard() {
  const { state } = useContext(Store);
  const router = useRouter();
  const { userInfo } = state;

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: ''
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/summary`, {
          headers: { authorization: `Bearer ${userInfo.token}` }
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [router, userInfo]);

  const data = {
    labels: summary.salesData.map(x => x._id), // 2022/01 2022/03
    datasets: [
      {
        label: 'Sales',
        backgroundColor: 'rgba(162, 222, 208, 1)',
        data: summary.salesData.map(x => x.totalSales)
      }
    ]
  };

  return (
    <Layout title='Admin Dashboard'>
      <div className='grid  md:grid-cols-4 md:gap-5'>
        <div>
          <ul>
            <li>
              <Link href='/admin/dashboard'>
                <a className='font-bold'>Dashboard</a>
              </Link>
            </li>
            <li>
              <Link href='/admin/orders'>Orders</Link>
            </li>
            <li>
              <Link href='/admin/products'>Products</Link>
            </li>
            <li>
              <Link href='/admin/users'>Users</Link>
            </li>
          </ul>
        </div>
        <div className='md:col-span-3'>
          <h1 className='mb-4 text-xl'>Admin Dashboard</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='alert-error'>{error}</div>
          ) : (
            <div>
              <div className='grid grid-cols-1 md:grid-cols-4'>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>${summary.ordersPrice} </p>
                  <p>Sales</p>
                  <Link href='/admin/orders'>View sales</Link>
                </div>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.ordersCount} </p>
                  <p>Orders</p>
                  <Link href='/admin/orders'>View orders</Link>
                </div>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.productsCount} </p>
                  <p>Products</p>
                  <Link href='/admin/products'>View products</Link>
                </div>
                <div className='card m-5 p-5'>
                  <p className='text-3xl'>{summary.usersCount} </p>
                  <p>Users</p>
                  <Link href='/admin/users'>View users</Link>
                </div>
              </div>
              <h2 className='text-xl'>Sales Report</h2>
              <Bar
                options={{
                  legend: { display: true, position: 'right' }
                }}
                data={data}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
