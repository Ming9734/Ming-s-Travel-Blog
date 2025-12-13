// ----------------------------
// post.js
// ----------------------------

// 取得 URL 中的 post id
function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id'); // post.html?id=123 → 123
}

// 初始化幻燈片
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

// 初始化文字分頁
function initTabs(tabs) {
  const tabsContainer = document.querySelector('.post-tabs');
  const contentContainer = document.querySelector('.post-tab-content-wrapper');
  if (!tabsContainer || !contentContainer || !tabs?.length) return;

  tabsContainer.innerHTML = '';
  contentContainer.innerHTML = '';

  tabs.forEach((tab, idx) => {
    // 建立 tab 按鈕
    const btn = document.createElement('button');
    btn.className = 'tab' + (idx === 0 ? ' active' : '');
    btn.textContent = tab.title;
    btn.dataset.tab = `tab-${idx}`;
    tabsContainer.appendChild(btn);

    // 建立 tab 內容
    const content = document.createElement('div');
    content.id = `tab-${idx}`;
    content.className = 'post-tab-content' + (idx === 0 ? ' active' : '');
    content.innerHTML = tab.content;
    contentContainer.appendChild(content);

    // 點擊切換
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab, .post-tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      content.classList.add('active');
    });
  });
}

// 顯示封面與淡出後載入內容
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.add('navbar-hidden'); // 隱藏導覽列

  const enterBtn = document.getElementById('enter-post');
  enterBtn?.addEventListener('click', () => {
    const cover = document.getElementById('post-cover');

    // 封面淡出
    cover.style.opacity = '0';
    cover.style.pointerEvents = 'none';

    setTimeout(() => {
      cover.remove();

      // 導覽列顯示
      if (navbar) navbar.classList.add('active');

      // 載入 post 資料
      loadPostContent();
    }, 600);
  });
});

// 載入 post JSON
function loadPostContent() {
  const postId = getPostIdFromURL();
  if (!postId) return;

  fetch(`data/post_${postId}.json`)
    .then(res => res.json())
    .then(post => {
      // 更新封面已經淡出，這裡只初始化幻燈片與文字
      initGallery(post.images);
      initTabs(post.tabs);
    })
    .catch(err => console.error('Failed to load post JSON', err));
}