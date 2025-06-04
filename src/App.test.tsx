import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/EnemyList', () => () => <div data-testid="enemy-list" />);
jest.mock('./components/Header', () => () => <header />);
jest.mock('./firebase', () => ({
  enemiesCollection: {},
  auth: {},
  db: {}
}));
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
