chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INSERT_TEXT") {
    insertAtCursor(message.text);
  }
});

function insertAtCursor(text) {
  const el = document.activeElement;

  if (!el) return;

  // textarea / input
  if (
    el.tagName === "TEXTAREA" ||
    (el.tagName === "INPUT" && (el.type === "text" || el.type === "search" || el.type === "email" || el.type === "url"))
  ) {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value;

    el.value = value.slice(0, start) + text + value.slice(end);
    el.selectionStart = el.selectionEnd = start + text.length;

    // Trigger input event to make sure sites like ChatGPT/Notion detect the change
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    return;
  }

  // contenteditable
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
  }
}
