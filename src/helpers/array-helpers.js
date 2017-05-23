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

export function findDuplicates(array) {
  const uniq = array
  .map((name) => ({ count: 1, name }))
  .reduce((a, b) => {
    a[b.name] = (a[b.name] || 0) + b.count;
    return a;
  }, {});

  return Object.keys(uniq).filter((a) => uniq[a] > 1);
}
