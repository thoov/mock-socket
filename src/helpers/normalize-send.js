export default function normalizeSendData(data) {
  const type = Object.prototype.toString.call(data);
  if (type !== '[object Blob]' && !(data instanceof ArrayBuffer) && type !== '[object Object]') {
    data = String(data);
  }

  return data;
}
