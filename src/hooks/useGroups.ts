import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { groups as initialGroups } from '../data';

export type GroupStatus = 'OPEN' | 'CLOSED';

export interface GroupData {
  id: string;
  status: GroupStatus;
  joinLink: string;
}

export function useGroups() {
  const [groups, setGroups] = useState<Record<string, GroupData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'groups'), (snapshot) => {
      const data: Record<string, GroupData> = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data() as GroupData;
      });

      // Initialize missing groups from static data
      const toInitialize: Promise<void>[] = [];
      Object.keys(initialGroups).forEach((key) => {
        if (!data[key]) {
          const groupRef = doc(db, 'groups', key);
          const initialData: GroupData = {
            id: key,
            status: initialGroups[key as keyof typeof initialGroups].status as GroupStatus,
            joinLink: initialGroups[key as keyof typeof initialGroups].joinLink,
          };
          data[key] = initialData;
          toInitialize.push(setDoc(groupRef, initialData));
        }
      });

      setGroups(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateGroup = async (id: string, updates: Partial<GroupData>) => {
    const groupRef = doc(db, 'groups', id);
    await updateDoc(groupRef, updates);
  };

  return { groups, loading, updateGroup };
}
