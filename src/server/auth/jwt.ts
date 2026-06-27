import jwt from "jsonwebtoken";
import { z } from "zod";
import { assertEnv } from "@overlay365/config/env-guard";

// Startup env validation
assertEnv({
  service: "Grader",
  required: ["JWT_SECRET", "DATABASE_URL"],
  recommended: ["GITHUB_TOKEN", "GEMINI_API_KEY", "RESEND_API_KEY"],
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET environment variable must be set and at least 32 characters long"
  );
}

/** Short-lived access token — limits exposure if stolen. */
export const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL ?? "1h";
/** Long-lived refresh token — rotated via /api/v1/auth/refresh. */
export const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL ?? "7d";

const jwtPayloadSchema = z.object({
  userId: z.string(),
  orgId: z.string().optional(),
});

const refreshPayloadSchema = jwtPayloadSchema.extend({
  type: z.literal("refresh"),
});

export type DecodedPayload = z.infer<typeof jwtPayloadSchema>;

interface JwtInput {
  userId: string;
  orgId?: string;
}

export const generateAccessToken = (payload: JwtInput): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
};

export const generateRefreshToken = (payload: JwtInput): string => {
  return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
};

/** @deprecated Use generateAccessToken — kept for call-site compatibility during migration. */
export const generateToken = generateAccessToken;

export const verifyToken = (token: string): DecodedPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  return jwtPayloadSchema.parse(decoded);
};

export const verifyRefreshToken = (token: string): DecodedPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  const parsed = refreshPayloadSchema.parse(decoded);
  return { userId: parsed.userId, orgId: parsed.orgId };
};
