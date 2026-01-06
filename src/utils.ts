export function insertAtCursor(text: string): void {
  const el = document.activeElement as HTMLElement;

  if (!el) return;

  // Handle textarea and input elements
  if (
    el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' &&
      ['text', 'search', 'email', 'url', 'tel'].includes((el as HTMLInputElement).type))
  ) {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const value = input.value;

    input.value = value.slice(0, start) + text + value.slice(end);
    input.selectionStart = input.selectionEnd = start + text.length;

    // Trigger events for frameworks (React, Vue, etc.)
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.focus();
    return;
  }

  // Handle contenteditable elements
  if (el.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  }
}
