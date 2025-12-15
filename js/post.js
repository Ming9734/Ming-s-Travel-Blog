document.addEventListener('DOMContentLoaded', () => {
  // ... (檔案開頭的其他程式碼保持不變) ...
  const postLayout = document.querySelector('.post-layout');

  // ... (Fetch 獲取資料的部分保持不變) ...
  fetch(`data/post_${postId}.json`)
    .then(response => response.json())
    .then(post => {
      // ... (設置封面圖片、文字、幻燈片功能的程式碼保持不變) ...
      // 確保這裡有獲取到 overlay 元素
      const overlay = document.querySelector('.cover-overlay');

      // --- 進入內文事件 (Enter Story Button) - 序列動畫 ---
      document.getElementById('enter-post')?.addEventListener('click', () => {
        const cover = document.getElementById('post-cover');

        // Step 1: 立即隱藏毛玻璃卡片 (overlay)
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            // 假設您 CSS 中 overlay 的 transition 時間為 0.3s (300ms)
        }

        // Step 2: 等待卡片隱藏後，觸發封面放大動畫
        setTimeout(() => {
            // 應用放大效果並淡出 (持續 1000ms, 定義在 CSS .post-cover)
            cover.style.transform = 'scale(1.5)'; 
            cover.style.opacity = '0';            
        }, 300); // 300ms 後開始放大動畫 (等待 overlay 消失)


        // Step 3: 等待所有動畫結束後再切換到內頁
        setTimeout(() => {
          // 顯示內頁佈局容器
          postLayout.style.display = 'grid';
          if (navbar) navbar.classList.add('active'); 

          // 獲取左右兩欄元素，開始交錯進場動畫
          const galleryElement = document.querySelector('.post-gallery');
          const textElement = document.querySelector('.post-text');

          setTimeout(() => {
              if (galleryElement) {
                galleryElement.classList.add('animate-entry');
              }
              if (textElement) {
                setTimeout(() => {
                  textElement.classList.add('animate-entry');
                }, 200); 
              }
          }, 50);
          
          // 最後，等待所有動畫結束後，將封面從 DOM 中移除
          setTimeout(() => {
            cover.remove();
          }, 700); // 確保所有內頁動畫都跑完了再移除
          
        }, 1300); // 1300ms = 300ms(卡片隱藏結束) + 1000ms(封面放大結束)
      });

    })
    .catch(err => console.error('❌ JSON 載入錯誤:', err));
});
