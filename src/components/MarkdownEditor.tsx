import { FC } from 'react';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx, commandsCtx } from '@milkdown/core';
import {
  commonmark,
  toggleStrongCommand,
  toggleEmphasisCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
} from '@milkdown/preset-commonmark';
import {
  strikethroughSchema,
  toggleStrikethroughCommand,
  strikethroughInputRule,
  strikethroughKeymap,
} from '@milkdown/preset-gfm';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { nord } from '@milkdown/theme-nord';
import { underlineSchema, toggleUnderlineCommand, underlineInputRule, underlineKeymap } from '../plugins/underline';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  NumberedListIcon,
} from '@heroicons/react/20/solid';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const EditorInner: FC<Props> = ({ value, onChange }) => {
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
        .use(strikethroughSchema)
        .use(strikethroughInputRule)
        .use(strikethroughKeymap)
        .use(underlineSchema)
        .use(underlineInputRule)
        .use(underlineKeymap)
        .use(history)
        .use(listener)
        .config(nord),
    []
  );

  const [, getEditor] = useInstance();

  const exec = (cmd: { key: unknown }) => {
    const editor = getEditor();
    if (!editor) return;
    editor.action((ctx) => {
      const commands = ctx.get(commandsCtx);
      commands.call(cmd.key);
    });
  };

  return (
    <div className="flex flex-col flex-1 mt-4">
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => exec(toggleStrongCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <BoldIcon className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => exec(toggleEmphasisCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <ItalicIcon className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => exec(toggleUnderlineCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <UnderlineIcon className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => exec(toggleStrikethroughCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <StrikethroughIcon className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => exec(wrapInOrderedListCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <NumberedListIcon className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => exec(wrapInBulletListCommand)} className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <ListBulletIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-2">
        <Milkdown />
      </div>
    </div>
  );
};

const MarkdownEditor: FC<Props> = ({ value, onChange }) => (
  <MilkdownProvider>
    <EditorInner value={value} onChange={onChange} />
  </MilkdownProvider>
);

export default MarkdownEditor;
