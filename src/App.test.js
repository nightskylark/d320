import { render, screen } from '@testing-library/react';
import App from './App';

test('renders catalog heading', () => {
  render(<App />);
  const heading = screen.getByText(/Каталог противников/i);
  expect(heading).toBeInTheDocument();
});
