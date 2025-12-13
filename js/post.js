// 一開始隱藏 navbar
const navbar = document.querySelector('.navbar');
if (navbar) {
  navbar.style.display = 'none';
}

// 點擊 Enter Story
document.getElementById('enter-post')?.addEventListener('click', () => {
  const cover = document.getElementById('post-cover');

  cover.style.opacity = '0';
  cover.style.pointerEvents = 'none';

  setTimeout(() => {
    cover.remove();
    if (navbar) navbar.style.display = 'flex';
  }, 600);
});
