import React from 'react'
import Head from 'next/head'
import '@/styles/globals.css'
import '@/styles/card.css'

export default function App({ Component, pageProps }) {
  return (
      <>
          <Head>
              <title>Palace</title>
          </Head>
          <Component {...pageProps} />
      </>
  )
}
