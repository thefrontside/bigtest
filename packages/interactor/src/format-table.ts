export interface TableOptions {
  headers: string[];
  rows: string[][];
}

const MAX_COLUMN_WIDTH = 40

function formatValue(value: string, width: number) {
  if(value.length > width) {
    return value.slice(0, width - 1) + '…';
  } else {
    return value.padEnd(width);
  }
}

export function formatTable(options: TableOptions): string {
  let columnWidths = options.headers.map((h, index) => {
    return Math.min(MAX_COLUMN_WIDTH, Math.max(h.length, ...options.rows.map((r) => r[index].length)));
  });

  let formatRow = (cells: string[]) => {
    return '┃ ' + cells.map((c, index) => formatValue(c, columnWidths[index])).join(' ┃ ') + ' ┃';
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
