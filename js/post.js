// 1️⃣ 封面與導覽列
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');

  // 封面淡出
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();

    // 導覽列顯示
    if (navbar) navbar.classList.remove('navbar-hidden');

    // 顯示文章主體
    document.querySelector('.post-container').style.display = 'flex';
  }, 600);
});

// 2️⃣ 讀取單篇文章資料
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

fetch(`data/post_${postId}.json`)
  .then(r => r.json())
  .then(post => {
    // 封面
    document.getElementById('cover-image').src = post.cover;
    document.getElementById('cover-title').textContent = post.title;
    document.getElementById('cover-subtitle').textContent = `${post.city}, ${post.country}`;

    // 幻燈片
    initGallery(post.images);

    // 文字內容
    initTabs(post.contents);
  });

// 3️⃣ 幻燈片初始化
function initGallery(images) {
  const gallery = document.querySelector('.post-gallery');
  if (!gallery || !images?.length) return;

  let index = 0;

  gallery.innerHTML = `
    <div class="gallery-frame">
      <img src="${images[0]}" id="gallery-img">
      <button class="gallery-btn prev">‹</button>
      <button class="gallery-btn next">›</button>
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

// 4️⃣ 多個文字 tab
function initTabs(contents) {
  const tabsContainer = document.querySelector('.tabs');
  const tabContents = document.querySelector('.tab-contents');

  tabsContainer.innerHTML = '';
  tabContents.innerHTML = '';

  contents.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (i === 0 ? ' active' : '');
    btn.dataset.tab = `tab-${i}`;
    btn.textContent = c.title;
    tabsContainer.appendChild(btn);

    const div = document.createElement('div');
    div.id = `tab-${i}`;
    div.className = 'tab-content' + (i === 0 ? ' active' : '');
    div.innerHTML = c.html;
    tabContents.appendChild(div);
  });

  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab, .tab-content')
        .forEach(el => el.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}