import MarkdownIt from 'markdown-it';

const md = new MarkdownIt('commonmark', {
  html: false,
  linkify: false,
  breaks: false,
})
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

md.renderer.rules.paragraph_open = (tokens, idx) =>
  tokens[idx].hidden ? '' : '<p class="text-sm mt-2">';
md.renderer.rules.paragraph_close = (tokens, idx) =>
  tokens[idx].hidden ? '' : '</p>';
md.renderer.rules.strong_open = () => '<strong class="font-bold">';
md.renderer.rules.strong_close = () => '</strong>';
md.renderer.rules.em_open = () => '<em class="italic">';
md.renderer.rules.em_close = () => '</em>';
md.renderer.rules.bullet_list_open = () => '<ul class="list-disc mt-2">';
md.renderer.rules.bullet_list_close = () => '</ul>';
md.renderer.rules.ordered_list_open = () => '<ol class="list-decimal mt-2">';
md.renderer.rules.ordered_list_close = () => '</ol>';
md.renderer.rules.list_item_open = () => '<li class="ml-4 pt-0">';
md.renderer.rules.list_item_close = () => '</li>';
md.renderer.rules.heading_open = (tokens: unknown, idx: number) => {
  const t = tokens as Record<number, { tag: string }>;
  const level = t[idx].tag.slice(1);
  const sizes: Record<string, string> = {
    '1': 'text-2xl',
    '2': 'text-xl',
    '3': 'text-lg',
    '4': 'text-base',
    '5': 'text-sm',
    '6': 'text-xs',
  };
  const size = sizes[level] || 'text-base';
  return `<h${level} class="font-bold mt-2 ${size}">`;
};
md.renderer.rules.heading_close = (tokens: unknown, idx: number) =>
  `</${(tokens as Record<number, { tag: string }>)[idx].tag}>`;

export const cleanMarkdown =  (text: string): string => {
  return text
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/?p>/gi, '\n');
};

export const renderMarkdown = (text: string): string => {
  const cleaned = cleanMarkdown(text);
  return md.render(cleaned);
};

