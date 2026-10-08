/**
 * Resilient cross-browser clipboard utility with multi-tier fallback.
 * Works even inside restrictive iframes, mobile browsers, and insecure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Method 1: Modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText blocked or failed, trying fallback...', err);
    }
  }

  // Method 2: Fallback via hidden DOM textarea + document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Prevent scrolling to bottom of page
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      return true;
    }
  } catch (err) {
    console.warn('execCommand copy fallback failed:', err);
  }

  return false;
}
