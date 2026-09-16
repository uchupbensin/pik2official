'use client';

import { useEffect } from 'react';

export default function DevToolsSponsor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(
        "%cJasa Pembuatan Website",
        "font-size: 14px; font-weight: bold; color: #111;"
      );
      console.log(
        "Hubungi:\n- Mas Yogi"
      );
    }
  }, []);

  return null;
}
