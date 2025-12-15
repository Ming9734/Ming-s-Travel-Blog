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

    // 啟動資料獲取
    fetch(`data/post_${postId}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(post => {
            if (!post) {
                return console.error('❌ No matching post data found');
            }

            // --- 設置封面視覺元素 ---
            const coverImg = document.getElementById('cover-image');
            if (coverImg) coverImg.src = post.cover; // 檢查圖片路徑是否正確

            const coverBg = document.querySelector('.cover-bg');
            if (coverBg) coverBg.style.backgroundImage = `url("${post.cover}")`;

            document.getElementById('cover-title').textContent = post.title;
            document.getElementById('cover-subtitle').textContent = post.subtitle;

            // --- 卡片進場控制 (延遲 1000ms 啟動，時長 1.8s 由 CSS 控制) ---
            const overlay = document.querySelector('.cover-overlay');
            if (overlay) {
                setTimeout(() => {
                    overlay.classList.add('is-visible');
                }, 1000);
            }

            // --- 幻燈片功能 (保持不變) ---
            let index = 0;
            const galleryImg = document.getElementById('gallery-img');
            const galleryFrame = document.querySelector('.gallery-frame');

            function updateGalleryImage(newIndex, imagesArray) {
                index = newIndex;
                const imageUrl = imagesArray[index];
                if (galleryImg) galleryImg.src = imageUrl;
                if (galleryFrame) galleryFrame.style.backgroundImage = `url("${imageUrl}")`;
            }

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


            // --- 設置文字區塊 Tabs (保持不變) ---
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


            // ==============================================================
            // 🌟 點擊事件：卡片淡出 (0.3s) -> 封面放大 (1.5s) -> 內頁切換 🌟
            // ==============================================================
            document.getElementById('enter-post')?.addEventListener('click', () => {

                const cover = document.getElementById('post-cover');
                const overlayElement = document.querySelector('.cover-overlay');

                // 定義動畫時間 (與 CSS 嚴格同步)
                const CARD_FADE_OUT_MS = 300;
                const COVER_ZOOM_DURATION_MS = 1500;
                const TOTAL_DELAY_MS = CARD_FADE_OUT_MS + COVER_ZOOM_DURATION_MS;

                // Step 1: 啟動卡片快速淡出 (0.3s CSS 過渡)
                if (overlayElement) {
                    overlayElement.style.opacity = '0';
                    overlayElement.style.pointerEvents = 'none';
                }

                // Step 2: 等待卡片淡出完成，然後啟動封面放大 (1.5s CSS 過渡)
                setTimeout(() => {
                    cover.style.transform = 'scale(1.5)';
                    cover.style.opacity = '0';
                }, CARD_FADE_OUT_MS);

                // Step 3: 等待所有動畫結束後，切換到內頁
                setTimeout(() => {
                    // 顯示內頁佈局容器
                    if (postLayout) {
                        postLayout.style.display = 'grid'; // 讓它佔據空間
                        postLayout.style.opacity = '1';   // ✨ 確保 post-layout 本身是可見的 ✨
                    }
                    
                    // 顯示導覽列
                    if (navbar) {
                        navbar.classList.remove('navbar-hidden');
                        navbar.classList.add('active');
                    }

                    // 內頁進場動畫 (交錯效果)
                    const galleryElement = document.querySelector('.post-gallery');
                    const textElement = document.querySelector('.post-text');

                    // 啟動進場動畫
                    setTimeout(() => {
                        if (galleryElement) galleryElement.classList.add('animate-entry');
                        if (textElement) {
                            setTimeout(() => {
                                textElement.classList.add('animate-entry');
                            }, 200); // 文本區塊延遲 200ms
                        }
                    }, 50);

                    // 最後，將封面從 DOM 中移除 (清理 DOM)
                    setTimeout(() => {
                        if (cover) cover.remove();
                    }, 800);

                }, TOTAL_DELAY_MS);
            });


        })
        .catch(err => {
             console.error('❌ JSON 載入錯誤:', err);
             // 如果載入失敗，這裡可以新增邏輯來隱藏載入畫面或顯示錯誤訊息
        });

});
