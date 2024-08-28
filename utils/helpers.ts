import { blue, red, yellow } from "./print";

export function getValue<T, K extends keyof T>(
  opts: T,
  key: K,
  isMandatory?: boolean,
): T[K] {
  if (!opts[key] && isMandatory) {
    throw new Error(`Key ${String(key)} is mandatory for this object`)
  }

  return opts[key];
}

const emailRegEx =
  /^<?[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*>?$/;
export function isValidAddress(email: string): boolean {
  return emailRegEx.test(email);
}

export const log = {
  default: (message: string) => {
    console.log(message);
  },
  warn: (message: string) => {
    console.warn(`⚠️ ${yellow(message)}`);
  },
  info: (message: string) => {
    console.warn(`ℹ️  ${blue(message)}`);
  },
  error: (message: string | Error) => {
    const toLog = message instanceof Error ? message : `🛑 ${red(message)}`;
    console.error(toLog);
  },
};

export class UTF8Transcoder {

  static encoder = new TextEncoder();
  static decoder = new TextDecoder();

  static encode(str: string): Uint8Array {
    return this.encoder.encode(str);
  }

  static decode(arr: Uint8Array): string {
    return this.decoder.decode(arr);
  }
}
