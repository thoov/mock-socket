export default arr =>
  arr.reduce((deduped, b) => {
    if (deduped.indexOf(b) > -1) return deduped;
    return deduped.concat(b);
  }, []);
