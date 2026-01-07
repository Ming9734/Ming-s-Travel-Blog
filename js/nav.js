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
 function initMobileMenu() {
  const menuLinks = document.querySelectorAll('.dropdown > a, .dropdown-sub > a');

  menuLinks.forEach(link => {
    // 使用 click 事件，但加強攔截
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        const nextMenu = this.nextElementSibling;

        if (nextMenu && (nextMenu.classList.contains('dropdown-menu') || nextMenu.classList.contains('sub-menu'))) {
          
          // 如果選單目前是關閉狀態
          if (!nextMenu.classList.contains('menu-open')) {
            // 🌟 這是關鍵：阻止所有後續行為
            e.preventDefault(); 
            e.stopPropagation();
            e.stopImmediatePropagation(); // 阻止同一個元素上的其他監聽器

            // 關閉同層級其他選單
            const parentUl = this.parentElement.parentElement;
            parentUl.querySelectorAll('.menu-open').forEach(m => {
              if (m !== nextMenu) m.classList.remove('menu-open');
            });

            // 打開當前選單
            nextMenu.classList.add('menu-open');
          } 
          // 如果已經打開了，就不執行 e.preventDefault()，讓它正常跳轉
        }
      }
    });
  });
}
