export default function normalizeSendData(data) {
  if (data instanceof Buffer) {
    data = data.buffer;
  } else if (Object.prototype.toString.call(data) !== '[object Blob]' && !(data instanceof ArrayBuffer)) {
    data = String(data);
  }

  return data;
}
