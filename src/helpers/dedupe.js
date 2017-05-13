export default (arr) => {
  return arr.reduce(function(deduped, b){
  	if (deduped.indexOf(b) > -1) return deduped;
    return deduped.concat(b);
  }, []);
}
