export default function normalizeUrl(url) {
  const parts = url.split('://');
  return parts[1] && parts[1].indexOf('/') === -1 ? `${url}/` : url;
}
