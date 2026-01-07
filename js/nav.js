// 🌟 整個覆蓋這個函式 🌟
function initMobileMenu() {
  // 選取所有可能包含子選單的 a 標籤
  const menuLinks = document.querySelectorAll('.dropdown > a, .dropdown-sub > a');

  menuLinks.forEach(link => {
    // 移除舊的點擊事件（如果有），避免重複綁定造成的連擊
    link.onclick = null; 

    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        const nextMenu = this.nextElementSibling;

        // 判斷：如果有下一層選單 (國家展開城市，城市展開文章)
        if (nextMenu && (nextMenu.classList.contains('dropdown-menu') || nextMenu.classList.contains('sub-menu'))) {
          
          // 如果點擊時該選單還沒打開
          if (!nextMenu.classList.contains('menu-open')) {
            e.preventDefault(); 
            e.stopPropagation(); // 🌟 防止點擊事件滲透到後面的連結

            // 關閉同層級其他選單，避免重疊
            const parentUl = this.parentElement.parentElement;
            if (parentUl) {
              parentUl.querySelectorAll('.menu-open').forEach(m => {
                if (m !== nextMenu) m.classList.remove('menu-open');
              });
            }

            // 打開當前選單
            nextMenu.classList.add('menu-open');
          } 
          else {
            // 如果已經打開了，且 href 是 "#"，再次點擊則收合
            if (this.getAttribute('href') === "#") {
              e.preventDefault();
              e.stopPropagation();
              nextMenu.classList.remove('menu-open');
            }
            // 如果已經打開且有真實連結，不攔截 e，讓它正常跳轉
          }
        }
        // 如果該 a 標籤後面沒有選單 (代表是最後一層文章標題)，則完全不處理，讓瀏覽器執行跳轉
      }
    });
  });
}
