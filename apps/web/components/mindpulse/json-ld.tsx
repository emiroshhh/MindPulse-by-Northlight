import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Renders a JSON-LD script tag safely for structured data.
 * The output is hardened by escaping `<` characters to prevent
 * premature termination of the script tag (e.g. from user input
 * containing `</script>`).
 */
export function JsonLd({ data }: JsonLdProps) {
  const safeHtml = JSON.stringify(data).replace(/</g, '\\u003c');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
