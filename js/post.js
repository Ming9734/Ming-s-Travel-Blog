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
        setTimeout(() => overlay.classList.add('is-visible'), 6000); // 6秒後浮現
      }

      // 幻燈片
      let index = 0;
      const galleryImg = document.getElementById('gallery-img');
      if (galleryImg && post.images.length) galleryImg.src = post.images[index];

      const prevBtn = document.querySelector('.prev');
      const nextBtn = document.querySelector('.next');

      if (prevBtn) prevBtn.onclick = () => {
        index = (index - 1 + post.images.length) % post.images.length;
        galleryImg.src = post.images[index];
      };
      if (nextBtn) nextBtn.onclick = () => {
        index = (index + 1) % post.images.length;
        galleryImg.src = post.images[index];
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