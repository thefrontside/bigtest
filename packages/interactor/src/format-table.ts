export interface TableOptions {
  headers: string[];
  rows: string[][];
}

export function formatTable(options: TableOptions) {
  let columnWidths = options.headers.map((h, index) => {
    return Math.max(h.length, ...options.rows.map((r) => r[index].length));
  });

  let formatRow = (cells: string[], padString = ' ') => {
    return '| ' + cells.map((c, index) => c.padEnd(columnWidths[index], padString)).join(' | ') + ' |';
  }

  return [
    formatRow(options.headers),
    formatRow(options.headers.map(() => ""), '-'),
    ...options.rows.map((row) => formatRow(row))
  ].join('\n');
}
