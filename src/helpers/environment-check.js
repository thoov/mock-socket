function isNode() {
  if (typeof window === 'undefined')
    return true;

  return false;
}

export default {
  globalContext : isNode() ? global : window,
  isNode        : isNode
};
