import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component will automatically scroll the window to the top on every route change.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // This command scrolls to the top-left corner of the page.
    window.scrollTo(0, 0);
  }, [pathname]); // The effect runs every time the pathname changes.

  // This component renders nothing to the screen.
  return null;
}