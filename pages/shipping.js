import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Store } from '../utils/Store';

export default function Shipping() {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
  }, []);

  return <h1>Shipping page</h1>;
}
