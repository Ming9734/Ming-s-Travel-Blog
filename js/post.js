// ------------------- 導覽列隱藏 -------------------
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

// ------------------- 封面淡出 -------------------
document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();
    if (navbar) navbar.classList.add('active');
  }, 600);

  loadPostContent();
});

// ------------------- 載入 Post Detail -------------------
function loadPostContent() {
  fetch('data/post-detail.json')
    .then(res => res.json())
    .then(post => {
      initGallery(post.images);
      initTabs(post.tabs);
    });
}

// ------------------- 幻燈片 -------------------
function initGallery(images) {
  const gallery = document.querySelector('.post-gallery');
  if (!gallery || !images?.length) return;

  let index = 0;
  gallery.innerHTML = `
    <div class="gallery-frame">
      <img src="${images[0]}" id="gallery-img">
      <div class="gallery-controls">
        <button class="prev">‹</button>
        <button class="next">›</button>
      </div>
    </div>
  `;

  const img = gallery.querySelector('#gallery-img');

  gallery.querySelector('.prev').onclick = () => {
    index = (index - 1 + images.length) % images.length;
    img.src = images[index];
  };

  gallery.querySelector('.next').onclick = () => {
    index = (index + 1) % images.length;
    img.src = images[index];
  };
}

// ------------------- 文字標籤切換 -------------------
function initTabs(tabs) {
  const tabsContainer = document.querySelector('.post-tabs');
  const contentsContainer = document.querySelector('.post-tab-contents');

  if (!tabsContainer || !contentsContainer) return;

  tabs.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = `tab-${i}`;
    btn.textContent = tab.title;
    if (i === 0) btn.classList.add('active');
    tabsContainer.appendChild(btn);

    const content = document.createElement('div');
    content.className = 'post-tab-content';
    content.id = `tab-${i}`;
    content.innerHTML = tab.content;
    if (i === 0) content.classList.add('active');
    contentsContainer.appendChild(content);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab, .post-tab-content')
        .forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      content.classList.add('active');
    });
  });
}