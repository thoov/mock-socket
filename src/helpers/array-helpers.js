export function reject(array, callback) {
  const results = [];
  array.forEach(itemInArray => {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

export function filter(array, callback) {
  const results = [];
  array.forEach(itemInArray => {
    if (callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}
