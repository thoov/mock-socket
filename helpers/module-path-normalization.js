function pathNormalization(filepath) {
  var arrayOfNestedDirs = filepath.split('/');

  if(arrayOfNestedDirs.length === 1) {
    return './';
  }

  // for each nested dir we place a ../ infront of qunit.js
  return arrayOfNestedDirs.map(function() { return '../'; }).slice(0, -1).join('');
}

module.exports = pathNormalization;
