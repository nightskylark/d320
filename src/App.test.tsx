import { render, screen } from '@testing-library/react';

jest.mock('./pages/eotvEnemies/components/EnemyList', () => () => <div data-testid="enemy-list" />);
jest.mock('./components/layout/Header', () => () => <header />);
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
  collection: jest.fn(() => ({})),
  onSnapshot: jest.fn(() => () => {}),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn()
}));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => () => {})
}));

test('renders catalog heading', () => {
  render(<App />);
  const heading = screen.getByText(/Каталог противников/i);
  expect(heading).toBeInTheDocument();
});
