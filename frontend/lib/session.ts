import { SignJWT, jwtVerify } from "jose";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não está configurado.");
  }

  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  username: string;
  role: "admin";
  expiresAt: number;
};

export async function encrypt(payload: SessionPayload) {
  const encodedKey = getSecretKey();

  return new SignJWT({
    username: payload.username,
    role: payload.role,
    expiresAt: payload.expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    if (!session) return null;

    const encodedKey = getSecretKey();

    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}