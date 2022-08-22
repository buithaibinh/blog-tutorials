import '@cloudscape-design/global-styles';
import '../styles.css';

import React from 'react';
if (typeof window === 'undefined') React.useLayoutEffect = () => {};

import Layout from '../components/layout';

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
