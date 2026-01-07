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

// 🌟 確保這個函式沒有被註解掉 🌟
function initMobileMenu() {
  const menuLinks = document.querySelectorAll('.dropdown > a, .dropdown-sub > a');

  menuLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        const nextMenu = this.nextElementSibling;

        if (nextMenu && (nextMenu.classList.contains('dropdown-menu') || nextMenu.classList.contains('sub-menu'))) {
          if (!nextMenu.classList.contains('menu-open')) {
            e.preventDefault(); 
            e.stopPropagation();

            // 關閉同層其他選單
            const parentUl = this.parentElement.parentElement;
            parentUl.querySelectorAll('.menu-open').forEach(m => {
              if (m !== nextMenu) m.classList.remove('menu-open');
            });

            nextMenu.classList.add('menu-open');
          }
        }
      }
    });
  });
}
