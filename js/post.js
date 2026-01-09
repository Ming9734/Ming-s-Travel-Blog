
document.addEventListener('DOMContentLoaded', () => {
  // --- 初始化設置 ---
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.add('navbar-hidden'); 

  const postLayout = document.querySelector('.post-layout');

  // --- 獲取文章 ID ---
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    console.error('❌ No post ID in URL');
    return;
  }

  fetch(`data/post_${postId}.json`)
    .then(response => response.json())
    .then(post => {
      if (!post) {
        return console.error('❌ No matching post data found');
      }

      // --- 設置封面視覺元素 ---
      const coverImg = document.getElementById('cover-image');
      if (coverImg) coverImg.src = post.cover;

      const coverBg = document.querySelector('.cover-bg');
      if (coverBg) coverBg.style.backgroundImage = `url("${post.cover}")`;

      // --- 設置封面文字 ---
      document.getElementById('cover-title').textContent = post.title;
      document.getElementById('cover-subtitle').textContent = post.subtitle;

      // --- 延遲浮現玻璃卡片 (Overlay) ---
      const overlay = document.querySelector('.cover-overlay');
      if (overlay) {
        overlay.classList.remove('is-visible'); 
        setTimeout(() => overlay.classList.add('is-visible'), 1000); 
      }

      // --- 幻燈片功能 (最終版) ---
      let index = 0;
      const galleryImg = document.getElementById('gallery-img');
      const galleryFrame = document.querySelector('.gallery-frame'); // 獲取父容器

      // 共用函式：更新圖片和背景
      function updateGalleryImage(newIndex, imagesArray) {
          index = newIndex;
          const imageUrl = imagesArray[index]; 

          if (galleryImg) {
              galleryImg.src = imageUrl;
          }
          if (galleryFrame) {
              // 修正：直接設定 galleryFrame 元素的背景圖片
              galleryFrame.style.backgroundImage = `url("${imageUrl}")`;
          }
      }

      // 初始化幻燈片
      if (galleryImg && post.images && post.images.length > 0) {
          updateGalleryImage(0, post.images);
      }

      const prevBtn = document.querySelector('.prev');
      const nextBtn = document.querySelector('.next');

      if (prevBtn) {
        prevBtn.onclick = () => {
          const newIndex = (index - 1 + post.images.length) % post.images.length;
          updateGalleryImage(newIndex, post.images);
        };
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          const newIndex = (index + 1) % post.images.length;
          updateGalleryImage(newIndex, post.images);
        };
      }
      // --- 幻燈片功能結束 ---


      // --- 設置文字區塊 Tabs ---
      const tabsContainer = document.getElementById('post-tabs');
      const contentsContainer = document.getElementById('post-tab-contents');

      if (tabsContainer && contentsContainer) {
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

        document.querySelectorAll('.tab').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.tab, .post-tab-content')
              .forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            contentsContainer.children[btn.dataset.index].classList.add('active');
          });
        });
      }
    })
    .catch(err => console.error('❌ JSON 載入錯誤:', err));

  // --- 進入內文事件 (Enter Story Button) - 序列動畫 ---
  document.getElementById('enter-post')?.addEventListener('click', () => {
    const cover = document.getElementById('post-cover');
    const overlay = document.querySelector('.cover-overlay'); // 確保在這裡再次獲取 overlay 元素

    // Step 1: 立即隱藏毛玻璃卡片 (overlay) (0.5s 過渡)
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }

    // Step 2: 等待卡片隱藏後，觸發封面放大動畫 (1.5s 過渡)
    setTimeout(() => {
        cover.style.transform = 'scale(1.5)'; 
        cover.style.opacity = '0';            
    }, 1000); 


    // Step 3: 等待所有動畫結束後再切換到內頁
setTimeout(() => {
    // 1. 顯示容器：此時 CSS 已經設定 opacity: 0，所以畫面依然是乾淨的
    postLayout.style.display = "flex"; // 確保是 flex 佈局
    
    // 2. 顯示導覽列
    if (navbar) {
        navbar.classList.remove('navbar-hidden'); // 移除隱藏類
        navbar.classList.add('active'); 
    }

    // 獲取元素
    const galleryElement = document.querySelector('.post-gallery');
    const textElement = document.querySelector('.post-text');

    // 3. 關鍵：使用 requestAnimationFrame 確保瀏覽器已完成 layout 計算
    requestAnimationFrame(() => {
        // 給予極短的延遲，確保 transition 能被偵測到
        setTimeout(() => {
            // 相簿先出
            if (galleryElement) {
                galleryElement.classList.add('animate-entry');
            }
            
            // 文字後出 (Stagger Effect 增加質感)
            if (textElement) {
                setTimeout(() => {
                    textElement.classList.add('animate-entry');
                }, 350); // 延遲 0.35 秒，層次感最美
            }
        }, 50); 
    });

    // 4. 最後將已完全透明的封面移除
    setTimeout(() => {
        if (cover) cover.remove();
    }, 1500); 
    
}, 2200); // 這裡的時間稍微縮短一點點（原 2500），讓節奏更緊湊
  });
});
