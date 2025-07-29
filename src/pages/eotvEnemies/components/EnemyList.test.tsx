import { render, screen, fireEvent } from '@testing-library/react';
import EnemyList from './EnemyList';

jest.mock('./AddEnemy', () => () => <div data-testid="add-enemy" />);
import type { Enemy } from '../types';

jest.mock('./EnemyCard', () => ({ index, enemy, onClick }: { index: number; enemy: Enemy; onClick: (idx: number) => void }) => (
  <div data-testid={`card-${index}`} onClick={() => onClick(index)}>{enemy.name}</div>
));

describe('EnemyList', () => {
  it('renders AddEnemy', () => {
    render(<EnemyList enemies={[]} users={{}} onSelect={jest.fn()} />);
    expect(screen.getByTestId('add-enemy')).toBeInTheDocument();
  });

  it('renders enemy cards and handles selection', () => {
    const enemies = [{
      id: '1',
      name: 'E1',
      customDescription: '',
      tags: [],
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
