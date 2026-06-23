interface IdCrypto {
  randomUUID?: () => string;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
}

function runtimeCrypto(): IdCrypto | null {
  return typeof globalThis.crypto === 'object' ? globalThis.crypto : null;
}

/** Creates local record IDs in browsers, older WebViews, and server runtimes. */
export function createId(
  prefix: string,
  cryptoSource: IdCrypto | null = runtimeCrypto(),
) {
  if (typeof cryptoSource?.randomUUID === 'function') {
    return `${prefix}-${cryptoSource.randomUUID()}`;
  }

  if (typeof cryptoSource?.getRandomValues === 'function') {
    const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
    const uuid = `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
    return `${prefix}-${uuid}`;
  }

  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);
  return `${prefix}-${time}-${random}`;
}
