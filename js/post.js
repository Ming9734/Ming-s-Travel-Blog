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
                // 如果 JSON 檔案找不到或伺服器錯誤
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
            if (coverImg) coverImg.src = post.cover;

            const coverBg = document.querySelector('.cover-bg');
            if (coverBg) coverBg.style.backgroundImage = `url("${post.cover}")`;

            // --- 設置封面文字 ---
            document.getElementById('cover-title').textContent = post.title;
            document.getElementById('cover-subtitle').textContent = post.subtitle;

            // --- 延遲浮現玻璃卡片 (Overlay) ---
            const overlay = document.querySelector('.cover-overlay');
            if (overlay) {
                // 確保 overlay 元素可以被後面的點擊事件訪問到
                setTimeout(() => overlay.classList.add('is-visible'), 1000); 
            }

            // --- 幻燈片功能 (最終版) ---
            let index = 0;
            const galleryImg = document.getElementById('gallery-img');
            const galleryFrame = document.querySelector('.gallery-frame');

            // 共用函式：更新圖片和背景
            function updateGalleryImage(newIndex, imagesArray) {
                index = newIndex;
                const imageUrl = imagesArray[index]; 

                if (galleryImg) {
                    galleryImg.src = imageUrl;
                }
                if (galleryFrame) {
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


            // ==============================================================
            // 🌟 關鍵修訂：將點擊事件移動到這裡 (在 post 資料載入成功之後) 🌟
            // ==============================================================
            document.getElementById('enter-post')?.addEventListener('click', () => {
                // console.log('✅ Enter Story Clicked! Starting animation sequence.'); // 測試用

                const cover = document.getElementById('post-cover');
                const overlayElement = document.querySelector('.cover-overlay'); // 使用 overlayElement 避免變數覆蓋

                // Step 1: 立即隱藏毛玻璃卡片 (overlay) (0.5s 過渡)
                if (overlayElement) {
                    overlayElement.style.opacity = '0';
                    overlayElement.style.pointerEvents = 'none';
                }

                // Step 2: 等待卡片隱藏後，觸發封面放大動畫 (1.5s 過渡)
                setTimeout(() => {
                    cover.style.transform = 'scale(1.5)'; 
                    cover.style.opacity = '0';            
                }, 500); 


                // Step 3: 等待所有動畫結束後再切換到內頁
                setTimeout(() => {
                    // 顯示內頁佈局容器 (postLayout 在頂部已獲取)
                    if (postLayout) postLayout.style.display = 'grid'; 
                    if (navbar) navbar.classList.add('active'); 

                    // 獲取左右兩
