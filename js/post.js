// 一開始隱藏 navbar
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

const postLayout = document.querySelector('.post-layout');

// 從 URL 取得 post id
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

// 載入 post_id.json
fetch(`data/post_id.json`)
  .then(res => res.json())
  .then(posts => {
    const post = posts.find(p => p.id == postId);
    if (!post) return;

    // 設定封面
    document.getElementById('cover-image').src = post.cover;
    document.getElementById('cover-title').textContent = post.title;
    document.getElementById('cover-subtitle').textContent = post.subtitle;

    // 幻燈片
    let index = 0;
    const galleryImg = document.getElementById('gallery-img');
    galleryImg.src = post.images[index];

    document.querySelector('.prev').onclick = () => {
      index = (index - 1 + post.images.length) % post.images.length;
      galleryImg.src = post.images[index];
    };
    document.querySelector('.next').onclick = () => {
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
      if (i===0) tab.classList.add('active');
      tabsContainer.appendChild(tab);

      const div = document.createElement('div');
      div.className = 'post-tab-content';
      if (i===0) div.classList.add('active');
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
  });

// 點擊 Enter Story
document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');

  // 封面淡出
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();

    // 導覽列顯示
    if (navbar) navbar.classList.add('active');

    // 顯示正文
    postLayout.style.display = 'grid';
    postLayout.style.opacity = '0';
    setTimeout(() => postLayout.style.opacity = '1', 50);
  }, 600);
});
