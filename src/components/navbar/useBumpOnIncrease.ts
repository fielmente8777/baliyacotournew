"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Watches a count (unread notifications, items in the cart) and reports when
 * it goes up, so the navbar icon can play its one-off animation. The first
 * loaded value is only the starting point — arriving on a page with three
 * unread doesn't count as "something new happened".
 *
 * `key` changes on each increase: put it on the animated element so the
 * animation restarts even if the previous one hasn't finished.
 */
export function useBumpOnIncrease(count: number, ready: boolean) {
  const last = useRef<number | null>(null);
  const [key, setKey] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ready) {
      last.current = null;
      return;
    }
    if (last.current !== null && count > last.current) {
      setKey((k) => k + 1);
      setActive(true);
    }
    last.current = count;
  }, [count, ready]);

  return { key, active, done: () => setActive(false) };
}
