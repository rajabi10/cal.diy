import { lookup } from "bcp-47-match";
import type { GetTokenParams } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";

import { i18n } from "@calcom/i18n/next-i18next.config";

type ReadonlyHeaders = Awaited<ReturnType<typeof import("next/headers").headers>>;
type ReadonlyRequestCookies = Awaited<ReturnType<typeof import("next/headers").cookies>>;

/**
 * This is a slimmed down version of the `getServerSession` function from
 * `next-auth`.
 *
 * Instead of requiring the entire options object for NextAuth, we create
 * a compatible session using information from the incoming token.
 *
 * The downside to this is that we won't refresh sessions if the users
 * token has expired (30 days). This should be fine as we call `/auth/session`
 * frequently enough on the client-side to keep the session alive.
 */
export const getLocale = async (
  req:
    | GetTokenParams["req"]
    | {
        cookies: ReadonlyRequestCookies;
        headers: ReadonlyHeaders;
      }
): Promise<string> => {
  const token = await getToken({
    req: req as GetTokenParams["req"],
  });

  const tokenLocale = token?.["locale"];

  if (tokenLocale) {
    // Validate token locale is a known supported locale before trusting it
    return lookup(i18n.locales, tokenLocale) ?? i18n.defaultLocale;
  }

  return i18n.defaultLocale;
};
