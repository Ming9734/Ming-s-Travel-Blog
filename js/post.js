document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.add('navbar-hidden');

  const postLayout = document.querySelector('.post-layout');

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  if (!postId) {
    console.error('❌ No post ID in URL');
    return;
  }

  fetch(`data/post_${postId}.json`)
    .then(r => r.json())
    .then(post => {
      if (!post) return console.error('❌ No matching post');

      // 封面前景圖
      const coverImg = document.getElementById('cover-image');
      if (coverImg) coverImg.src = post.cover;

      // 背景模糊圖
      const coverBg = document.querySelector('.cover-bg');
      if (coverBg) coverBg.style.backgroundImage = `url("${post.cover}")`;

      // 文字
      document.getElementById('cover-title').textContent = post.title;
      document.getElementById('cover-subtitle').textContent = post.subtitle;

      // 延遲浮現 overlay
      const overlay = document.querySelector('.cover-overlay');
      if (overlay) {
        overlay.classList.remove('is-visible'); // 一開始隱藏
        setTimeout(() => overlay.classList.add('is-visible'), 2000); // 2秒後浮現
      }

      // 在 post.js 中找到這個區塊：

// 幻燈片
let index = 0;
const galleryImg = document.getElementById('gallery-img');
// ✨ 新增這行：獲取圖片的父容器 ✨
const galleryFrame = document.querySelector('.gallery-frame'); 


// 創建一個共用的函式來更新圖片和背景
function updateGalleryImage(newIndex, imagesArray) {
    index = newIndex;
    if (galleryImg) {
        galleryImg.src = imagesArray[index];
    }
    // ✨ 新增：同時更新容器的背景圖片，以實現模糊延伸效果 ✨
    if (galleryFrame) {
        galleryFrame.style.backgroundImage = `url("${imagesArray[index]}")`;
        // 可以選擇在這裡增加一個 filter 來預先模糊背景圖
        // galleryFrame.style.filter = 'blur(10px) brightness(0.8)'; 
    }
}


// 在 fetch 的 .then 區塊內，將圖片初始化設置替換為新函式：

/* 原始碼：
if (galleryImg && post.images.length) galleryImg.src = post.images[index]; 
*/

// ✨ 替換為：
if (galleryImg && post.images && post.images.length > 0) {
    updateGalleryImage(0, post.images);
}


// 更新按鈕的 onclick 事件處理器，使用新函式：

if (prevBtn) prevBtn.onclick = () => {
    const newIndex = (index - 1 + post.images.length) % post.images.length;
    updateGalleryImage(newIndex, post.images); // 使用新函式
};

if (nextBtn) nextBtn.onclick = () => {
    const newIndex = (index + 1) % post.images.length;
    updateGalleryImage(newIndex, post.images); // 使用新函式
};

      // 文字區塊 tabs
      const tabsContainer = document.getElementById('post-tabs');
      const contentsContainer = document.getElementById('post-tab-contents');

      post.texts.forEach((txt, i) => {
        const tab = document.createElement('button');
        tab.className = 'tab';
        tab.textContent = txt.label;
        tab.dataset.index = i;
        if (i === 0) tab.classList.add('active');
        tabsContainer.appendChild(tab);

        const div = document.createElement('div');
        div.className = 'post-tab-content';
        if (i === 0) div.classList.add('active');
        div.innerHTML = txt.content;
        contentsContainer.appendChild(div);
      });

      // tab 切換事件
      document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tab, .post-tab-content')
            .forEach(el => el.classList.remove('active'));
          btn.classList.add('active');
          contentsContainer.children[btn.dataset.index].classList.add('active');
        });
      });
    })
    .catch(err => console.error('❌ JSON 載入錯誤:', err));

  // Enter Story
  document.getElementById('enter-post')?.addEventListener('click', () => {
    const cover = document.getElementById('post-cover');
    cover.style.opacity = '0';
    cover.style.pointerEvents = 'none';

    setTimeout(() => {
      cover.remove();

      if (navbar) navbar.classList.add('active');

      postLayout.style.display = 'grid';
      postLayout.style.opacity = '0';
      setTimeout(() => postLayout.style.opacity = '1', 100);
    }, 700);
  });
});
