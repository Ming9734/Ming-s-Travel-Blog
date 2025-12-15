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
        overlay.classList.remove('is-visible'); 
        setTimeout(() => overlay.classList.add('is-visible'), 1000);
      }

      // --- 幻燈片功能 (已修復並優化) ---
      let index = 0;
      const galleryImg = document.getElementById('gallery-img');
      const galleryFrame = document.querySelector('.gallery-frame'); // 獲取父容器

      // 共用函式：更新圖片和背景變數
      function updateGalleryImage(newIndex, imagesArray) {
          index = newIndex;
          if (galleryImg) {
              galleryImg.src = imagesArray[index];
          }
          if (galleryFrame) {
              // ✨ 設置 CSS 變數，讓 CSS 中的 ::before 使用它來模糊背景 ✨
              galleryFrame.style.setProperty('--current-image-url', `url("${imagesArray[index]}")`);
          }
      }

      // 初始化幻燈片
      if (galleryImg && post.images && post.images.length > 0) {
          updateGalleryImage(0, post.images);
      }

      const prevBtn = document.querySelector('.prev');
      const nextBtn = document.querySelector('.next');

      if (prevBtn) prevBtn.onclick = () => {
        const newIndex = (index - 1 + post.images.length) % post.images.length;
        updateGalleryImage(newIndex, post.images);
      };
      if (nextBtn) nextBtn.onclick = () => {
        const newIndex = (index + 1) % post.images.length;
        updateGalleryImage(newIndex, post.images);
      };
      // --- 幻燈片功能結束 ---


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

  // 將原有的 Enter Story 區塊替換為以下程式碼：
  // Enter Story
  document.getElementById('enter-post')?.addEventListener('click', () => {
    const cover = document.getElementById('post-cover');
    
    // 淡出封面
    cover.style.opacity = '0';
    cover.style.pointerEvents = 'none';

    // 等待封面淡出後執行
    setTimeout(() => {
      cover.remove(); // 從 DOM 中移除封面

      if (navbar) navbar.classList.add('active'); // 顯示導覽列

      // 顯示內頁佈局容器
      postLayout.style.display = 'grid';
      // 獲取左右兩欄元素 (請確保這裡的選擇器與您的 HTML 結構一致)
      const galleryElement = document.querySelector('.post-gallery');
      const textElement = document.querySelector('.post-text');

      // ✨ 開始交錯進場動畫 ✨
      
      // 左側相片集立即開始動畫
      if (galleryElement) {
        galleryElement.classList.add('animate-entry');
      }

      // 右側文字區塊延遲 200ms 開始動畫
      if (textElement) {
        setTimeout(() => {
          textElement.classList.add('animate-entry');
        }, 200); 
      }
      
    }, 700); // 700ms 應與 CSS opacity transition 時間一致
  });
});
