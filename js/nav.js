document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');

  if (!nav) return;

  fetch('data/posts.json')
    .then(r => r.json())
    .then(posts => {
      // 創建 Posts Dropdown
      const postsDropdown = document.createElement('li');
      postsDropdown.className = 'dropdown';
      postsDropdown.innerHTML = `<a href="posts.html">Posts</a><ul class="dropdown-menu"></ul>`;
      nav.appendChild(postsDropdown);
      const menu = postsDropdown.querySelector('.dropdown-menu');

      // 依 Country -> City -> Attraction 分組
      const hierarchy = {};
      posts.forEach(p => {
        if (!hierarchy[p.country]) hierarchy[p.country] = {};
        if (!hierarchy[p.country][p.city]) hierarchy[p.country][p.city] = [];
        hierarchy[p.country][p.city].push(p);
      });

      // 生成下拉選單 HTML
      Object.keys(hierarchy).forEach(country => {
        const countryLi = document.createElement('li');
        countryLi.className = 'dropdown-sub';
        countryLi.innerHTML = `<a href="#">${country}</a><ul class="sub-menu"></ul>`;
        menu.appendChild(countryLi);

        const countrySub = countryLi.querySelector('.sub-menu');
        Object.keys(hierarchy[country]).forEach(city => {
          const cityLi = document.createElement('li');
          cityLi.className = 'dropdown-sub';
          cityLi.innerHTML = `<a href="#">${city}</a><ul class="sub-menu"></ul>`;
          countrySub.appendChild(cityLi);

          const citySub = cityLi.querySelector('.sub-menu');
          hierarchy[country][city].forEach(post => {
            const postLi = document.createElement('li');
            postLi.innerHTML = `<a href="posts/${post.id}.html">${post.title}</a>`;
            citySub.appendChild(postLi);
          });
        });
      });
    })
    .catch(e => console.error('Failed to load posts.json:', e));
});
