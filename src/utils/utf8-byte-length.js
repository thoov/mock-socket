export default function byteLength(str) {
  let s = str.length;

  for (let i = str.length - 1; i >= 0; i -= 1) {
    const code = str.charCodeAt(i);

    if (code > 0x7f && code <= 0x7ff) {
      s += 1;
    } else if (code > 0x7ff && code <= 0xffff) {
      s += 2;
    }

    // trail surrogate
    if (code >= 0xdc00 && code <= 0xdfff) {
      i -= 1;
    }
  }

  return s;
}
