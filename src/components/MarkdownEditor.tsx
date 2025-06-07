import { FC } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { renderMarkdown } from '../utils/markdown';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const MarkdownEditor: FC<Props> = ({ value, onChange }) => {
  const normalizeText = () => {
    let text = value.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/(?<! {2})\n/g, '  \n');
    onChange(text);
  };

  return (
    <div className="flex flex-col flex-1 mt-4" data-color-mode="light">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
          onClick={normalizeText}
        >
          Normalize Text
        </button>
      </div>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v || '')}
        preview="edit"
        commands={[
          commands.bold,
          commands.italic,
          commands.title,
          commands.unorderedListCommand,
          commands.orderedListCommand,
        ]}
        extraCommands={[]}
        height={200}
        className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md"
      />
      <div
        className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm overflow-y-auto flex-1 prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
      />
    </div>
  );
};

export default MarkdownEditor;
