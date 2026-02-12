import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  tags?: string[];
  eventCount?: number;
  recentEvent?: boolean;
  lastContactedDate?: Date;
  addedDate: Date;
}

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGuests = useCallback(async () => {
    setLoading(true);
    try {
      // Supabase removed: guest list is in-memory for now
      setGuests([]);
    } catch (err) {
      console.error('Error loading guests:', err);
      toast.error('Failed to load contact database');
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  // Add a new contact (in-memory)
  const addGuest = async (
    guestData: Omit<
      Guest,
      'id' | 'addedDate' | 'recentEvent' | 'eventCount' | 'lastContactedDate'
    >,
  ) => {
    const tempGuest: Guest = {
      id: `temp-${Date.now()}`,
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone ?? undefined,
      company: guestData.company ?? undefined,
      jobTitle: guestData.jobTitle ?? undefined,
      tags: guestData.tags ?? [],
      eventCount: undefined,
      recentEvent: false,
      lastContactedDate: undefined,
      addedDate: new Date(),
    };

    setGuests((prev) =>
      [tempGuest, ...prev].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return tempGuest;
  };

  // Update contact (in-memory)
  const updateGuest = async (guestId: string, updates: Partial<Guest>) => {
    setGuests((prev) =>
      prev
        .map((g) => (g.id === guestId ? { ...g, ...updates } : g))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
  };

  // Remove contact (in-memory)
  const removeGuest = async (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  // CSV Import (in-memory)
  const importGuests = async (csvFile: File) => {
    return new Promise<{ total: number; successful: number; failed: number; duplicates: number }>(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const csv = (e.target?.result as string) || '';
            const lines = csv.split('\n').map((l) => l.replace(/\r$/, ''));
            if (lines.length <= 1) {
              return resolve({ total: 0, successful: 0, failed: 0, duplicates: 0 });
            }
            const headers = lines[0].split(',').map((h) => h.trim());

            if (!headers.includes('Name') || !headers.includes('Email')) {
              reject(new Error("CSV file must include 'Name' and 'Email' columns"));
              return;
            }

            const nameIndex = headers.indexOf('Name');
            const emailIndex = headers.indexOf('Email');
            const phoneIndex = headers.indexOf('Phone');
            const companyIndex = headers.indexOf('Company');
            const jobTitleIndex =
              headers.indexOf('JobTitle') >= 0
                ? headers.indexOf('JobTitle')
                : headers.indexOf('Job Title');
            const tagsIndex = headers.indexOf('Tags');

            const rawRows: Array<{
              name: string;
              email: string;
              phone?: string;
              company?: string;
              job_title?: string;
              tags?: string[];
            }> = [];

            for (let i = 1; i < lines.length; i++) {
              const row = lines[i];
              if (!row || !row.trim()) continue;
              const values = row.split(',').map((v) => v.trim());
              const name = values[nameIndex]?.replace(/^"|"$/g, '');
              const email = values[emailIndex]?.replace(/^"|"$/g, '').toLowerCase();
              if (!name || !email) continue;
              rawRows.push({
                name,
                email,
                phone: phoneIndex >= 0 ? values[phoneIndex]?.replace(/^"|"$/g, '') : '',
                company: companyIndex >= 0 ? values[companyIndex]?.replace(/^"|"$/g, '') : '',
                job_title: jobTitleIndex >= 0 ? values[jobTitleIndex]?.replace(/^"|"$/g, '') : '',
                tags:
                  tagsIndex >= 0 && values[tagsIndex]
                    ? values[tagsIndex]
                        .replace(/^"|"$/g, '')
                        .split(';')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : [],
              });
            }

            const total = rawRows.length;
            const existingEmails = new Set(guests.map((g) => g.email.toLowerCase()));
            const seenInFile = new Set<string>();

            const newRows: Guest[] = [];
            let duplicates = 0;

            for (const r of rawRows) {
              const emailLower = r.email.toLowerCase();
              if (existingEmails.has(emailLower) || seenInFile.has(emailLower)) {
                duplicates++;
                continue;
              }
              seenInFile.add(emailLower);

              newRows.push({
                id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                name: r.name,
                email: emailLower,
                phone: r.phone || undefined,
                company: r.company || undefined,
                jobTitle: r.job_title || undefined,
                tags: r.tags || [],
                eventCount: undefined,
                recentEvent: false,
                lastContactedDate: undefined,
                addedDate: new Date(),
              });
            }

            if (newRows.length > 0) {
              setGuests((prev) =>
                [...newRows, ...prev].sort((a, b) => a.name.localeCompare(b.name)),
              );
            }

            resolve({
              total,
              successful: newRows.length,
              failed: 0,
              duplicates,
            });
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(csvFile);
      },
    );
  };

  const exportGuests = async () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...guests.map((guest) =>
        [
          `"${guest.name}"`,
          `"${guest.email}"`,
          `"${guest.phone || ''}"`,
          `"${guest.company || ''}"`,
          `"${guest.jobTitle || ''}"`,
          `"${guest.tags?.join(';') || ''}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `guest-contacts-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    guests,
    loading,
    addGuest,
    updateGuest,
    removeGuest,
    importGuests,
    exportGuests,
    reload: loadGuests,
  };
};
