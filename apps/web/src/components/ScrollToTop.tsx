import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * ScrollToTop component
 * Scrolls the main content area to top when the route changes.
 * Supports both window scrolling and custom scroll containers.
 */
export function ScrollToTop({
  containerSelector,
  behavior = "smooth",
}: {
  /** CSS selector for the scroll container. If not provided, uses window. */
  containerSelector?: string;
  /** Scroll behavior: 'auto' | 'smooth' */
  behavior?: ScrollBehavior;
} = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollTarget = containerSelector
      ? document.querySelector(containerSelector)
      : window;

    if (scrollTarget) {
      if (scrollTarget === window) {
        window.scrollTo({ top: 0, behavior });
      } else {
        (scrollTarget as HTMLElement).scrollTo({ top: 0, behavior });
      }
    }
  }, [pathname, containerSelector, behavior]);

  return null;
}