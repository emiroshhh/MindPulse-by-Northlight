import {
  getCurrentUserFromRequest,
  json,
  readSessionTokenWithSourceFromRequest,
} from '@/lib/server/auth';

function hasCookie(header: string, name: string) {
  return header
    .split(';')
    .some((part) => part.trim().startsWith(`${name}=`));
}

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const cookieHeader = request.headers.get('cookie') ?? '';
  const resolved = readSessionTokenWithSourceFromRequest(request);
  const user = await getCurrentUserFromRequest(request);

  return json({
    hasAuthorizationBearer: authorization.startsWith('Bearer '),
    hasCookieHeader: Boolean(cookieHeader),
    hasMindpulseSessionCookie: hasCookie(cookieHeader, 'mindpulse_session'),
    hasHostMindpulseSessionCookie: hasCookie(
      cookieHeader,
      '__Host-mindpulse_session',
    ),
    resolvedTokenSource:
      resolved.source === 'x-header' ? 'authorization' : resolved.source,
    userResolved: Boolean(user),
  });
}
