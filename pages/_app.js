import Script from 'next/script'
// import gapiLoaded from '../utils/gapiLoaded'

export default function MyApp({ Component, pageProps }) {
    return (
        <>
            <Script async defer beforeInteractive src="https://apis.google.com/js/api.js" />
            <Script async defer beforeInteractive src="https://accounts.google.com/gsi/client" onError={() => console.log("error1")} />
            <Component {...pageProps} />
        </>
    )
}
