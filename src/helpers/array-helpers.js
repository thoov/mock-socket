export function reject(array, callback) {
  var results = [];
  array.forEach(function(itemInArray) {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

export function filter(array, callback) {
  var results = [];
  array.forEach(function(itemInArray) {
    if (callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}
