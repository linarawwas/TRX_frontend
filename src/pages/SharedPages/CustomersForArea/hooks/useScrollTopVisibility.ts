import { useEffect, useState } from "react";

const SCROLL_THRESHOLD_PX = 300;

export function useScrollTopVisibility(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () =>
      setVisible((window.scrollY || 0) > SCROLL_THRESHOLD_PX);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return visible;
}
