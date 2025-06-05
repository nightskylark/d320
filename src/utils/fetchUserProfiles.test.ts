import { fetchUserProfiles } from './fetchUserProfiles';
import { getDoc, doc } from 'firebase/firestore';

jest.mock('../firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(() => 'doc-ref')
}));

describe('fetchUserProfiles', () => {
  it('fetches profiles for each uid', async () => {
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayName: 'User1', photoURL: 'url1' })
    });
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayName: 'User2', photoURL: 'url2' })
    });

    const profiles = await fetchUserProfiles(['uid1', 'uid2']);

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'uid1');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'uid2');
    expect(profiles).toEqual({
      uid1: { displayName: 'User1', photoURL: 'url1' },
      uid2: { displayName: 'User2', photoURL: 'url2' }
    });
  });
});
