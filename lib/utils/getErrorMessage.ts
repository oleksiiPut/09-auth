import { isAxiosError } from 'axios';

// Route-обробники повертають { error, response }, де response — тіло відповіді бекенду.
// Саме повідомлення бекенду лежить у response.message (або глибше, у response.response.message)
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const backend = error.response?.data?.response;
    const message = backend?.message ?? backend?.response?.message;

    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');

    return error.response?.data?.error ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong';
};
