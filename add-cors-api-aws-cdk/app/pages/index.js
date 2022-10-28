import Head from 'next/head';
import styles from '../styles/Home.module.css';

import { useState } from 'react';

import axios from 'axios';

const API_URL =
  'https://ljpkh34rri.execute-api.ap-southeast-1.amazonaws.com/prod';

export default function Home() {
  const [data, setData] = useState(null);

  const fetchDemoData = async (path) => {
    const result = await axios.get(`${API_URL}/${path}`);
    setData(result.data);
  };


  return (
    <div className={styles.container}>
      <Head>
        <title>Add cors API</title>
        <meta name='description' content='Add cors api with aws cdk' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Test CORS with API gateway</h1>

        <p className={styles.description}>
          Click the button to test the api. Check the console for the response.
          <br />
          <code className={styles.code}>{API_URL}</code>
          <br />
          {data && (
            <code className={styles.result}>
              {JSON.stringify(data, null, 2)}
            </code>
          )}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={styles.button}
            onClick={() => fetchDemoData('demo')}
          >
            Test Mock
          </button>
          <button className={styles.button}  onClick={() => fetchDemoData('lambda')}>
            Test Lambda API
          </button>
        </div>
      </main>
    </div>
  );
}
