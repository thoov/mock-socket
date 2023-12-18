export default function normalizeSendData(data) {
  if (Object.prototype.toString.call(data) !== '[object Blob]' && !(data instanceof ArrayBuffer || (data.constructor && data.constructor.name === 'ArrayBuffer'))) {
    data = String(data);
  }

  return data;
}
