export async function hashPassword(
  password: string,
  saltRounds = 10000,
  keyLength = 64,
  salt?: string // Optional salt parameter for sign-in
): Promise<{ hashedPassword: string; salt: string }> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Use provided salt for sign-in, otherwise generate a new one for sign-up
  const saltBytes = salt
    ? new Uint8Array(salt.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: saltRounds,
      hash: "SHA-256",
    },
    key,
    keyLength * 8 // key length in bits
  );

  // Convert Uint8Array to Hex String
  const hashedPassword = Array.from(new Uint8Array(derivedBits))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const saltHex = Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    hashedPassword,
    salt: saltHex,
  };
}
