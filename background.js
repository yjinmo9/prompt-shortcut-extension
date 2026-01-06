// Background service worker for Prompt Shortcut extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompt Shortcut installed');

  // Create context menu for saving selected text as prompt
  chrome.contextMenus.create({
    id: 'save-as-prompt',
    title: 'Save as Prompt',
    contexts: ['selection'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-as-prompt' && info.selectionText) {
    // Open popup with pre-filled content
    chrome.storage.local.set({
      pendingPrompt: {
        content: info.selectionText,
        timestamp: Date.now(),
      },
    });

    // Open the extension popup
    chrome.action.openPopup();
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-prompt-selector') {
    chrome.action.openPopup();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INSERT_PROMPT') {
    // Forward to active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INSERT_TEXT',
          text: message.text,
        });
      }
    });
  }
});

