export default function dedent(strings, ...values) {
  let raw = typeof strings === 'string' ? [strings] : strings.raw;
  let result = '';

  // interpolation
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      .replace(/\\\n[ \t]*/g, '')
      .replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  // strip indentation
  let lines = result.split('\n');
  let mindent;

  for (let l of lines) {
    let m = l.match(/^(\s+)\S+/);

    if (m) {
      let indent = m[1].length;

      if (!mindent) {
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  };

  if (mindent !== null) {
    result = lines.map(l => {
      return l[0] === ' ' ? l.slice(mindent) : l;
    }).join('\n');
  }

  // trim newlines and handle escaped newlines
  return result
    .replace(/^\n|\n$/g, '')
    .replace(/\\n/g, '\n');
}
