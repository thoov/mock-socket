/**
* The native websocket object will transform urls without a pathname to have just a /.
* As an example: ws://localhost:8080 would actually be ws://localhost:8080/ but ws://example.com/foo would not
* change. This function does this transformation to stay inline with the native websocket implementation.
*
* @param {url: string} The url to transform.
*/
function urlTransform(url) {
  var a = document.createElement('a');
  a.href = url;

  // Note: that the a.pathname === '' is for phantomJS
  if((a.pathname === '/' || a.pathname === '') && url.slice(-1) !== '/') {
    url += '/';
  }

  return url;
}

module.exports = urlTransform;
