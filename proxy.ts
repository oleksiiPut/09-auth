import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseSetCookie } from 'cookie';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

const matches = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname.startsWith(route));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const isPublicRoute = matches(pathname, publicRoutes);
  const isPrivateRoute = matches(pathname, privateRoutes);

  if (!accessToken) {
    // accessToken прострочився, але є refreshToken: пробуємо оновити сесію
    if (refreshToken) {
      try {
        const sessionResponse = await checkSession();
        const setCookie = sessionResponse.headers['set-cookie'];

        if (setCookie) {
          const cookieArray = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];

          for (const cookieStr of cookieArray) {
            const parsed = parseSetCookie(cookieStr);
            if (parsed.value) {
              cookieStore.set(parsed.name, parsed.value, parsed);
            }
          }

          // Передаємо оновлені cookies і в браузер, і далі в серверні компоненти
          const headers = { Cookie: cookieStore.toString() };

          if (isPublicRoute) {
            return NextResponse.redirect(new URL('/profile', request.url), {
              headers,
            });
          }
          if (isPrivateRoute) {
            return NextResponse.next({ headers });
          }
        }
      } catch {
        // сесію не вдалося оновити: далі діємо як з неавторизованим
      }
    }

    if (isPublicRoute) {
      return NextResponse.next();
    }
    if (isPrivateRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return NextResponse.next();
  }

  // Користувач авторизований
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
