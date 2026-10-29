import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

export interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export type DeleteNoteResponse = Note;

export interface RegisterRequest {
  email: string;
  password: string;
}

export type LoginRequest = RegisterRequest;

export interface UpdateMeRequest {
  username: string;
}

interface SessionResponse {
  success: boolean;
}

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
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
};

export const createNote = async (newNote: CreateNoteParams): Promise<Note> => {
  const { data } = await api.post<Note>('/notes', newNote);
  return data;
};

export const deleteNote = async (id: string): Promise<DeleteNoteResponse> => {
  const { data } = await api.delete<DeleteNoteResponse>(`/notes/${id}`);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
};

export const login = async (payload: LoginRequest): Promise<User> => {
  const { data } = await api.post<User>('/auth/login', payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// Перевіряє (і за потреби оновлює) сесію. Route /api/auth/session повертає { success }
export const checkSession = async (): Promise<boolean> => {
  const { data } = await api.get<SessionResponse>('/auth/session');
  return data.success;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/users/me');
  return data;
};

export const updateMe = async (payload: UpdateMeRequest): Promise<User> => {
  const { data } = await api.patch<User>('/users/me', payload);
  return data;
};
