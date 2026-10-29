import { cookies } from 'next/headers';
import type { AxiosResponse } from 'axios';
import type { Note } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';
import type { FetchNotesParams, FetchNotesResponse } from './clientApi';

interface SessionResponse {
  success: boolean;
}

// На сервері браузерних cookies немає, тому передаємо їх у headers вручну
const getCookieHeaders = async () => {
  const cookieStore = await cookies();
  return { Cookie: cookieStore.toString() };
};

export const fetchNotes = async ({
  page,
  perPage = 12,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const { data } = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      ...(search ? { search } : {}),
      ...(tag ? { tag } : {}),
    },
    headers: await getCookieHeaders(),
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: await getCookieHeaders(),
  });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/users/me', {
    headers: await getCookieHeaders(),
  });
  return data;
};

// Повертає весь response, а не лише data: proxy потрібні заголовки set-cookie
export const checkSession = async (): Promise<
  AxiosResponse<SessionResponse>
> => {
  return api.get<SessionResponse>('/auth/session', {
    headers: await getCookieHeaders(),
  });
};
