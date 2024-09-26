import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OffPageActivityEvent } from '@recogito/annotorious-supabase';
import type { PresentUser } from '@annotorious/react';

// Active user IDs per source
export type ActiveUsers = { [source: string]: PresentUser[] };

export const useOffPagePresence = (present: PresentUser[]) => {

  // Track active user IDs per source
  const [active, setActivity] = useState<{ [source: string]: string[] }>({});

  // Update activity map for every off-page activity event
  const onOffPageActivity = useCallback((event: OffPageActivityEvent) => {
    setActivity(active => {
      const { source, user } = event;

      const entries = Object.entries(active);

      const updated = 
        entries.some(([s, _]) => s === source) 
          // This source already has activity
          ? entries.map(([s, users]) => {
              if (s === source) {
                // Add user to this source
                return [s, [...new Set([...users, user.id])]];
              } else {
                // Remove user from all other sources
                return [s, users.filter(id => id !== user.id)];
              }
            })
          // First activity on this source
          : [...entries, [source, [user.id]]];
          
      // Remove sources that no longer have activity
      const next = Object.fromEntries(updated.filter(([_, users]) => users.length > 0));
  
      // Simple comparison by value, so we don't cause unnecessary re-renders.
      return (JSON.stringify(active) === JSON.stringify(next)) ? active : next;
    });
  }, []);

  // Sync activity map with present users
  useEffect(() => {
    setActivity(active => {
      const synced = Object.entries(active).map(([source, ids]) => (
        [source, ids.filter(id => present.some(p => p.id === id))]
      )).filter(([_, ids]) => ids.length > 0) as [string, string[]][];

      const next = Object.fromEntries(synced);

      return (JSON.stringify(active) === JSON.stringify(next)) 
        ? active : next;
    });
  }, [present]);

  // Map user IDs to present users
  const activeUsers = useMemo(() => {
    // Resolve user IDs to PresentUsers
    return Object.fromEntries(
      Object.entries(active).map(([source, ids]) => ([
        source,
        ids.map(id => present.find(p => p.id === id)!).filter(Boolean)
      ])).filter(([_, users]) => users.length > 0)
    ) as ActiveUsers;
  }, [active, present]);

  return {
    activeUsers,
    onOffPageActivity
  }

}