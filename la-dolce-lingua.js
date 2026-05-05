const markdownFilePath = 'la-dolce-lingua.md';
let currentLang = 'en';

function extractSectionMarkdown(content, section, lang) {
  const sectionRegex = new RegExp(`<!--\\s*section:\\s*${section}\\s*-->([\\s\\S]*?)(?=<!--\\s*section:|$)`, 'i');
  const sectionMatch = content.match(sectionRegex);
  if (!sectionMatch) return '';

  const sectionContent = sectionMatch[1];
  const langRegex = new RegExp(`<!--\\s*lang:\\s*${lang}\\s*-->([\\s\\S]*?)(?=<!--\\s*lang:|$)`, 'i');
  const langMatch = sectionContent.match(langRegex);
  return langMatch ? langMatch[1].trim() : '';
}

async function renderSection(sectionId, sectionName) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  try {
    const response = await fetch(markdownFilePath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawMd = await response.text();
    const md = extractSectionMarkdown(rawMd, sectionName, currentLang);
    const rendered = marked.parse(md);
    element.innerHTML = sectionName === 'table'
      ? `<div class="table-wrap">${rendered}</div>`
      : rendered;
  } catch (error) {
    console.error(`Failed to load ${sectionName} markdown:`, error);
    element.innerHTML = `<p>Unable to load ${sectionName} content at this time.</p>`;
  }
}

function applyLang(lang) {
  document.querySelectorAll('[data-en]').forEach(el => {
    const txt = el.getAttribute('data-' + lang);
    if (txt !== null) {
      if (el.tagName === 'H2' || el.tagName === 'H3') {
        el.innerHTML = txt;
      } else {
        el.textContent = txt;
      }
    }
  });
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-it').classList.toggle('active', lang === 'it');
  document.documentElement.lang = lang === 'it' ? 'it' : 'en';
}

function setLang(lang) {
  currentLang = lang;
  applyLang(lang);
  // Re-render all sections
  renderSection('venue-md', 'venue');
  renderSection('method-content', 'method');
  renderSection('ages-content', 'ages');
  renderSection('table-content', 'table');
  renderSection('games-content', 'games');
  renderSection('faq-content', 'faq');
}

function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

async function initPage() {
  applyLang(currentLang);
  await Promise.all([
    renderSection('venue-md', 'venue'),
    renderSection('method-content', 'method'),
    renderSection('ages-content', 'ages'),
    renderSection('table-content', 'table'),
    renderSection('games-content', 'games'),
    renderSection('faq-content', 'faq')
  ]);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
