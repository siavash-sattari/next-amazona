import '../styles/globals.css';
import { StoreProvider } from '../utils/store';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <PayPalScriptProvider deferLoading={true}>
        <Component {...pageProps} />
      </PayPalScriptProvider>
    </StoreProvider>
  );
}

export default MyApp;
