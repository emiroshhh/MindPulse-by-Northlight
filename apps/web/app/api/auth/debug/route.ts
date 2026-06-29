import {
  debugSessionResolution,
  getCurrentUserFromRequest,
  getAuthDb,
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
  let dbAvailable = false;
  let sessionDebug = {
    dbAvailable: false,
    sessionHashComputed: false,
    sessionTableChecked: false,
    sessionRowFound: false,
    sessionCountForDebugToken: false,
    sessionNotExpired: false,
    joinedUserFound: false,
    userResolved: false,
    nowIso: new Date().toISOString(),
  };
  try {
    const db = await getAuthDb();
    dbAvailable = true;
    sessionDebug = await debugSessionResolution(db, resolved.token);
  } catch {
    // Keep debug safe and boolean-only if D1 is unavailable.
  }
  const user = dbAvailable ? await getCurrentUserFromRequest(request) : null;

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
    dbAvailable,
    sessionHashComputed: sessionDebug.sessionHashComputed,
    sessionRowFound: sessionDebug.sessionRowFound,
    sessionNotExpired: sessionDebug.sessionNotExpired,
    joinedUserFound: sessionDebug.joinedUserFound,
    sessionTableChecked: sessionDebug.sessionTableChecked,
    sessionCountForDebugToken: sessionDebug.sessionCountForDebugToken,
    nowIso: sessionDebug.nowIso,
  });
}
