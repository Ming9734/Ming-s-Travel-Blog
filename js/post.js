// 取得文章 ID（例如 URL query: ?id=post1）
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id') || 'post1';

// 導覽列初始隱藏
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

const postCover = document.getElementById('post-cover');
const coverImage = document.getElementById('cover-image');
const coverTitle = document.getElementById('cover-title');
const coverSubtitle = document.getElementById('cover-subtitle');
const postLayout = document.getElementById('post-content');
const enterBtn = document.getElementById('enter-post');

// 讀取單篇文章資料
fetch(`data/${postId}.json`)
  .then(r => r.json())
  .then(postData => {

    // 設定封面
    coverImage.src = postData.cover;
    coverTitle.textContent = postData.title;
    coverSubtitle.textContent = postData.location;

    // 點擊 Enter Story
    enterBtn.addEventListener('click', () => {

      // 封面淡出
      postCover.style.opacity = '0';
      postCover.style.pointerEvents = 'none';
      postCover.querySelector('.cover-overlay').style.opacity = '0';

      setTimeout(() => {
        postCover.remove();

        // 導覽列淡入
        if (navbar) navbar.classList.add('active');

        // 顯示 Post Layout
        postLayout.style.display = 'grid';

        // 初始化幻燈片 & 文字 Tab
        initGallery(postData.images);
        initTabs(postData.tabs);

      }, 600);
    });

  })
  .catch(err => console.error('Failed to load post data:', err));

// 幻燈片初始化
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

  function showImage(newIndex) {
    img.classList.add('fade-out');
    setTimeout(() => {
      index = newIndex;
      img.src = images[index];
      img.classList.remove('fade-out');
    }, 400);
  }

  gallery.querySelector('.prev').onclick = () => {
    showImage((index - 1 + images.length) % images.length);
  };
  gallery.querySelector('.next').onclick = () => {
    showImage((index + 1) % images.length);
  };
}

// Tab 初始化
function initTabs(tabs) {
  const tabsContainer = document.querySelector('.post-tabs');
  const contentWrapper = document.querySelector('.post-tab-content-wrapper');

  if (!tabsContainer || !contentWrapper || !tabs?.length) return;

  tabsContainer.innerHTML = '';
  contentWrapper.innerHTML = '';

  tabs.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.textContent = tab.title;
    btn.dataset.tab = `tab-${i}`;
    if (i === 0) btn.classList.add('active');
    tabsContainer.appendChild(btn);

    const contentDiv = document.createElement('div');
    contentDiv.id = `tab-${i}`;
    contentDiv.className = 'post-tab-content';
    if (i === 0) contentDiv.classList.add('active');
    contentDiv.textContent = tab.content;
    contentWrapper.appendChild(contentDiv);

    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab, .post-tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      contentDiv.classList.add('active');
    });
  });
}
