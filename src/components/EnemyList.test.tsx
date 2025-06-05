import { render, screen, fireEvent } from '@testing-library/react';
import EnemyList from './EnemyList';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('./AddEnemy', () => () => <div data-testid="add-enemy" />);
import type { Enemy } from '../types';

jest.mock('./EnemyCard', () => ({ index, enemy, onClick }: { index: number; enemy: Enemy; onClick: (idx: number) => void }) => (
  <div data-testid={`card-${index}`} onClick={() => onClick(index)}>{enemy.name}</div>
));

describe('EnemyList', () => {
  it('shows AddEnemy when user logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({ uid: '1' });
    render(<EnemyList enemies={[]} users={{}} onSelect={jest.fn()} />);
    expect(screen.getByTestId('add-enemy')).toBeInTheDocument();
  });

  it('hides AddEnemy when user not logged in', () => {
    (useAuth as jest.Mock).mockReturnValue(null);
    render(<EnemyList enemies={[]} users={{}} onSelect={jest.fn()} />);
    expect(screen.queryByTestId('add-enemy')).toBeNull();
  });

  it('renders enemy cards and handles selection', () => {
    (useAuth as jest.Mock).mockReturnValue(null);
    const enemies = [{
      id: '1',
      name: 'E1',
      customDescription: '',
      tags: [],
      customTags: [],
      imageURL: 'img',
      authorUid: 'u1'
    }];
    const onSelect = jest.fn();
    render(<EnemyList enemies={enemies} users={{}} onSelect={onSelect} />);
    const card = screen.getByTestId('card-0');
    expect(card).toHaveTextContent('E1');
    fireEvent.click(card);
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
