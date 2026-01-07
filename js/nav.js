document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('posts-dropdown');
  if (!menu) return;

  fetch('data/posts.json')
    .then(r => r.json())
    .then(posts => {
      // --- 1. 建立層級數據 ---
      const hierarchy = {};
      posts.forEach(p => {
        if (!hierarchy[p.country]) hierarchy[p.country] = {};
        if (!hierarchy[p.country][p.city]) hierarchy[p.country][p.city] = [];
        hierarchy[p.country][p.city].push(p);
      });

      // --- 2. 開始生成 HTML 結構 ---
      const sortedCountries = Object.keys(hierarchy).sort((a, b) => a.localeCompare(b));

      sortedCountries.forEach(country => {
        const countryLi = document.createElement('li');
        countryLi.className = 'dropdown-sub';
        // 注意：這裡 href 可以設為你的國家總覽頁，或保留 #
        countryLi.innerHTML = `<a href="#">${country}</a><ul class="sub-menu"></ul>`;
        menu.appendChild(countryLi);

        const countrySub = countryLi.querySelector('.sub-menu');
        const sortedCities = Object.keys(hierarchy[country]).sort((a, b) => a.localeCompare(b));

        sortedCities.forEach(city => {
          const cityLi = document.createElement('li');
          cityLi.className = 'dropdown-sub';
          cityLi.innerHTML = `<a href="#">${city}</a><ul class="sub-menu"></ul>`;
          countrySub.appendChild(cityLi);

          const citySub = cityLi.querySelector('.sub-menu');
          const sortedPosts = hierarchy[country][city].sort((a, b) => a.title.localeCompare(b.title));

          sortedPosts.forEach(post => {
            const postLi = document.createElement('li');
            postLi.innerHTML = `<a href="post.html?id=${post.id}">${post.title}</a>`;
            citySub.appendChild(postLi);
          });
        });
      });

      // --- 3. HTML 生成完畢後，初始化手機版交互邏輯 ---
      initMobileMenu();
    })
    .catch(e => console.error('Failed to load posts.json:', e));
});

/**
 * 手機版專用：點擊控制函式
 * 邏輯：未展開時點擊為展開，已展開時點擊則跳轉
 */
function initMobileMenu() {
  // 選取所有包含子選單的連結
  const menuLinks = document.querySelectorAll('.dropdown > a, .dropdown-sub > a');

  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // 僅在手機/平板模式下執行
      if (window.innerWidth <= 992) {
        const nextMenu = this.nextElementSibling;

        // 檢查是否有下級選單需要控制
        if (nextMenu && (nextMenu.classList.contains('dropdown-menu') || nextMenu.classList.contains('sub-menu'))) {
          
          // 核心判斷：如果選單目前是隱藏的 (沒有 menu-open class)
          if (!nextMenu.classList.contains('menu-open')) {
            e.preventDefault();  // 攔截跳轉
            e.stopPropagation(); // 防止事件冒泡

            // 關閉同層級其他已打開的選單 (維持介面整潔)
            const parentUl = this.parentElement.parentElement;
            const openSiblings = parentUl.querySelectorAll('.menu-open');
            openSiblings.forEach(menu => menu.classList.remove('menu-open'));

            // 打開當前選單
            nextMenu.classList.add('menu-open');
            console.log("手機版：展開選單");
          } else {
            // 如果已經是 menu-open 狀態，則不執行 preventDefault
            // 瀏覽器會執行原本 A 標籤的 href 跳轉
            console.log("手機版：執行跳轉");
          }
        }
      }
    });
  });

  // 點擊頁面其他地方時，關閉所有手機版選單 (選用，增加體驗)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992 && !e.target.closest('.nav')) {
      document.querySelectorAll('.menu-open').forEach(m => m.classList.remove('menu-open'));
    }
  });
}
