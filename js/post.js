const id = new URLSearchParams(window.location.search).get('id');

fetch('data/posts.json')
  .then(r => r.json())
  .then(posts => {
    const post = posts.find(p => p.id === id);
    document.getElementById('postContent').innerHTML = `
      <h1>${post.title}</h1>
      <img src="${post.image}">
      ${post.content}
    `;
  });