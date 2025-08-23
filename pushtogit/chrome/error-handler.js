// Error handling
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  showError('Script error: ' + event.error?.message);
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled rejection:', event.reason);
  showError('Promise rejection: ' + event.reason?.message);
});

function showError(message) {
  const loadingEl = document.getElementById('loading-fallback');
  const errorEl = document.getElementById('error-fallback');
  const messageEl = document.getElementById('error-message');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) {
    errorEl.classList.add('show');
    if (messageEl) messageEl.textContent = message;
  }
}

// Hide loading after React loads
function hideLoading() {
  const loadingEl = document.getElementById('loading-fallback');
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

// Export for React to use
window.hideLoading = hideLoading;
window.showError = showError; 