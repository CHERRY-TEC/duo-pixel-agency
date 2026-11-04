import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Book from './pages/Book';
import Confirmation from './pages/Confirmation';
import Contact from './pages/Contact';
import DesignerProfile from './pages/DesignerProfile';
import Designers from './pages/Designers';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';

/**
 * Public website — marketing, portfolio, pricing, contact and the booking flow.
 * Everything behind a login (tracking, client area, designer dashboard) lives
 * in the separate portal app, linked to with `portalUrl()` from `@/lib/links`.
 */
export default function App() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            <AnimatePresence mode="wait">
              <Home />
            </AnimatePresence>
          }
        />
        <Route path="/designers" element={<Designers />} />
        <Route path="/designer/:slug" element={<DesignerProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book" element={<Book />} />
        <Route
          path="/confirmation/:code"
          element={
            <AnimatePresence mode="wait">
              <Confirmation />
            </AnimatePresence>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
