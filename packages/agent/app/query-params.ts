function parseQueryParams(params: string) {
  return params
    .replace(/^\?/, "")
    .split("&")
    .map((line) => line.split("=", 2).map(decodeURIComponent))
    .reduce<{[key: string]: string}>((agg, [key, value]) => {
      agg[key] = value
      return agg
    }, {});
}

export const queryParams = parseQueryParams(location.search);
