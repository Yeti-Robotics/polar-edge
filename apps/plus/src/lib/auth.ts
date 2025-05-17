import NextAuth, { AuthError, DefaultSession } from "next-auth";
import type { NextAuthConfig, NextAuthResult } from "next-auth";
import Discord from "next-auth/providers/discord";

const scopes = ["identify", "email", "guilds.members.read"];
const YETI_GUILD_ID = "408711970305474560";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

async function getMemberInfo(guildId: string, accessToken: string) {
	const headers = new Headers();
	headers.set("Authorization", `Bearer ${accessToken}`);

	return fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
		headers,
	})
		.then((res) => {
			if (!res.ok) {
				return null;
			}

			return res.json();
		})
		.catch((error) => {
			console.error(
				`Failed to fetch member info for guild ${guildId}:`,
				error
			);
			return null;
		});
}

const config = NextAuth({
	providers: [
		Discord({
			clientId: process.env.AUTH_DISCORD_ID!,
			clientSecret: process.env.AUTH_DISCORD_SECRET!,
			authorization: `https://discord.com/api/oauth2/authorize?scope=${scopes.join("+")}`,
			profile: async (discordProfile, token) => {
				if (!token.access_token) {
					throw new AuthError("Access token null or undefined");
				}

				const yetiMember = await getMemberInfo(
					YETI_GUILD_ID,
					token.access_token
				);

				if (!yetiMember) {
					throw new Error("Failed to fetch member info for guild");
				}

				return {
					id: discordProfile.id,
					name: yetiMember.nick,
				};
			},
		}),
	],
	callbacks: {
		jwt({ token, profile }) {
			if (profile) {
				token.id = profile.id;
			}

			return token;
		},
		session({ session, token }) {
			if (token.id && typeof token.id === "string") {
				session.user.id = token.id;
			} else {
				throw new AuthError("Token id is not a string");
			}

			return session;
		},
	},
} satisfies NextAuthConfig);

/*
This is a workaround to prevent type errors when using the auth hooks.
@see https://github.com/nextauthjs/next-auth/discussions/9950
*/
export const handlers: NextAuthResult["handlers"] = config.handlers;
export const signIn: NextAuthResult["signIn"] = config.signIn;
export const signOut: NextAuthResult["signOut"] = config.signOut;
export const auth: NextAuthResult["auth"] = config.auth;
