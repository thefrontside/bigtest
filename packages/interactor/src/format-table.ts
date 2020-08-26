export interface TableOptions {
  headers: string[];
  rows: string[][];
}

export function formatTable(options: TableOptions) {
  let columnWidths = options.headers.map((h, index) => {
    return Math.max(h.length, ...options.rows.map((r) => r[index].length));
  });

  let result = '';
  result += '| ' + options.headers.map((h, index) => h.padEnd(columnWidths[index])).join(' | ') + ' |\n';
  result += '| ' + options.headers.map((h, index) => "".padEnd(columnWidths[index], '-')).join(' | ') + ' |\n';
  for(let row of options.rows) {
    result += '| ' + row.map((r, index) => r.padEnd(columnWidths[index])).join(' | ') + ' |\n';
  }
  return result.trim();
}
