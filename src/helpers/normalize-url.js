export default function normalizeUrl(url) {
  const urlWithoutParams = url.split('?')[0];
  const parts = urlWithoutParams.split('://');
  const urlWithTrailingSlash = parts[1] && parts[1].indexOf('/') === -1 ? `${urlWithoutParams}/` : urlWithoutParams;
  return urlWithTrailingSlash;
}
