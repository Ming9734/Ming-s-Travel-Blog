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
