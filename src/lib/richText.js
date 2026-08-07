import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li', 'a', 'hr',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'div', 'span', 'font',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'face', 'size', 'color', 'align',
  'colspan', 'rowspan', 'scope',
];

export function isRichText(value) {
  return /<\/?(?:p|br|strong|b|em|i|u|s|strike|sub|sup|h[2-4]|blockquote|ul|ol|li|a|hr|table|thead|tbody|tfoot|tr|th|td|div|span|font)\b/i.test(value || '');
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function plainTextToHtml(value) {
  return String(value || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function preserveSafeEditorAlignment(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('[style]').forEach((element) => {
    const alignment = element.style.textAlign;
    if (['left', 'center', 'right', 'justify'].includes(alignment)) {
      element.setAttribute('align', alignment);
    }
    element.removeAttribute('style');
  });
  return template.innerHTML;
}

export function normalizeArticleBody(value) {
  const html = isRichText(value) ? String(value || '') : plainTextToHtml(value);
  return DOMPurify.sanitize(preserveSafeEditorAlignment(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function richTextToPlainText(value) {
  if (!value) return '';
  if (!isRichText(value)) return String(value).trim();

  const container = document.createElement('div');
  container.innerHTML = normalizeArticleBody(value);
  return (container.textContent || '').replace(/\s+/g, ' ').trim();
}

export function articleDescription(body, maxLength = 155) {
  return richTextToPlainText(body).slice(0, maxLength);
}
