import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

const jwtPayloadSchema = z.object({
  userId: z.string(),
  orgId: z.string().optional(),
});

export type DecodedPayload = z.infer<typeof jwtPayloadSchema>;

interface JwtInput {
  userId: string;
  orgId?: string;
}

export const generateToken = (payload: JwtInput): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): DecodedPayload => {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  return jwtPayloadSchema.parse(decoded);
};
