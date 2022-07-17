import Head from "next/head";

export default function Meta() {
  return (
    <Head>
      <title>JamOS</title>
      <meta name="description" content="JamOS in next.js" />
      <link rel="icon" href="/favicon.png" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;200;300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
}
