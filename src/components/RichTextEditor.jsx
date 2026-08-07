import React, { useEffect, useRef } from 'react';
import { normalizeArticleBody } from '../lib/richText.js';

const fontOptions = [
  ['Default font', 'inherit'],
  ['Site serif', 'Georgia'],
  ['Arial', 'Arial'],
  ['Times New Roman', 'Times New Roman'],
  ['Verdana', 'Verdana'],
];

function ToolbarButton({ children, command, onCommand, title }) {
  return (
    <button
      type="button"
      className="rich-text-button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onCommand(command)}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, labelledBy }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastEmittedRef = useRef('');

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const normalized = normalizeArticleBody(value);
    if (normalized !== lastEmittedRef.current && editor.innerHTML !== normalized) {
      editor.innerHTML = normalized;
    }
  }, [value]);

  function rememberSelection() {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  function restoreSelection() {
    const range = savedRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function emitChange() {
    const html = normalizeArticleBody(editorRef.current?.innerHTML || '');
    lastEmittedRef.current = html;
    onChange(html);
    rememberSelection();
  }

  function runCommand(command, commandValue = null) {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
  }

  function addLink() {
    const url = window.prompt('Enter a web address (https://), email (mailto:), or telephone link (tel:).');
    if (!url) return;
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url.trim())) {
      window.alert('Use a full http://, https://, mailto:, or tel: address.');
      return;
    }
    runCommand('createLink', url.trim());
  }

  function addTable() {
    const rowCount = Number.parseInt(window.prompt('Number of table rows (1-10):', '3'), 10);
    const columnCount = Number.parseInt(window.prompt('Number of table columns (1-6):', '3'), 10);
    if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > 10
      || !Number.isInteger(columnCount) || columnCount < 1 || columnCount > 6) {
      window.alert('Choose 1-10 rows and 1-6 columns.');
      return;
    }
    const header = `<tr>${Array.from({ length: columnCount }, (_, index) => `<th scope="col">Heading ${index + 1}</th>`).join('')}</tr>`;
    const rows = Array.from({ length: rowCount }, () => `<tr>${'<td>Cell</td>'.repeat(columnCount)}</tr>`).join('');
    runCommand('insertHTML', `<table><thead>${header}</thead><tbody>${rows}</tbody></table><p><br></p>`);
  }

  function insertPastedContent(event) {
    event.preventDefault();
    const transfer = event.clipboardData;
    const html = transfer?.getData('text/html');
    const text = transfer?.getData('text/plain');
    const safeContent = html ? normalizeArticleBody(html) : normalizeArticleBody(text || '');
    if (safeContent) runCommand('insertHTML', safeContent);
  }

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-navy-900/15 bg-white/65 focus-within:border-navy-900/50 focus-within:ring-2 focus-within:ring-navy-900/15">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Article formatting">
        <select className="rich-text-select" aria-label="Text style" defaultValue="p" onMouseDown={rememberSelection} onChange={(event) => runCommand('formatBlock', event.target.value)}>
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
        </select>
        <select className="rich-text-select" aria-label="Font family" defaultValue="inherit" onMouseDown={rememberSelection} onChange={(event) => runCommand('fontName', event.target.value)}>
          {fontOptions.map(([label, font]) => <option key={label} value={font}>{label}</option>)}
        </select>
        <select className="rich-text-select" aria-label="Font size" defaultValue="3" onMouseDown={rememberSelection} onChange={(event) => runCommand('fontSize', event.target.value)}>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="6">Extra large</option>
        </select>
        <ToolbarButton command="bold" onCommand={runCommand} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton command="italic" onCommand={runCommand} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton command="underline" onCommand={runCommand} title="Underline"><u>U</u></ToolbarButton>
        <ToolbarButton command="strikeThrough" onCommand={runCommand} title="Strikethrough"><s>S</s></ToolbarButton>
        <label className="rich-text-color" title="Text color">
          <span>Color</span>
          <input type="color" aria-label="Text color" defaultValue="#041e42" onMouseDown={rememberSelection} onChange={(event) => runCommand('foreColor', event.target.value)} />
        </label>
        <ToolbarButton command="insertUnorderedList" onCommand={runCommand} title="Bulleted list">Bullets</ToolbarButton>
        <ToolbarButton command="insertOrderedList" onCommand={runCommand} title="Numbered list">Numbers</ToolbarButton>
        <ToolbarButton command="justifyLeft" onCommand={runCommand} title="Align left">Left</ToolbarButton>
        <ToolbarButton command="justifyCenter" onCommand={runCommand} title="Align center">Center</ToolbarButton>
        <ToolbarButton command="justifyRight" onCommand={runCommand} title="Align right">Right</ToolbarButton>
        <button type="button" className="rich-text-button" onMouseDown={(event) => event.preventDefault()} onClick={addLink}>Link</button>
        <button type="button" className="rich-text-button" onMouseDown={(event) => event.preventDefault()} onClick={addTable}>Table</button>
        <ToolbarButton command="undo" onCommand={runCommand} title="Undo">Undo</ToolbarButton>
        <ToolbarButton command="redo" onCommand={runCommand} title="Redo">Redo</ToolbarButton>
        <ToolbarButton command="removeFormat" onCommand={runCommand} title="Clear formatting">Clear</ToolbarButton>
      </div>
      <div
        ref={editorRef}
        className="rich-text-editor article-rich-text"
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-labelledby={labelledBy}
        data-placeholder="Write and format the article here."
        suppressContentEditableWarning
        onInput={emitChange}
        onPaste={insertPastedContent}
        onDrop={(event) => event.preventDefault()}
        onBlur={rememberSelection}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
      />
    </div>
  );
}
