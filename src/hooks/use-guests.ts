import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import AddGuestService from '@/services/api/host/guest/addguest.service';
import { useAuth } from '@/contexts/auth';
import * as XLSX from 'xlsx';

const GUESTS_UPDATED_EVENT = 'guests:updated';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  eventId?: string;
  eventTitle?: string;
  tags?: string[];
  eventCount?: number;
  recentEvent?: boolean;
  lastContactedDate?: Date;
  addedDate: Date;
  eventVenueAddress?: string;
  ticketName?: string;
  ticketPrice?: string;
  paymentStatus?: string;
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
}

const mapApiGuestToGuest = (raw: any): Guest => ({
  id: raw?.id || `api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name: raw?.name || '',
  email: raw?.email || '',
  phone: raw?.phone || raw?.phoneNumber || raw?.phone_number || undefined,
  company: raw?.companyName || raw?.company || undefined,
  jobTitle: raw?.jobTitle || undefined,
  eventId: raw?.eventId || raw?.event?.id || undefined,
  eventTitle:
    raw?.eventTitle ||
    raw?.event?.title ||
    (Array.isArray(raw?.events) ? raw.events.map((e: any) => e?.title).find(Boolean) : undefined),
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
  eventTitle: raw?.event?.title || undefined,
  eventVenueAddress: raw?.event?.venueAddress || undefined,
  ticketName: raw?.ticket?.ticketName || undefined,
  ticketPrice: raw?.ticket?.price || undefined,
  paymentStatus: raw?.paymentStatus || raw?.payment?.status || undefined,
});

const PAGE_SIZE = 10;

const getPaymentStatusLabel = (status?: string) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid") return "Paid";
  if (normalized === "earning_transferred") return "Transferred";
  if (normalized === "payment_intent_created") return "Pending";
  if (!normalized) return "";

  return normalized.replace(/_/g, " ");
};

const getResponseMessage = (payload: any) => {
  const candidates = [payload?.message, payload?.data?.message, payload?.meta?.message];

  for (const message of candidates) {
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
  }

  return "";
};

export const useGuests = (initialRecent?: boolean) => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastSearch, setLastSearch] = useState<string | undefined>(undefined);
  const [lastRecentGuest, setLastRecentGuest] = useState<boolean | undefined>(undefined);
  const [lastPage, setLastPage] = useState(1);

  const loadGuests = useCallback(async (search?: string, recentGuest?: boolean, page = 1) => {
    setLoading(true);
    try {
      setLastSearch(search);
      setLastRecentGuest(recentGuest);
      setLastPage(page);

      if (!user?.id) {
        setGuests([]);
        return;
      }

      const result = await AddGuestService.getHostGuests(search, recentGuest, page, PAGE_SIZE);
      const payload = result?.data ?? result;
      const guestRows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      const totalCount =
        typeof payload?.total === 'number'
          ? payload.total
          : typeof payload?.meta?.total === 'number'
            ? payload.meta.total
            : guestRows.length;

      const mapped = guestRows
        .map(mapApiGuestToGuest)
        .filter((g: Guest) => g.name && g.email);

      setGuests(mapped);
      setTotal(totalCount);
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      // Backend may return 404 when the host has no guest records yet.
      if (status === 404 && message === 'Host guest not found') {
        setGuests([]);
        setTotal(0);
      } else {
        console.error('Error loading guests:', err);
        toast.error(message || 'Failed to load contact database');
        setGuests([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGuests(undefined, initialRecent);
  }, [loadGuests]);

  useEffect(() => {
    const handleGuestsUpdated = () => {
      loadGuests(lastSearch, lastRecentGuest, lastPage);
    };

    window.addEventListener(GUESTS_UPDATED_EVENT, handleGuestsUpdated);
    return () => {
      window.removeEventListener(GUESTS_UPDATED_EVENT, handleGuestsUpdated);
    };
  }, [loadGuests, lastSearch, lastRecentGuest, lastPage]);

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

    const payload = response;
    const successMessage = getResponseMessage(payload);
    const apiGuest = payload?.data ?? payload;
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
    return { guest: createdGuest, message: successMessage };
  };

  // Update contact via backend API
  const updateGuest = async (guestId: string, updates: UpdateGuestInput) => {
    const response = await AddGuestService.updateHostGuest(guestId, {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      companyName: updates.company,
      jobTitle: updates.jobTitle,
    });

    const payload = response;
    const successMessage = getResponseMessage(payload);
    const apiGuest = payload?.data ?? payload;
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
    return { guest: updatedGuest, message: successMessage };
  };

  // Remove contact via backend API
  const removeGuest = async (guestId: string) => {
    const response = await AddGuestService.deleteHostGuest(guestId);
    const payload = response;
    const successMessage = getResponseMessage(payload);
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    window.dispatchEvent(new CustomEvent(GUESTS_UPDATED_EVENT));
    return { message: successMessage };
  };
  const sendGuestPaymentIntent = async (guestId: string) => {
    return AddGuestService.sendGuestPaymentIntent(guestId);
  };

  // CSV/XLSX Import (in-memory)
  const importGuests = async (importFile: File) => {
    const fileName = importFile.name.toLowerCase();
    const isCsv = importFile.type === 'text/csv' || fileName.endsWith('.csv');
    const isXlsx =
      importFile.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileName.endsWith('.xlsx');

    if (!isCsv && !isXlsx) {
      throw new Error('Unsupported file type. Please upload CSV or XLSX.');
    }

    return new Promise<{ total: number; successful: number; failed: number; duplicates: number }>(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const rawRows: Array<{
              name: string;
              email: string;
              phone?: string;
              company?: string;
              job_title?: string;
              tags?: string[];
            }> = [];

            if (isCsv) {
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
            } else {
              const data = e.target?.result as ArrayBuffer;
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];

              if (!firstSheetName) {
                return resolve({ total: 0, successful: 0, failed: 0, duplicates: 0 });
              }

              const worksheet = workbook.Sheets[firstSheetName];
              const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
                defval: '',
              });

              const getValue = (row: Record<string, unknown>, keys: string[]) => {
                for (const key of keys) {
                  const value = row[key];
                  if (value !== undefined && value !== null && String(value).trim() !== '') {
                    return String(value).trim();
                  }
                }
                return '';
              };

              for (const row of sheetRows) {
                const name = getValue(row, ['Name', 'name']);
                const email = getValue(row, ['Email', 'email']).toLowerCase();
                if (!name || !email) continue;

                const tagsRaw = getValue(row, ['Tags', 'tags']);
                rawRows.push({
                  name,
                  email,
                  phone: getValue(row, ['Phone', 'phone']),
                  company: getValue(row, ['Company', 'company']),
                  job_title: getValue(row, ['JobTitle', 'Job Title', 'jobTitle', 'job title']),
                  tags: tagsRaw
                    ? tagsRaw
                        .split(';')
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : [],
                });
              }
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

        if (isXlsx) {
          reader.readAsArrayBuffer(importFile);
        } else {
          reader.readAsText(importFile);
        }
      },
    );
  };

  const exportGuests = async () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title','Event Title','Ticket', 'Price','Status'];

    const rows = guests.map((guest) => [
      guest.name,
      guest.email,
      guest.phone || '',
      guest.company || '',
      guest.jobTitle || '',
      guest.eventTitle || '',
       guest.ticketName || '',
       guest.ticketPrice || '',
       getPaymentStatusLabel(guest.paymentStatus) || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

   
    worksheet['!cols'] = [
      { wch: 19 },
      { wch: 29 },
      { wch: 16 },
      { wch: 29 },
      { wch: 20 },
      { wch: 26 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');

    const xlsxBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `guest-contacts-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    guests,
    loading,
    total,
    pageSize: PAGE_SIZE,
    addGuest,
    updateGuest,
    removeGuest,
    sendGuestPaymentIntent,
    importGuests,
    exportGuests,
    reload: loadGuests,
  };
};




