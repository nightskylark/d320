import { render, screen } from '@testing-library/react';

jest.mock('./components/EnemyList', () => () => <div data-testid="enemy-list" />);
jest.mock('./components/Header', () => () => <header />);
jest.mock('./firebase', () => ({
  enemiesCollection: {},
  auth: {},
  db: {}
}));
jest.mock('@milkdown/react', () => ({
  Milkdown: () => <div />,
  MilkdownProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useEditor: () => ({}),
}));
jest.mock('@milkdown/preset-commonmark', () => ({ commonmark: {} }));
jest.mock('@milkdown/plugin-history', () => ({ history: {} }));
jest.mock('@milkdown/plugin-listener', () => ({ listener: {}, listenerCtx: { markdownUpdated: () => ({}) } }));
jest.mock('@milkdown/core', () => ({ Editor: { make: () => ({ config: () => ({ use: () => ({ config: () => ({}) }) }) }) }, rootCtx: {}, defaultValueCtx: {} }));
jest.mock('@milkdown/theme-nord', () => ({ nord: {} }));

import App from './App';
jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(() => () => {})
}));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {})
}));

test('renders catalog heading', () => {
  render(<App />);
  const heading = screen.getByText(/Каталог противников/i);
  expect(heading).toBeInTheDocument();
});
