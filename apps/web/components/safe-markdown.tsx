import React, { type ReactNode } from 'react';

function inline(value: string) {
  return value.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code
          key={index}
          className="rounded bg-ink/10 px-1 py-0.5 text-[.92em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

export function SafeMarkdown({ children }: { children: string }) {
  const output: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    output.push(
      <ul
        key={`list-${output.length}`}
        className="my-2 list-disc space-y-1 pl-5"
      >
        {list.map((item, index) => (
          <li key={`${item}-${index}`}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  children.split('\n').forEach((line) => {
    const listItem = line.match(/^[-*]\s+(.+)/)?.[1];
    if (listItem) {
      list.push(listItem);
      return;
    }
    flushList();
    if (!line.trim()) return;
    output.push(
      <p
        key={`paragraph-${output.length}`}
        className="my-1 first:mt-0 last:mb-0"
      >
        {inline(line)}
      </p>,
    );
  });
  flushList();

  return <div>{output}</div>;
}
