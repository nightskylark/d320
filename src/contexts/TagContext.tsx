import { createContext, useContext, useEffect, useState } from 'react';
import { getDocs } from 'firebase/firestore';
import { tagsCollection } from '../firebase';

const TagContext = createContext<string[]>([]);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const qs = await getDocs(tagsCollection);
      setTags(qs.docs.map(doc => (doc.data() as { name: string }).name));
    };
    fetchTags();
  }, []);

  return <TagContext.Provider value={tags}>{children}</TagContext.Provider>;
};

export const useFixedTags = () => useContext(TagContext);
