import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

function derivar(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, clave) => (error ? reject(error) : resolve(clave)));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const clave = await derivar(password, salt);
  return `${salt.toString("hex")}:${clave.toString("hex")}`;
}

export async function verificarPassword(password: string, guardado: string) {
  const [saltHex, claveHex] = guardado.split(":");
  if (!saltHex || !claveHex) return false;
  const esperada = Buffer.from(claveHex, "hex");
  const clave = await derivar(password, Buffer.from(saltHex, "hex"));
  return esperada.length === clave.length && timingSafeEqual(esperada, clave);
}
