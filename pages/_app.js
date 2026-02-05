// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Základní Bootstrap
import '../styles/theme.css';                // Naše vlastní úpravy

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;