// Result card render karte waqt:
const targetUrl = result.sourceUrl || result.originalUrl;

let websiteLinkHtml = '';
if (targetUrl && targetUrl.startsWith('http') && !targetUrl.includes('google.com/search')) {
  // Agar valid source URL hai, tabhi link open ho
  websiteLinkHtml = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="open-website-btn">Open Original Website</a>`;
} else {
  // Agar URL nahi hai, toh Google search par bilkul na bhejein, button disable kar dein
  websiteLinkHtml = `<button type="button" disabled class="open-website-btn disabled" style="opacity: 0.6; cursor: not-allowed;">Source URL: NOT AVAILABLE</button>`;
}


