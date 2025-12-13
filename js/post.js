// 封面淡出 + 導覽列淡入 + 文章主體出現
const navbar = document.querySelector('.navbar');
if (navbar) navbar.classList.add('navbar-hidden');

document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');
  const postContainer = document.querySelector('.post-container');

  cover.style.transition = 'opacity 0.8s';
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();

    if (navbar) {
      navbar.classList.remove('navbar-hidden');
      navbar.style.opacity = '0';
      navbar.style.transition = 'opacity 0.6s';
      requestAnimationFrame(() => {
        navbar.style.opacity = '1';
      });
    }

    postContainer.style.display = 'flex';
    postContainer.style.opacity = '0';
    postContainer.style.transform = 'translateY(20px)';
    postContainer.style.transition = 'opacity 0.8s, transform 0.8s';
    requestAnimationFrame(() => {
      postContainer.style.opacity = '1';
      postContainer.style.transform = 'translateY(0)';
    });
  }, 800);
});

// 幻燈片功能
function initGallery(images) {
  const gallery = document.querySelector('.post-gallery img');
  if (!gallery || !images?.length) return;
  let index = 0;

  const imgEl = gallery;
  imgEl.src = images[index];

  document.querySelector('.gallery-btn.prev').onclick = () => {
    index = (index - 1 + images.length) % images.length;
    imgEl.style.opacity = '0';
    setTimeout(() => { imgEl.src = images[index]; imgEl.style.opacity = '1'; }, 200);
  };

  document.querySelector('.gallery-btn.next').onclick = () => {
    index = (index + 1) % images.length;
    imgEl.style.opacity = '0';
    setTimeout(() => { imgEl.src = images[index]; imgEl.style.opacity = '1'; }, 200);
  };
}

// 多個文字方塊切換
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});