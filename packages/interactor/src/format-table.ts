import { grey } from 'chalk';
import strip from 'strip-ansi';

export interface TableOptions {
  headers: string[];
  rows: string[][];
}

const MAX_COLUMN_WIDTH = 40

function formatValue(value: string, width: number) {
  let diff = width - strip(value).length;
  if(diff < 0) {
    return value.slice(0, width - 1) + '…';
  } else {
    return value.padEnd(value.length + diff);
  }
}

export function formatTable(options: TableOptions): string {
  let columnWidths = options.headers.map((h, index) => {
    return Math.min(MAX_COLUMN_WIDTH, Math.max(strip(h).length, ...options.rows.map((r) => strip(r[index]).length)));
  });

  let formatRow = (cells: string[]) => {
    return grey('┃ ') + cells.map((c, index) => formatValue(c, columnWidths[index])).join(grey(' ┃ ')) + grey(' ┃');
  }

  let spacerRow = () => {
    return grey('┣━' + columnWidths.map((w) => "━".repeat(w)).join('━╋━') + '━┫');
  }

  return [
    formatRow(options.headers),
    spacerRow(),
    ...options.rows.map((row) => formatRow(row))
  ].join('\n');
}
