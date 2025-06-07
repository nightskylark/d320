import { FC } from 'react';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const MarkdownEditor: FC<Props> = ({ value, onChange }) => {
  useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, value);
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            onChange(markdown);
          });
        })
        .use(commonmark)
        .use(history)
        .use(listener)
        .config(nord),
    []
  );

  const normalizeText = () => {
    let text = value.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/(?<! {2})\n/g, '  \n');
    onChange(text);
  };

  return (
    <MilkdownProvider>
      <div className="flex flex-col flex-1 mt-4">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
            onClick={normalizeText}
          >
            Normalize Text
          </button>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2">
          <Milkdown />
        </div>
      </div>
    </MilkdownProvider>
  );
};

export default MarkdownEditor;
