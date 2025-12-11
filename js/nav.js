document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('posts-dropdown'); // 直接選擇已存在的 ul
  if (!menu) return;

  fetch('data/posts.json')
    .then(r => r.json())
    .then(posts => {
      // 建立 country -> city -> posts 的層級
      const hierarchy = {};
      posts.forEach(p => {
        if (!hierarchy[p.country]) hierarchy[p.country] = {};
        if (!hierarchy[p.country][p.city]) hierarchy[p.country][p.city] = [];
        hierarchy[p.country][p.city].push(p);
      });

      // 生成子選單
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
            postLi.innerHTML = `<a href="post.html?id=${post.id}">${post.title}</a>`;
            citySub.appendChild(postLi);
          });
        });
      });
    })
    .catch(e => console.error('Failed to load posts.json:', e));
});
