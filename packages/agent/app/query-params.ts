function parseQueryParams(params) {
  return params
    .replace(/^\?/, "")
    .split("&")
    .map((line) => line.split("=", 2).map(decodeURIComponent))
    .reduce((agg, [key, value]) => {
      agg[key] = value
      return agg
    }, {});
}

export const queryParams = parseQueryParams(location.search);
