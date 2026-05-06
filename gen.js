const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer,
} = require('docx');
const fs = require('fs');
const path = require('path');

const BLUE = '2E75B6';
const CODE_BG = 'F4F4F4';
const RED_BG = 'FFF2F2';
const RED_BORDER = 'C0392B';
const BLUE_BG = 'EBF5FB';
const BLUE_BORDER = '2980B9';
const GRAY = '666666';
const DARK = '1A1A1A';
const BODY_SIZE = 22;
const BODY_LINE = 240;
const BODY_SPACE = 0;
const LIST_SPACE = 0;
const CODE_SIZE = 24;
const CODE_LINE = 240;

const HI = {
  keyword: '0000FF',
  string: 'A31515',
  comment: '008000',
  number: '098658',
  decorator: 'AF00DB',
  operator: '777777',
  default: '000000',
  cmd: '795E26',
  flag: '001080',
  tag: '800000',
  attr: 'E06C00',
  yamlKey: '0451A5',
};

const PY_KW = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'self', 'try', 'while', 'with', 'yield',
]);

function textRun(text, opts = {}) {
  return new TextRun({
    text,
    font: opts.font || opts.baseFont || 'Meiryo UI',
    size: opts.size || opts.baseSize || BODY_SIZE,
    color: opts.color || opts.baseColor || DARK,
    bold: opts.bold || false,
    italics: opts.italics || false,
    shading: opts.shading,
  });
}

function parseInline(text, opts = {}) {
  const base = {
    baseFont: opts.baseFont || 'Meiryo UI',
    baseSize: opts.baseSize || BODY_SIZE,
    baseColor: opts.baseColor || DARK,
  };
  const runs = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        runs.push(textRun(text.slice(i + 1, end), {
          font: 'Courier New',
          size: BODY_SIZE,
          color: '000000',
          shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
        }));
        i = end + 1;
        continue;
      }
    }

    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        runs.push(textRun(text.slice(i + 2, end), { ...base, bold: true }));
        i = end + 2;
        continue;
      }
    }

    if (text[i] === '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1) {
        runs.push(textRun(text.slice(i + 1, end), { ...base, italics: true }));
        i = end + 1;
        continue;
      }
    }

    let next = text.length;
    for (const marker of ['`', '**', '*']) {
      const pos = text.indexOf(marker, i + 1);
      if (pos !== -1) next = Math.min(next, pos);
    }
    runs.push(textRun(text.slice(i, next), base));
    i = next;
  }

  return runs.length > 0 ? runs : [textRun('', base)];
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: 'Meiryo UI', size: 36, bold: true, color: 'FFFFFF' })],
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE } },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: 'Meiryo UI', size: 26, bold: true, color: BLUE })],
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BLUE } },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: 'Meiryo UI', size: 22, bold: true, color: '333333' })],
    spacing: { before: 200, after: 80 },
  });
}

function para(runs) {
  return new Paragraph({
    children: runs,
    spacing: { before: BODY_SPACE, after: BODY_SPACE, line: BODY_LINE },
  });
}

function bulletItem(runs) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: runs,
    spacing: { before: LIST_SPACE, after: LIST_SPACE, line: BODY_LINE },
  });
}

function numberedItem(runs) {
  return new Paragraph({
    numbering: { reference: 'numbered', level: 0 },
    children: runs,
    spacing: { before: LIST_SPACE, after: LIST_SPACE, line: BODY_LINE },
  });
}

function spacer() {
  return new Paragraph({ children: [], spacing: { before: 0, after: 0, line: BODY_LINE } });
}

function simpleTokens(line, color = HI.default) {
  return [{ text: line || ' ', color }];
}

function scanStringsAndComments(line, commentStart) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    if (commentStart && line.startsWith(commentStart, i)) {
      tokens.push({ text: line.slice(i), color: HI.comment });
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') j += 2;
        else if (line[j] === quote) {
          j += 1;
          break;
        } else {
          j += 1;
        }
      }
      tokens.push({ text: line.slice(i, j), color: HI.string });
      i = j;
      continue;
    }
    let j = i + 1;
    while (j < line.length && line[j] !== '"' && line[j] !== "'" && !(commentStart && line.startsWith(commentStart, j))) {
      j += 1;
    }
    tokens.push({ text: line.slice(i, j), color: HI.default });
    i = j;
  }
  return tokens.length ? tokens : simpleTokens(line);
}

function tokenizePython(line) {
  if (line.trimStart().startsWith('@')) return [{ text: line, color: HI.decorator }];
  const firstPass = scanStringsAndComments(line, '#');
  const out = [];
  for (const token of firstPass) {
    if (token.color !== HI.default) {
      out.push(token);
      continue;
    }
    const re = /([A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|==|!=|<=|>=|[-+*/%=<>:,.()[\]{}])/g;
    let last = 0;
    let match;
    while ((match = re.exec(token.text)) !== null) {
      if (match.index > last) out.push({ text: token.text.slice(last, match.index), color: HI.default });
      const word = match[0];
      let color = HI.default;
      if (PY_KW.has(word)) color = HI.keyword;
      else if (/^\d/.test(word)) color = HI.number;
      else if (/^[-+*/%=<>:,.()[\]{}]/.test(word) || ['==', '!=', '<=', '>='].includes(word)) color = HI.operator;
      out.push({ text: word, color });
      last = match.index + word.length;
    }
    if (last < token.text.length) out.push({ text: token.text.slice(last), color: HI.default });
  }
  return out.length ? out : simpleTokens(line);
}

function tokenizeBash(line) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith('#')) return [{ text: line, color: HI.comment }];
  const firstPass = scanStringsAndComments(line, '#');
  let commandColored = false;
  const out = [];
  for (const token of firstPass) {
    if (token.color !== HI.default) {
      out.push(token);
      continue;
    }
    const parts = token.text.split(/(\s+|--?[A-Za-z0-9][A-Za-z0-9_-]*)/);
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) out.push({ text: part, color: HI.default });
      else if (/^--?[A-Za-z0-9]/.test(part)) out.push({ text: part, color: HI.flag });
      else if (!commandColored && part.trim()) {
        out.push({ text: part, color: HI.cmd });
        commandColored = true;
      } else {
        out.push({ text: part, color: HI.default });
      }
    }
  }
  return out.length ? out : simpleTokens(line);
}

function tokenizeYaml(line) {
  const commentIndex = line.indexOf('#');
  const body = commentIndex === -1 ? line : line.slice(0, commentIndex);
  const comment = commentIndex === -1 ? '' : line.slice(commentIndex);
  const m = body.match(/^(\s*-?\s*)([A-Za-z0-9_-]+)(\s*:)(.*)$/);
  const out = [];
  if (m) {
    out.push({ text: m[1], color: HI.default });
    out.push({ text: m[2], color: HI.yamlKey });
    out.push({ text: m[3], color: HI.operator });
    out.push(...scanStringsAndComments(m[4], null));
  } else {
    out.push(...scanStringsAndComments(body, null));
  }
  if (comment) out.push({ text: comment, color: HI.comment });
  return out.length ? out : simpleTokens(line);
}

function tokenizeHtml(line) {
  if (line.includes('<!--')) return [{ text: line, color: HI.comment }];
  const out = [];
  const re = /(<\/?)([A-Za-z0-9_-]+)|([A-Za-z0-9_:-]+)(=)|("[^"]*"|'[^']*')/g;
  let last = 0;
  let match;
  while ((match = re.exec(line)) !== null) {
    if (match.index > last) out.push({ text: line.slice(last, match.index), color: HI.default });
    if (match[1]) {
      out.push({ text: match[1], color: HI.operator });
      out.push({ text: match[2], color: HI.tag });
    } else if (match[3]) {
      out.push({ text: match[3], color: HI.attr });
      out.push({ text: match[4], color: HI.operator });
    } else {
      out.push({ text: match[5], color: HI.string });
    }
    last = match.index + match[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last), color: HI.default });
  return out.length ? out : simpleTokens(line);
}

function tokenize(line, lang = 'text') {
  const normalized = (lang || 'text').toLowerCase();
  if (normalized === 'python' || normalized === 'py') return tokenizePython(line);
  if (['bash', 'sh', 'shell'].includes(normalized)) return tokenizeBash(line);
  if (normalized === 'yaml' || normalized === 'yml') return tokenizeYaml(line);
  if (normalized === 'html') return tokenizeHtml(line);
  return simpleTokens(line);
}

function codeBlock(lines, lang = 'text') {
  if (lines.length === 0) return [];
  return lines.map((line, i) => {
    const isFirst = i === 0;
    const isLast = i === lines.length - 1;
    const border = {
      top: isFirst ? { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
        : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.THICK, size: 10, color: '6699CC' },
      bottom: isLast ? { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
        : { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    };
    const runs = tokenize(line, lang).map(t =>
      new TextRun({ text: t.text || ' ', font: 'Courier New', size: CODE_SIZE, color: t.color })
    );
    return new Paragraph({
      children: runs,
      shading: { fill: CODE_BG, type: ShadingType.CLEAR },
      spacing: { before: isFirst ? 40 : 0, after: isLast ? 40 : 0, line: CODE_LINE },
      indent: { left: 240, right: 120 },
      border,
    });
  });
}

function callout(label, lines, type = 'note') {
  let bg = BLUE_BG;
  let borderColor = BLUE_BORDER;
  if (type === 'warning') {
    bg = RED_BG;
    borderColor = RED_BORDER;
  }

  const leftBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.THICK, size: 12, color: borderColor },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const result = [];
  if (label) {
    result.push(new Paragraph({
      children: [new TextRun({ text: `【${label}】`, font: 'Meiryo UI', size: BODY_SIZE, bold: true, color: borderColor })],
      shading: { fill: bg, type: ShadingType.CLEAR },
      border: leftBorder,
      spacing: { before: 40, after: 0 },
      indent: { left: 200 },
    }));
  }
  for (const line of lines) {
    result.push(new Paragraph({
      children: parseInline(line, { baseColor: DARK, baseSize: BODY_SIZE, baseFont: 'Meiryo UI' }),
      shading: { fill: bg, type: ShadingType.CLEAR },
      border: leftBorder,
      spacing: { before: 0, after: 0, line: BODY_LINE },
      indent: { left: 200 },
    }));
  }
  result.push(new Paragraph({
    children: [],
    shading: { fill: bg, type: ShadingType.CLEAR },
    border: leftBorder,
    spacing: { before: 0, after: 40 },
    indent: { left: 200 },
  }));
  return result;
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isPipeTableLine(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function makeTable(headers, rows) {
  const colCount = headers.length;
  const tableWidth = 9360;
  const colWidth = Math.floor(tableWidth / colCount);
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const makeCell = (text, bg, isHeader) => new TableCell({
    borders,
    width: { size: colWidth, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: isHeader
        ? [new TextRun({ text, font: 'Meiryo UI', size: BODY_SIZE, bold: true, color: 'FFFFFF' })]
        : parseInline(text, { baseColor: DARK, baseSize: BODY_SIZE, baseFont: 'Meiryo UI' }),
    })],
  });

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: [
      new TableRow({ children: headers.map(h => makeCell(h, BLUE, true)) }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: headers.map((_, ci) => makeCell(row[ci] || '', ri % 2 === 0 ? 'FFFFFF' : 'F7F9FB', false)),
        })
      ),
    ],
  });
}

function parseCoverMeta(lines) {
  const rows = lines.map(splitTableRow).filter(row => row.length >= 2);
  const dataRows = rows.slice(1);
  const meta = { bookTitle: '', chapterTitle: '', extraRows: [] };
  for (const row of dataRows) {
    const label = row[0];
    const value = row[1];
    if (label === '教材タイトル') meta.bookTitle = value;
    if (label === '章タイトル') meta.chapterTitle = value;
    meta.extraRows.push({ label, value });
  }
  return meta;
}

function coverPage(meta) {
  const subtitle = getMetaValue(meta, 'この章で作るもの') || getMetaValue(meta, '対象') || '';
  return [
    new Paragraph({
      children: [new TextRun({ text: meta.bookTitle, font: 'Meiryo UI', size: 28, color: BLUE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: meta.chapterTitle, font: 'Meiryo UI', size: 44, bold: true, color: DARK })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, font: 'Meiryo UI', size: BODY_SIZE, color: GRAY })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '────────────────────────────────────────────────────────────', font: 'Meiryo UI', size: 14, color: BLUE })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
    }),
  ];
}

function getMetaValue(meta, label) {
  const row = meta.extraRows.find(item => item.label === label);
  return row ? row.value : '';
}

function parseTableBlock(lines, start) {
  const tableLines = [];
  let i = start;
  while (i < lines.length && isPipeTableLine(lines[i])) {
    tableLines.push(lines[i]);
    i += 1;
  }
  const allRows = tableLines
    .filter(line => !isTableSeparator(line))
    .map(splitTableRow);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return { node: headers.length ? makeTable(headers, rows) : null, next: i };
}

function isSpecialStart(line) {
  return line.trim() === ''
    || /^#{1,6}\s+/.test(line)
    || /^```/.test(line.trim())
    || /^>/.test(line)
    || isPipeTableLine(line)
    || /^\s*[-*]\s+/.test(line)
    || /^\s*\d+\.\s+/.test(line)
    || line.startsWith('スクリーンショット挿入予定:');
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const children = [];
  let meta = { bookTitle: '', chapterTitle: '', extraRows: [] };
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '# 表紙') {
      i += 1;
      while (i < lines.length && lines[i].trim() === '') i += 1;
      const tableLines = [];
      while (i < lines.length && isPipeTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i += 1;
      }
      meta = parseCoverMeta(tableLines);
      children.push(...coverPage(meta));
      continue;
    }

    if (trimmed === '# 目次') {
      i += 1;
      while (i < lines.length && !/^#\s+/.test(lines[i])) i += 1;
      continue;
    }

    if (line.startsWith('スクリーンショット挿入予定:')) {
      i += 1;
      while (i < lines.length && lines[i].trim() !== '') i += 1;
      continue;
    }

    if (trimmed === '') {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim() || 'text';
      i += 1;
      const codeLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      children.push(...codeBlock(codeLines, lang));
      continue;
    }

    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      let label = '';
      let type = 'note';
      if (quoteLines.length) {
        const m = quoteLines[0].match(/^(注意|補足|メモ):\s*(.*)$/);
        if (m) {
          label = m[1];
          type = label === '注意' ? 'warning' : 'note';
          quoteLines[0] = m[2];
          if (quoteLines[0] === '') quoteLines.shift();
        }
      }
      children.push(...callout(label, quoteLines, type));
      continue;
    }

    if (isPipeTableLine(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const table = parseTableBlock(lines, i);
      if (table.node) children.push(table.node);
      i = table.next;
      continue;
    }

    if (/^###\s+/.test(line)) {
      children.push(heading3(line.replace(/^###\s+/, '').trim()));
      i += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      children.push(heading2(line.replace(/^##\s+/, '').trim()));
      i += 1;
      continue;
    }

    if (/^#\s+/.test(line)) {
      children.push(heading1(line.replace(/^#\s+/, '').trim()));
      i += 1;
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      children.push(bulletItem(parseInline(bullet[1])));
      i += 1;
      continue;
    }

    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numbered) {
      children.push(numberedItem(parseInline(numbered[1])));
      i += 1;
      continue;
    }

    const paraLines = [line];
    i += 1;
    while (i < lines.length && !isSpecialStart(lines[i])) {
      paraLines.push(lines[i]);
      i += 1;
    }
    children.push(para(parseInline(paraLines.join(''))));
  }

  return { children, meta };
}

function makeHeader(meta) {
  return new Header({
    children: [new Paragraph({
      children: [new TextRun({
        text: `${meta.bookTitle}  |  ${meta.chapterTitle}`,
        font: 'Meiryo UI',
        size: 16,
        color: GRAY,
      })],
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } },
    })],
  });
}

function makeFooter(meta) {
  return new Footer({
    children: [new Paragraph({
      children: [
        new TextRun({ text: `${meta.bookTitle}  |  `, font: 'Meiryo UI', size: 16, color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Meiryo UI', size: 16, color: GRAY }),
        new TextRun({ text: ' / ', font: 'Meiryo UI', size: 16, color: GRAY }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Meiryo UI', size: 16, color: GRAY }),
      ],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' } },
    })],
  });
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node gen.js <markdown-file>');
    process.exit(1);
  }

  const output = process.argv[3] || defaultOutputPath(input);
  const markdown = fs.readFileSync(input, 'utf8');
  const { children, meta } = parseMarkdown(markdown);
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Meiryo UI', size: BODY_SIZE, color: DARK } },
      },
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
        {
          reference: 'numbered',
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      headers: { default: makeHeader(meta) },
      footers: { default: makeFooter(meta) },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, buf);
  console.log(`Done! ${output}`);
}

function defaultOutputPath(input) {
  const parsed = path.parse(input);
  return path.join('docs', 'generated_docx', `${parsed.name}.docx`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
