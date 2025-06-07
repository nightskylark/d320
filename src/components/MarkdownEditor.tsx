import { FC, useRef } from 'react';
import MarkdownIt from 'markdown-it';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const md = new MarkdownIt('commonmark', { html: false, linkify: false, breaks: false })
  .disable(['image', 'link', 'autolink', 'html_block', 'html_inline', 'linkify', 'fence', 'code', 'backticks']);

const MarkdownEditor: FC<Props> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyWrap = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newText = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    onChange(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const lines = selected.split(/\n/).map(line => prefix + line).join('\n');
    const newText = before + lines + after;
    onChange(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + lines.length);
    });
  };

  const normalizeText = () => {
    let text = value.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/(?<! {2})\n/g, '  \n');
    onChange(text);
  };

  return (
    <div className="flex flex-col flex-1 mt-4">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2">
          <button type="button" className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded" onClick={() => applyWrap('**')}>
            <b>B</b>
          </button>
          <button type="button" className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded italic" onClick={() => applyWrap('_')}>
            I
          </button>
          <button type="button" className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded" onClick={() => applyLinePrefix('# ')}>
            H
          </button>
          <button type="button" className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded" onClick={() => applyLinePrefix('- ')}>
            •
          </button>
          <button type="button" className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded" onClick={() => applyLinePrefix('1. ')}>
            1.
          </button>
        </div>
        <button type="button" className="px-2 py-1 text-sm bg-blue-600 text-white rounded" onClick={normalizeText}>
          Normalize Text
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-neonBlue flex-1 resize-none"
      />
      <div
        className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-y-auto flex-1"
        dangerouslySetInnerHTML={{ __html: md.render(value) }}
      />
    </div>
  );
};

export default MarkdownEditor;
