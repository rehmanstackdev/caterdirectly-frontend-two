import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import AddGuestService from '@/services/api/host/guest/addguest.service';
import { useAuth } from '@/contexts/auth';

const GUESTS_UPDATED_EVENT = 'guests:updated';

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

interface AddGuestInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  eventId?: string;
  ticketId?: string;
}

interface UpdateGuestInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  eventId?: string;
  ticketId?: string;
}

const mapApiGuestToGuest = (raw: any): Guest => ({
  id: raw?.id || `api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: raw?.name || '',
  email: raw?.email || '',
  phone: raw?.phone || raw?.phoneNumber || raw?.phone_number || undefined,
  company: raw?.companyName || raw?.company || undefined,
  jobTitle: raw?.jobTitle || undefined,
  tags: Array.isArray(raw?.tags) ? raw.tags : [],
  eventCount:
    typeof raw?.eventCount === 'number'
      ? raw.eventCount
      : Array.isArray(raw?.events)
        ? raw.events.length
        : 0,
  recentEvent: Boolean(raw?.recentEvent),
  lastContactedDate: raw?.lastContactedDate ? new Date(raw.lastContactedDate) : undefined,
  addedDate: raw?.createdAt ? new Date(raw.createdAt) : new Date(),
});

export const useGuests = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSearch, setLastSearch] = useState<string | undefined>(undefined);
  const [lastRecentGuest, setLastRecentGuest] = useState<boolean | undefined>(undefined);

  const loadGuests = useCallback(async (search?: string, recentGuest?: boolean) => {
    setLoading(true);
    try {
      setLastSearch(search);
      setLastRecentGuest(recentGuest);

      if (!user?.id) {
        setGuests([]);
        return;
      }

      const result = await AddGuestService.getHostGuests(search, recentGuest);
      const guestRows = Array.isArray(result?.data?.data)
        ? result.data.data
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

      const mapped = guestRows
        .map(mapApiGuestToGuest)
        .filter((g) => g.name && g.email)
        .sort((a, b) => a.name.localeCompare(b.name));

      setGuests(mapped);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      // Backend may return 404 when the host has no guest records yet.
      if (status === 404 && message === 'Host guest not found') {
        setGuests([]);
      } else {
        console.error('Error loading guests:', err);
        toast.error(message || 'Failed to load contact database');
        setGuests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  useEffect(() => {
    const handleGuestsUpdated = () => {
      loadGuests(lastSearch, lastRecentGuest);
    };

    window.addEventListener(GUESTS_UPDATED_EVENT, handleGuestsUpdated);
    return () => {
      window.removeEventListener(GUESTS_UPDATED_EVENT, handleGuestsUpdated);
    };
  }, [loadGuests, lastSearch, lastRecentGuest]);

  // Add a new contact via backend API
  const addGuest = async (guestData: AddGuestInput) => {
    if (!guestData.eventId || !guestData.ticketId) {
      throw new Error('Event and ticket are required to add a guest');
    }

    const response = await AddGuestService.addHostGuest({
      name: guestData.name,
      email: guestData.email,
      phone: guestData.phone,
      companyName: guestData.company,
      jobTitle: guestData.jobTitle,
      eventId: guestData.eventId,
      ticketId: guestData.ticketId,
    });

    const apiGuest = response?.data || response;
    const createdGuest = mapApiGuestToGuest({
      ...apiGuest,
      phone: guestData.phone,
      companyName: apiGuest?.companyName || guestData.company,
      jobTitle: apiGuest?.jobTitle || guestData.jobTitle,
    });

    setGuests((prev) =>
      [createdGuest, ...prev].sort((a, b) => a.name.localeCompare(b.name)),
    );

    window.dispatchEvent(new CustomEvent(GUESTS_UPDATED_EVENT));
    return createdGuest;
  };

  // Update contact via backend API
  const updateGuest = async (guestId: string, updates: UpdateGuestInput) => {
    const response = await AddGuestService.updateHostGuest(guestId, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      companyName: updates.company,
      jobTitle: updates.jobTitle,
      eventId: updates.eventId,
      ticketId: updates.ticketId,
    });

    const apiGuest = response?.data || response;
    const updatedGuest = mapApiGuestToGuest({
      ...apiGuest,
      id: apiGuest?.id || guestId,
      name: apiGuest?.name || updates.name,
      email: apiGuest?.email || updates.email,
      phone: apiGuest?.phone || updates.phone,
      companyName: apiGuest?.companyName || updates.company,
      jobTitle: apiGuest?.jobTitle || updates.jobTitle,
    });

    setGuests((prev) =>
      prev
        .map((g) => (g.id === guestId ? { ...g, ...updatedGuest } : g))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );

    window.dispatchEvent(new CustomEvent(GUESTS_UPDATED_EVENT));
  };

  // Remove contact via backend API
  const removeGuest = async (guestId: string) => {
    await AddGuestService.deleteHostGuest(guestId);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    window.dispatchEvent(new CustomEvent(GUESTS_UPDATED_EVENT));
  };
  const sendGuestPaymentIntent = async (guestId: string) => {
    return AddGuestService.sendGuestPaymentIntent(guestId);
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
    sendGuestPaymentIntent,
    importGuests,
    exportGuests,
    reload: loadGuests,
  };
};
