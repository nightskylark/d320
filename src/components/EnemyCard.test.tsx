import { render, screen, fireEvent } from '@testing-library/react';
import EnemyCard from './EnemyCard';
import type { Enemy, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('../firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  updateDoc: jest.fn(),
  arrayUnion: jest.fn((v) => v),
  arrayRemove: jest.fn((v) => v)
}));

describe('EnemyCard', () => {
  const enemy: Enemy = {
    id: '1',
    name: 'Orc',
    customDescription: 'desc',
    tags: ['tag1', 'tag2'],
    customTags: [],
    imageURL: 'img.jpg',
    authorUid: 'user1',
    likedBy: []
  };
  const author: UserProfile = {
    displayName: 'Author',
    photoURL: 'avatar.jpg'
  };

  it('renders enemy name and tags and handles click', () => {
    const onClick = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ uid: 'user1' });
    render(<EnemyCard index={0} enemy={enemy} author={author} onClick={onClick} />);

    expect(screen.getByText('Orc')).toBeInTheDocument();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();

    expect(screen.getByTitle('Сохранить')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Сохранить'));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Orc'));
    expect(onClick).toHaveBeenCalledWith(0);
  });
});
