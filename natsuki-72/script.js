async function loadBooks() {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
    const data = await response.json();
    const myData = data.filter(d => d.name === "Hoshino");

    const container = document.querySelector("#book-list");
    container.innerHTML = "";

    const pageClass = [...document.body.classList].find(name => name.startsWith("page-")) || "";
      let groups;

        if (pageClass.includes("childhood")) {
          groups = [myData.slice(0, 3)];
        } else if (pageClass.includes("teenage")) {
          groups = [myData.slice(3, 5)];
        } else if (pageClass.includes("now")) {
          groups = [myData.slice(5, 7)];
        } else {
          groups = [
            myData.slice(0, 3),
            myData.slice(3, 5),
            myData.slice(5, 7)
          ];
        }
        
    const isBookPage =
      pageClass.includes("childhood") ||
      pageClass.includes("teenage") ||
      pageClass.includes("now");

    const basePath = isBookPage ? "./" : "books/";

    const linkMap = {
  "あかりをけすと": `${basePath}Akariwokesuto.html`,
  "赤毛のアン PART1": `${basePath}Anne.html`,
  "若草物語": `${basePath}LittleaWomen.html`,
  "たったひとりの君へー牧野あおい作品集ー": `${basePath}MakinoCollection.html`,
  "きみの友だち": `${basePath}YourFriend.html`,
  "正反対な君と僕１": `${basePath}YouAndMe.html`,
  "葬送のフリーレン１": `${basePath}Frieren.html`
};

    groups.forEach(group => {
        const groupBox = document.createElement("div");
        groupBox.classList.add("book-group");

        group.forEach(book => {
            const item = document.createElement("div");
            item.classList.add("book-item");

            const link = linkMap[book.title] || "#";
            console.log(book.title, link);

            item.innerHTML = `
                 <a href="${link}" class="book-link">
        <div class="booktitle">${book.title}</div>
        <div class="author">${book.author}</div>
    </a>
`;

            groupBox.appendChild(item);
        });

        container.appendChild(groupBox);
    });

    
}

loadBooks();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!btn || !menu) return;
  document.querySelectorAll('.menu-category').forEach(category => {
  category.addEventListener('click', () => {
    const nextDiv = category.nextElementSibling;
    if (nextDiv) {
      nextDiv.classList.toggle('open');
    }
  });
});

console.log('Menu categories:', document.querySelectorAll('.menu-category').length);

  btn.addEventListener('click', (e) => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('open', !isOpen);
  });

  // メニュー外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  });

  // メニュー内リンクをクリックしたら閉じる（モバイルUX向上）
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  });
});

