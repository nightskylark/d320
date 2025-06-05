import { useState, useEffect } from "react";
import { getDocs } from "firebase/firestore";
import { tagsCollection } from "../firebase";

const useFixedTags = () => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const qs = await getDocs(tagsCollection);
      setTags(qs.docs.map(doc => (doc.data().name as string)));
    };
    fetchTags();
  }, []);

  return tags;
};

export default useFixedTags;
