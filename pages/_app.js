// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Základní Bootstrap
import '../styles/theme.css';                // Naše vlastní úpravy
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
// Pokud stránka definuje vlastní název, předáme ho layoutu
  const title = Component.pageTitle || "NicePDF";

  return (
    <Layout pageTitle={title}>
      <Component {...pageProps} />
    </Layout>
    );
}

export default MyApp;