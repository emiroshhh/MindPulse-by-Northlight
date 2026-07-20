'use client';

import { useLayoutEffect } from 'react';

export function useLocalizedMetadata(title: string, description: string) {
  useLayoutEffect(() => {
    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      if (document.title !== title) document.title = title;
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (meta && meta.content !== description) meta.content = description;
      applying = false;
    };

    apply();
    const frame = window.requestAnimationFrame?.(apply);
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['content'],
    });
    return () => {
      observer.disconnect();
      if (frame !== undefined) window.cancelAnimationFrame?.(frame);
    };
  }, [description, title]);
}
