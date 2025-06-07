import MarkdownIt from 'markdown-it';
import ins from 'markdown-it-ins';

const md = new MarkdownIt('commonmark', {
  html: false,
  linkify: false,
  breaks: false,
})
  .use(ins)
  .enable('strikethrough')
  .disable([
    'image',
    'link',
    'linkify',
    'html_block',
    'html_inline',
    'fence',
    'code',
    'blockquote',
    'table',
    'hr',
  ]);

md.renderer.rules.paragraph_open = () => '<p class="text-sm mt-2">';
md.renderer.rules.paragraph_close = () => '</p>';
md.renderer.rules.strong_open = () => '<strong class="font-bold">';
md.renderer.rules.strong_close = () => '</strong>';
md.renderer.rules.em_open = () => '<em class="italic">';
md.renderer.rules.em_close = () => '</em>';
md.renderer.rules.del_open = () => '<del class="line-through">';
md.renderer.rules.del_close = () => '</del>';
md.renderer.rules.ins_open = () => '<span class="underline">';
md.renderer.rules.ins_close = () => '</span>';
md.renderer.rules.bullet_list_open = () => '<ul class="list-disc list-inside mt-2">';
md.renderer.rules.bullet_list_close = () => '</ul>';
md.renderer.rules.ordered_list_open = () => '<ol class="list-decimal list-inside mt-2">';
md.renderer.rules.ordered_list_close = () => '</ol>';
md.renderer.rules.list_item_open = () => '<li class="ml-4">';
md.renderer.rules.list_item_close = () => '</li>';
md.renderer.rules.heading_open = (tokens, idx) => {
  const level = tokens[idx].tag.slice(1);
  const size = {
    '1': 'text-2xl',
    '2': 'text-xl',
    '3': 'text-lg',
    '4': 'text-base',
    '5': 'text-sm',
    '6': 'text-xs',
  }[level] || 'text-base';
  return `<h${level} class="font-bold mt-2 ${size}">`;
};
md.renderer.rules.heading_close = (tokens, idx) => `</${tokens[idx].tag}>`;

export const renderMarkdown = (text: string): string => md.render(text);
