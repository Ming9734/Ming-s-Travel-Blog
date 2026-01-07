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

      // --- 2. 生成 HTML ---
      const sortedCountries = Object.keys(hierarchy).sort((a, b) => a.localeCompare(b));
      sortedCountries.forEach(country => {
        const countryLi = document.createElement('li');
        countryLi.className = 'dropdown-sub';
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

      // --- 3. 啟動手機版邏輯 ---
      initMobileMenu();
    })
    .catch(e => console.error('Failed to load posts.json:', e));
});

// 🌟 這裡開始是替換的部分 🌟
function initMobileMenu() {
  const menuLinks = document.querySelectorAll('.dropdown > a, .dropdown-sub > a');

  menuLinks.forEach(link => {
    // 確保乾淨，先移除舊的點擊事件（如果是動態刷新的話）
    link.onclick = null; 

    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        const nextMenu = this.nextElementSibling;

        // 情況 A: 點擊的是「國家」或「城市」(有子選單)
        if (nextMenu && (nextMenu.classList.contains('dropdown-menu') || nextMenu.classList.contains('sub-menu'))) {
          
          if (!nextMenu.classList.contains('menu-open')) {
            // 如果沒開，展開它
            e.preventDefault(); 
            e.stopPropagation();

            const parentUl = this.parentElement.parentElement;
            parentUl.querySelectorAll('.menu-open').forEach(m => {
              if (m !== nextMenu) m.classList.remove('menu-open');
            });

            nextMenu.classList.add('menu-open');
          } else {
            // 如果已經開了，且 href 是 "#"，點擊收合
            if (this.getAttribute('href') === "#") {
              e.preventDefault();
              e.stopPropagation();
              nextMenu.classList.remove('menu-open');
            }
            // 如果已經開了且有連結，這時點擊就會正常執行跳轉
          }
        }
        // 情況 B: 點擊的是「文章標題」(無子選單)，會直接跳過此判斷執行預設跳轉
      }
    });
  });
}
