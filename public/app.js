document.addEventListener('click', (e) => {
  const target = e.target.closest('.open-website-btn');
  if (target) {
    const href = target.getAttribute('href');
    if (!href || href.includes('google.com/search') || href.includes('NOT%20AVAILABLE')) {
      e.preventDefault();
      alert('Source URL is not available from grounding metadata.');
    }
  }
});
