# プロンプト: MarkdownファイルをスタイルつきDOCXに変換する

## タスク概要

与えられた Markdown ファイル（1ファイル）を読み込み、以下の仕様に従って `.docx` ファイルを生成する Node.js スクリプト（`gen.js`）を書いてください。

- ランタイム: Node.js
- ライブラリ: `docx`（npm）
- 入力: `process.argv[2]` で受け取ったファイルパス
- 出力: `docs/generated_docx/<元Markdownファイル名>.docx`
- 任意で `process.argv[3]` に出力パスを渡せる
- 日本語文書を想定し、フォントは `Meiryo UI` を基本とする

```bash
node gen.js chapter00.md
node gen.js docs/chapter01_web_application_basics.md docs/generated_docx/chapter01_web_application_basics.docx
```

---

## 1. 前提・依存関係

```bash
npm install docx
```

スクリプト冒頭で以下をインポートする:

```js
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Header, Footer,
} = require('docx');
const fs = require('fs');
const path = require('path');
```

---

## 2. カラーパレット（定数）

```js
const BLUE          = "2E75B6";  // メインカラー（見出し・テーブルヘッダー）
const CODE_BG       = "F4F4F4";  // コードブロック背景
const RED_BG        = "FFF2F2";  // 注意コールアウト背景
const RED_BORDER    = "C0392B";  // 注意コールアウト左ボーダー
const BLUE_BG       = "EBF5FB";  // 補足・メモ・その他コールアウト背景
const BLUE_BORDER   = "2980B9";  // 補足・メモ・その他コールアウト左ボーダー
const GRAY          = "666666";  // サブテキスト・ヘッダー/フッター
const DARK          = "1A1A1A";  // 本文テキスト

const BODY_SIZE     = 22;        // 本文 11pt
const BODY_LINE     = 240;       // 本文行間。Wordの「1行」相当
const BODY_SPACE    = 0;         // 通常段落の前後余白。空行を増やさない
const LIST_SPACE    = 0;         // リストの前後余白。空行を増やさない
const CODE_SIZE     = 24;        // コードブロック 12pt
const CODE_LINE     = 240;       // コードブロック行間。Wordの「1行」相当
```

---

## 3. Markdownパース方針

### 3-1. ファイル全体の構造

各章のMarkdownは以下の構造を持つ。

```text
# 表紙
| 項目         | 内容     |
| ---          | ---      |
| 教材タイトル  | ○○○     |
| 章タイトル    | 第N章 ○○ |
...（他のメタ情報行）

# 目次
1. ...
2. ...

# 1. セクション名
## 1-1. サブセクション
...
```

**表紙テーブルの処理:**
- `# 表紙` の直後に来るパイプテーブルをメタデータとして解析する
- `教材タイトル` の値 → ヘッダー・フッターの左側テキストに使う
- `章タイトル` の値 → ヘッダー・フッターの右側テキスト、および表紙ページの大見出しに使う
- `この章で作るもの` の値 → 表紙ページのサブタイトルに使う
- 表紙セクションは通常のH1ではなく、後述の「表紙ページ」として特別に描画する
- 表紙テーブル自体はDOCX本文には出力せず、タイトルブロック用メタデータとして扱う

**目次セクションの処理:**
- `# 目次` とその配下の番号付きリストは、DOCXには出力しない（スキップ）

### 3-2. 要素ごとのマッピング

| Markdown記法 | 変換先 |
|---|---|
| `# 表紙` | 表紙ページ（専用レイアウト）|
| `# 目次` | スキップ（配下のリストも含む）|
| `# テキスト` | `heading1(text)` |
| `## テキスト` | `heading2(text)` |
| `### テキスト` | `heading3(text)` |
| 通常段落 | `para(runs)` ※インライン解析あり |
| `- テキスト` / `* テキスト` | `bulletItem(runs)` |
| `1. テキスト` など番号付きリスト | `numberedItem(runs)` |
| ` ```lang ... ``` ` | `codeBlock(lines, lang)` |
| `> 注意: テキスト` | `callout('注意', lines, 'warning')` |
| `> 補足: テキスト` | `callout('補足', lines, 'note')` |
| `> メモ: テキスト` | `callout('メモ', lines, 'note')` |
| `> その他テキスト` | `callout('', lines, 'note')` |
| パイプテーブル `\| A \| B \|` | `makeTable(headers, rows)` |
| `スクリーンショット挿入予定:` で始まる行以降の連続する非空行 | スキップ |
| 空行 | 出力しない |

### 3-3. インラインスタイルの解析

段落・箇条書き・表セル内のテキストはインライン要素を含む。
以下のルールでテキストを `TextRun` の配列に分解する関数 `parseInline(text, opts)` を実装する。

| 記法 | 変換 |
|---|---|
| `` `コード` `` | `font: 'Courier New', size: BODY_SIZE, color: '000000', shading: { fill: 'F0F0F0' }` |
| `**太字**` | `bold: true` |
| `*斜体*` | `italics: true` |
| それ以外 | デフォルトの TextRun |

`opts` にはデフォルトの `{ baseFont, baseSize, baseColor }` を渡す。
インライン要素が混在する例:

```text
- `requirements.txt` から依存関係をインストールできる
```

→ `[TextRun(''), TextRun('requirements.txt', Courier New...), TextRun(' から依存関係をインストールできる')]`

### 3-4. コールアウトの検出ルール

`>` で始まる行を以下のルールで分類する。連続する `>` 行は1つのコールアウトとしてまとめる。

```text
> 注意: テキスト本文    → type='warning',  label='注意'
> 補足: テキスト本文    → type='note',     label='補足'
> メモ: テキスト本文    → type='note',     label='メモ'
> その他のテキスト      → type='note',     label=''
```

先頭行の `キーワード:` 部分はラベルとして取り出し、残りのテキストを本文1行目とする。

---

## 4. スタイル関数

### 4-1. 見出し

```js
// H1: 青背景・白文字バナー
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Meiryo UI", size: 36, bold: true, color: "FFFFFF" })],
    shading: { fill: BLUE, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE } },
  });
}

// H2: 青文字・下線
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Meiryo UI", size: 26, bold: true, color: BLUE })],
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BLUE } },
  });
}

// H3: 太字の小見出し
function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Meiryo UI", size: 22, bold: true, color: "333333" })],
    spacing: { before: 200, after: 80 },
  });
}
```

### 4-2. 本文・リスト

`runs` は `parseInline(text)` の戻り値（TextRun の配列）。

```js
function para(runs) {
  return new Paragraph({
    children: runs,
    spacing: { before: BODY_SPACE, after: BODY_SPACE, line: BODY_LINE },
  });
}

function bulletItem(runs) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: runs,
    spacing: { before: LIST_SPACE, after: LIST_SPACE, line: BODY_LINE },
  });
}

function numberedItem(runs) {
  return new Paragraph({
    numbering: { reference: "numbered", level: 0 },
    children: runs,
    spacing: { before: LIST_SPACE, after: LIST_SPACE, line: BODY_LINE },
  });
}

function spacer() {
  return new Paragraph({ children: [], spacing: { before: 0, after: 0, line: BODY_LINE } });
}
```

空行は原則としてDOCXの空段落に変換しない。Markdown上の段落区切りをそのまま空行として出力すると、Wordで行間が広がりすぎるため。

---

## 5. シンタックスハイライト付きコードブロック

### 5-1. カラー定義

```js
const HI = {
  keyword:   '0000FF',  // キーワード（青）
  string:    'A31515',  // 文字列（暗赤）
  comment:   '008000',  // コメント（緑）
  number:    '098658',  // 数値（青緑）
  decorator: 'AF00DB',  // デコレータ（紫）
  operator:  '777777',  // 演算子（グレー）
  default:   '000000',  // デフォルト（黒）
  cmd:       '795E26',  // bash コマンド名（茶）
  flag:      '001080',  // bash フラグ（紺）
  tag:       '800000',  // HTML タグ名（深赤）
  attr:      'E06C00',  // HTML 属性名（オレンジ）
  yamlKey:   '0451A5',  // YAML キー（紺青）
};
```

### 5-2. 言語別トークナイザーの対応表

| 言語指定 | トークナイズ方針 |
|---|---|
| `python` / `py` | `#`→コメント、`"""`/`'''`/`"`/`'`→文字列、`@`→デコレータ、数値、キーワードテーブル照合 |
| `bash` / `sh` / `shell` | `#`→コメント、`"`/`'`→文字列、`--x`/`-x`→フラグ、行頭ワード→コマンド名 |
| `yaml` / `yml` | `#`→コメント、`key:`→キー色、`"`/`'`→文字列 |
| `html` | `<!--`→コメント、`<タグ名`→タグ色、属性名→属性色、`"`/`'`→文字列 |
| `ini` / `powershell` / `text` / 無指定 | ハイライトなし（全行デフォルト色） |

Pythonキーワード一覧（`PY_KW` として `Set` で定義）:

```js
const PY_KW = new Set([
  'False','None','True','and','as','assert','async','await',
  'break','class','continue','def','del','elif','else','except',
  'finally','for','from','global','if','import','in','is',
  'lambda','nonlocal','not','or','pass','raise','return',
  'self','try','while','with','yield',
]);
```

### 5-3. コードブロック描画関数

```js
function codeBlock(lines, lang = 'text') {
  if (lines.length === 0) return [];
  return lines.map((line, i) => {
    const isFirst = i === 0;
    const isLast  = i === lines.length - 1;
    // ⚠️ OOXML の pBdr は top → left → bottom → right の順が必須（セクション12参照）
    const border = {
      top:    isFirst ? { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
                      : { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' },
      left:   { style: BorderStyle.THICK, size: 10, color: '6699CC' },
      bottom: isLast  ? { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' }
                      : { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' },
      right:  { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    };
    const runs = tokenize(line, lang).map(t =>
      new TextRun({ text: t.text, font: 'Courier New', size: CODE_SIZE, color: t.color })
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
```

---

## 6. コールアウトブロック

```js
function callout(label, lines, type = 'note') {
  let bg = BLUE_BG, borderColor = BLUE_BORDER;
  if (type === 'warning') { bg = RED_BG;    borderColor = RED_BORDER; }

  // ⚠️ OOXML の pBdr は top → left → bottom → right の順が必須
  const leftBorder = {
    top:    { style: BorderStyle.NONE,  size: 0,  color: "FFFFFF" },
    left:   { style: BorderStyle.THICK, size: 12, color: borderColor },
    bottom: { style: BorderStyle.NONE,  size: 0,  color: "FFFFFF" },
    right:  { style: BorderStyle.NONE,  size: 0,  color: "FFFFFF" },
  };

  const result = [];
  if (label) {
    result.push(new Paragraph({
      children: [new TextRun({ text: `【${label}】`, font: "Meiryo UI", size: BODY_SIZE, bold: true, color: borderColor })],
      shading: { fill: bg, type: ShadingType.CLEAR },
      border: leftBorder,
      spacing: { before: 80, after: 0 },
      indent: { left: 200 },
    }));
  }
  for (const line of lines) {
    result.push(new Paragraph({
      children: parseInline(line, { baseColor: DARK, baseSize: BODY_SIZE, baseFont: "Meiryo UI" }),
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
    spacing: { before: 0, after: 80 },
    indent: { left: 200 },
  }));
  return result;
}
```

---

## 7. テーブル

Markdown のパイプテーブルを以下のスタイルに変換する。

- 1行目（ヘッダー）: 青背景・白文字・太字
- 奇数データ行: 白背景 `FFFFFF`
- 偶数データ行: 薄グレー背景 `F7F9FB`
- セル内テキストは `parseInline` でインライン要素を解析する

```js
function makeTable(headers, rows) {
  const colCount   = headers.length;
  const tableWidth = 9360;
  const colWidth   = Math.floor(tableWidth / colCount);
  const border     = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders    = { top: border, bottom: border, left: border, right: border };

  const makeCell = (text, bg, isHeader) => new TableCell({
    borders,
    width: { size: colWidth, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: isHeader
        ? [new TextRun({ text, font: "Meiryo UI", size: BODY_SIZE, bold: true, color: "FFFFFF" })]
        : parseInline(text, { baseColor: DARK, baseSize: BODY_SIZE, baseFont: "Meiryo UI" }),
    })],
  });

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: [
      new TableRow({ children: headers.map(h => makeCell(h, BLUE, true)) }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map(c => makeCell(c, ri % 2 === 0 ? "FFFFFF" : "F7F9FB", false))
        })
      ),
    ],
  });
}
```

---

## 8. 表紙ページ

`# 表紙` セクションのテーブルを解析し、以下のメタデータを取得する。

```js
const meta = {
  bookTitle:    '',  // 「教材タイトル」行の値
  chapterTitle: '',  // 「章タイトル」行の値
  // その他の行はすべて { label, value } の配列として保持
  extraRows:    [],
};
```

取得したメタデータを使い、以下のレイアウトで表紙ページを生成する。

```text
[中央揃え・青]      教材タイトル
[中央揃え・太字]    章タイトル
[中央揃え・グレー]  この章で作るもの
[中央揃え・青]      ────────────────────────────────────────────（区切り線）
```

表紙は `teamflow_pr01_highlighted.docx` の構造を参考に、独立したメタ情報テーブルではなく、短いタイトルブロックとして本文冒頭に置く。

---

## 9. ヘッダー・フッター

表紙テーブルから動的に取得した値を使う。

```js
// ヘッダー: 右寄せ「教材タイトル  |  章タイトル」
new Header({
  children: [new Paragraph({
    children: [new TextRun({
      text: `${meta.bookTitle}  |  ${meta.chapterTitle}`,
      font: "Meiryo UI", size: 16, color: GRAY,
    })],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
  })],
})

// フッター: 中央「教材タイトル  |  ページ / 総ページ」
new Footer({
  children: [new Paragraph({
    children: [
      new TextRun({ text: `${meta.bookTitle}  |  `, font: "Meiryo UI", size: 16, color: GRAY }),
      new TextRun({ children: [PageNumber.CURRENT],     font: "Meiryo UI", size: 16, color: GRAY }),
      new TextRun({ text: " / ",                        font: "Meiryo UI", size: 16, color: GRAY }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Meiryo UI", size: 16, color: GRAY }),
    ],
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
  })],
})
```

---

## 10. Document 組み立て

```js
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Meiryo UI", size: BODY_SIZE, color: DARK } },
    },
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbered",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size:   { width: 11906, height: 16838 },
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
      },
    },
    headers: { default: /* Headerオブジェクト */ },
    footers: { default: /* Footerオブジェクト */ },
    children: [ /* 変換した Paragraph / Table の配列 */ ],
  }],
});

const output = process.argv[3] || defaultOutputPath(input);

Packer.toBuffer(doc).then(buf => {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, buf);
  console.log(`Done! ${output}`);
});

function defaultOutputPath(input) {
  const parsed = path.parse(input);
  return path.join("docs", "generated_docx", `${parsed.name}.docx`);
}
```

---

## 11. スキップするコンテンツ

| 対象 | スキップ条件 |
|---|---|
| 目次セクション | `# 目次` から次の `#` 見出しまでの全行 |
| スクリーンショットプレースホルダー | `スクリーンショット挿入予定:` で始まる行と、その直後の連続する非空行 |
| テーブルセパレータ行 | `| --- |` / `| :--- |` 等のパターンにマッチする行 |

---

## 12. pBdr 順序バグへの対処（必須）

`docx` ライブラリが生成する `<w:pBdr>` の子要素順が OOXML 仕様（`top → left → bottom → right`）と異なる場合がある。
生成後に以下の Python スクリプトで修正する。

```python
import sys, zipfile, shutil
from lxml import etree

src = sys.argv[1] if len(sys.argv) > 1 else "output.docx"
tmp = f"{src}.fixed"
ns  = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
ORDER = ['top', 'left', 'bottom', 'right', 'bar', 'between']

with zipfile.ZipFile(src, 'r') as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == 'word/document.xml':
            tree = etree.fromstring(data)
            for pbdr in tree.iter(f'{{{ns}}}pBdr'):
                children  = list(pbdr)
                child_map = {c.tag.split('}')[1]: c for c in children}
                for c in children: pbdr.remove(c)
                for key in ORDER:
                    if key in child_map: pbdr.append(child_map[key])
            data = etree.tostring(tree, xml_declaration=True, encoding='UTF-8', standalone=True)
        zout.writestr(item, data)

shutil.move(tmp, src)
print("pBdr fixed")
```

---

## 13. 出力確認基準

1. `node gen.js <mdファイル>` でエラーなく完了し `docs/generated_docx/<元Markdownファイル名>.docx` が生成される
2. pBdr 修正スクリプト適用後、OOXML バリデーションが通過する
3. Word / LibreOffice で開いたとき以下が確認できる:
   - 表紙が教材タイトル・章タイトル・サブタイトル・区切り線付きで表示される
   - ヘッダー・フッターに教材タイトルと章タイトルが動的に表示される
   - H1 が青背景・白文字バナーで表示される
   - H2 が青文字・下線で表示される
   - 箇条書き（`-`）と番号付きリスト（`1.`）が両方正しく表示される
   - 本文・箇条書き・表セル内のインラインコードが等幅・グレー背景で表示される
   - コードブロックがグレー背景・青左ボーダー付きで表示される
   - Python / bash のシンタックスハイライトが適用されている
   - yaml / html は単色（ハイライトなし）で表示される
   - コールアウトが種別ごとの色ボーダーで表示される（注意=赤、補足/メモ=青）
   - テーブルのヘッダーが青背景・白文字で表示される
   - 目次セクションとスクリーンショットプレースホルダーが出力されない
