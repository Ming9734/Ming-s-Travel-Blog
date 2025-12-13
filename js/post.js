// 一開始隱藏 navbar（用 class 控制）
const navbar = document.querySelector('.navbar');
if (navbar) {
  navbar.classList.add('navbar-hidden');
}

// 點擊 Enter Story
document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');

  // 封面淡出
  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();

    // 導覽列顯示，加入 active class
    if (navbar) navbar.classList.add('active');
  }, 600);
});
function initGallery(images) {
  const gallery = document.querySelector('.post-gallery');
  if (!gallery || !images?.length) return;

  let index = 0;

  gallery.innerHTML = `
    <div class="gallery-frame">
      <img src="${images[0]}" id="gallery-img">
      <button class="gallery-btn prev">‹</button>
      <button class="gallery-btn next">›</button>
    </div>
  `;

  const img = gallery.querySelector('#gallery-img');

  gallery.querySelector('.prev').onclick = () => {
    index = (index - 1 + images.length) % images.length;
    img.src = images[index];
  };

  gallery.querySelector('.next').onclick = () => {
    index = (index + 1) % images.length;
    img.src = images[index];
  };
}
