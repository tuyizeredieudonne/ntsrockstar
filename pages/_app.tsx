import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/theme';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="NTS Rockstar Party - The Ultimate Music Experience at Nyanza TSS" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/images/rocklogo.png" />
        <link rel="apple-touch-icon" href="/images/rocklogo.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="NTS Rockstar Party" />
        <meta property="og:description" content="The Ultimate Music Experience at Nyanza TSS" />
        <meta property="og:image" content="/images/rocklogo.png" />
        <meta property="og:url" content="https://ntsrockstar.com" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NTS Rockstar Party" />
        <meta name="twitter:description" content="The Ultimate Music Experience at Nyanza TSS" />
        <meta name="twitter:image" content="/images/rocklogo.png" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </>
  );
} 