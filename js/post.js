document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- 基本元素 ---------------- */
  const navbar = document.querySelector('.navbar');
  const postLayout = document.querySelector('.post-layout');
  const overlay = document.querySelector('.cover-overlay');

  if (navbar) navbar.classList.add('navbar-hidden');
  if (postLayout) postLayout.style.display = 'none';

  /* ---------------- 讀取 URL id ---------------- */
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    console.error('❌ No post ID in URL');
    return;
  }

  /* ---------------- 載入 JSON ---------------- */
  fetch(data/post_${postId}.json)
    .then(r => r.json())
    .then(post => {

      /* ---------- 封面圖片 ---------- */
      const coverImg = document.getElementById('cover-image');
      const coverBg  = document.querySelector('.cover-bg');

      coverImg.src = post.cover;
      coverBg.style.backgroundImage = url("${post.cover}");

      document.getElementById('cover-title').textContent = post.title;
      document.getElementById('cover-subtitle').textContent = post.subtitle;

      /* ---------- 延遲顯示 overlay ---------- */
      if (overlay) {
        overlay.classList.remove('is-visible');
        setTimeout(() => {
          overlay.classList.add('is-visible');
        }, 6000); // 6 秒
      }

      /* ---------- 幻燈片 ---------- */
      let index = 0;
      const galleryImg = document.getElementById('gallery-img');
      galleryImg.src = post.images[0];

      document.querySelector('.prev').onclick = () => {
        index = (index - 1 + post.images.length) % post.images.length;
        galleryImg.src = post.images[index];
      };

      document.querySelector('.next').onclick = () => {
        index = (index + 1) % post.images.length;
        galleryImg.src = post.images[index];
      };

      /* ---------- 文字 tabs ---------- */
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

      tabsContainer.addEventListener('click', e => {
        if (!e.target.classList.contains('tab')) return;

        document.querySelectorAll('.tab, .post-tab-content')
          .forEach(el => el.classList.remove('active'));

        e.target.classList.add('active');
        contentsContainer.children[e.target.dataset.index]
          .classList.add('active');
      });

    })
    .catch(err => console.error('❌ JSON error:', err));

  /* ---------------- Enter Story ---------------- */
  document.getElementById('enter-post')?.addEventListener('click', () => {
    const cover = document.getElementById('post-cover');

    cover.style.opacity = '0';
    cover.style.pointerEvents = 'none';

    setTimeout(() => {
      cover.remove();
      navbar?.classList.add('active');

      postLayout.style.display = 'grid';
      postLayout.style.opacity = '0';
      requestAnimationFrame(() => {
        postLayout.style.opacity = '1';
      });
    }, 700);
  });

});
