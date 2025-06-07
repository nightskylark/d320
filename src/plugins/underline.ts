import { commandsCtx } from '@milkdown/core';
import { markRule } from '@milkdown/prose';
import { toggleMark } from '@milkdown/prose/commands';
import {
  $command,
  $inputRule,
  $markAttr,
  $markSchema,
  $useKeymap,
} from '@milkdown/utils';

const underlineAttr = $markAttr('underline');

export const underlineSchema = $markSchema('underline', (ctx) => ({
  parseDOM: [
    { tag: 'u' },
    { style: 'text-decoration', getAttrs: (v) => (v === 'underline') as false },
  ],
  toDOM: (mark) => ['u', ctx.get(underlineAttr.key)(mark)],
  parseMarkdown: {
    match: (node) => node.type === 'ins',
    runner: (state, node, markType) => {
      state.openMark(markType);
      state.next(node.children);
      state.closeMark(markType);
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'underline',
    runner: (state, mark) => {
      state.withMark(mark, 'ins');
    },
  },
}));

export const toggleUnderlineCommand = $command('ToggleUnderline', (ctx) => () => {
  return toggleMark(underlineSchema.type(ctx));
});

export const underlineInputRule = $inputRule((ctx) =>
  markRule(/\+\+([^+]+)\+\+$/, underlineSchema.type(ctx))
);

export const underlineKeymap = $useKeymap('underlineKeymap', {
  ToggleUnderline: {
    shortcuts: 'Mod-u',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx);
      return () => commands.call(toggleUnderlineCommand.key);
    },
  },
});

