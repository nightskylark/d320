import { render, screen, fireEvent } from '@testing-library/react';
import EnemyCard from './EnemyCard';
import type { Enemy, UserProfile } from '../types';

describe('EnemyCard', () => {
  const enemy: Enemy = {
    id: '1',
    name: 'Orc',
    customDescription: 'desc',
    tags: ['tag1', 'tag2'],
    customTags: [],
    imageURL: 'img.jpg',
    authorUid: 'user1'
  };
  const author: UserProfile = {
    displayName: 'Author',
    photoURL: 'avatar.jpg'
  };

  it('renders enemy name and tags and handles click', () => {
    const onClick = jest.fn();
    render(<EnemyCard index={0} enemy={enemy} author={author} onClick={onClick} />);

    expect(screen.getByText('Orc')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Orc'));
    expect(onClick).toHaveBeenCalledWith(0);
  });
});
