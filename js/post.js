// ----------------- 封面與 navbar -----------------
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();
    if (navbar) navbar.classList.add('active'); // 顯示 navbar
    initGallery(currentPost.images);
    initTabs(currentPost.tabs);
  }, 600);
});

// ----------------- 幻燈片 -----------------
let currentPost = {}; // 後續會用 fetch 讀取資料庫填入
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

  function slideTo(newIndex, direction) {
    const oldImg = img.cloneNode();
    oldImg.src = img.src;
    gallery.querySelector('.gallery-frame').appendChild(oldImg);

    oldImg.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');

    img.src = images[newIndex];
    img.classList.remove('slide-in-left', 'slide-in-right');

    requestAnimationFrame(() => {
      img.classList.add(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
    });

    setTimeout(() => oldImg.remove(), 500);
    index = newIndex;
  }

  gallery.querySelector('.prev').onclick = () => {
    const newIndex = (index - 1 + images.length) % images.length;
    slideTo(newIndex, 'prev');
  };

  gallery.querySelector('.next').onclick = () => {
    const newIndex = (index + 1) % images.length;
    slideTo(newIndex, 'next');
  };
}

// ----------------- 文字標籤 -----------------
function initTabs(tabs) {
  const tabContainer = document.querySelector('.post-tabs');
  const contentContainer = document.querySelector('.post-tab-content-container');
  if (!tabContainer || !contentContainer) return;

  tabContainer.innerHTML = '';
  contentContainer.innerHTML = '';

  tabs.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = `tab${i}`;
    btn.textContent = t.title;
    tabContainer.appendChild(btn);

    const content = document.createElement('div');
    content.className = 'post-tab-content';
    content.id = `tab${i}`;
    content.innerHTML = t.content;
    contentContainer.appendChild(content);

    btn.addEventListener('click', () => {
      tabContainer.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      contentContainer.querySelectorAll('.post-tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      content.classList.add('active');
    });

    // 第一個預設 active
    if (i === 0) {
      btn.classList.add('active');
      content.classList.add('active');
    }
  });
}

// ----------------- 載入資料庫 -----------------
fetch('data/post.json') // 每篇文章單獨的資料
  .then(r => r.json())
  .then(data => {
    currentPost = data;

    document.getElementById('cover-image').src = data.cover;
    document.getElementById('cover-title').textContent = data.title;
    document.getElementById('cover-subtitle').textContent = data.subtitle;

    // 建立幻燈片與文字區 DOM
    const postLayout = document.createElement('div');
    postLayout.className = 'post-layout';
    postLayout.innerHTML = `
      <div class="post-gallery"></div>
      <div class="post-text">
        <div class="post-tabs"></div>
        <div class="post-tab-content-container"></div>
      </div>
    `;
    document.body.appendChild(postLayout);
  });
