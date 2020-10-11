export interface TableOptions {
  headers: string[];
  rows: string[][];
}

export function formatTable(options: TableOptions) {
  let columnWidths = options.headers.map((h, index) => {
    return Math.max(h.length, ...options.rows.map((r) => r[index].length));
  });

  let formatRow = (cells: string[]) => {
    return '┃ ' + cells.map((c, index) => c.padEnd(columnWidths[index])).join(' ┃ ') + ' ┃';
  }

  let spacerRow = () => {
    return '┣━' + columnWidths.map((w) => "━".repeat(w)).join('━╋━') + '━┫';
  }

  return [
    formatRow(options.headers),
    spacerRow(),
    ...options.rows.map((row) => formatRow(row))
  ].join('\n');
}
