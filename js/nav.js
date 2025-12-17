document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('posts-dropdown');
  if (!menu) return;

  fetch('data/posts.json')
    .then(r => r.json())
    .then(posts => {
      // 建立層級
      const hierarchy = {};
      posts.forEach(p => {
        if (!hierarchy[p.country]) hierarchy[p.country] = {};
        if (!hierarchy[p.country][p.city]) hierarchy[p.country][p.city] = [];
        hierarchy[p.country][p.city].push(p);
      });

      // 🌟 1. 先獲取國家列表並排序
      const sortedCountries = Object.keys(hierarchy).sort((a, b) => a.localeCompare(b));

      sortedCountries.forEach(country => {
        const countryLi = document.createElement('li');
        countryLi.className = 'dropdown-sub';
        countryLi.innerHTML = `<a href="#">${country}</a><ul class="sub-menu"></ul>`;
        menu.appendChild(countryLi);

        const countrySub = countryLi.querySelector('.sub-menu');
        
        // 🌟 2. 獲取該國家的城市列表並排序
        const sortedCities = Object.keys(hierarchy[country]).sort((a, b) => a.localeCompare(b));

        sortedCities.forEach(city => {
          const cityLi = document.createElement('li');
          cityLi.className = 'dropdown-sub';
          cityLi.innerHTML = `<a href="#">${city}</a><ul class="sub-menu"></ul>`;
          countrySub.appendChild(cityLi);

          const citySub = cityLi.querySelector('.sub-menu');
          
          // 🌟 3. 文章本身也可以按標題字母排序 (選用)
          const sortedPosts = hierarchy[country][city].sort((a, b) => a.title.localeCompare(b.title));

          sortedPosts.forEach(post => {
            const postLi = document.createElement('li');
            postLi.innerHTML = `<a href="post.html?id=${post.id}">${post.title}</a>`;
            citySub.appendChild(postLi);
          });
        });
      });
    })
    .catch(e => console.error('Failed to load posts.json:', e));
});
