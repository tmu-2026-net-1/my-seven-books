import { cachedFetch } from "./cached-fetch.js";

const API_URL = "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec";

const FILTERS = {
  all:      [15, 16, 17, 18, 19, 20, 21],
  manga:    [18],
  children: [17, 19],
  novel:    [15, 16, 20, 21],
};

const COMMENTS = {
15: "東野圭吾作のガリレオシリーズのうちの1作。湯川学という物理学者が登場する。\n\n高校時代に読んだミステリ小説で、トリックや真相に衝撃を受けた。\n初めて小説が面白いと思って、それからは好んでミステリを読むようになった。",
16: "死神のしごとの短編集。\n読みやすくて面白い。\n\n大学入学後に知り合った好きな作家さんにオススメされて手にとった。\nその方の作風のルーツがわかった気がして嬉しくなったことを覚えている。",
17: "絵本の中からキャラクターなど特定のものを探す本。\n\n幼少期に読んでいた中で最も印象に残っている。\n密集したイラストがワクワクした。キャラクターデザインも好みだった。",
18: "アニメも有名になったファンタジー・戦闘系の漫画。\n\n小さい頃に父親と一緒にハマって、単行本が発売されるたびに二人で交代で買った思い出がある。完結する頃には高校生だった。\n成長期を共にした漫画。",
19: "子供向けの作品。シュールなイラストとぶっ飛んでいるギャグ。\n\n小学校の友人の家でいつも読んでいた。コレ以外は読めなかったほど、児童書の中でいちばん好きな作品だった。",
20: "「少年の日の思い出」で有名なヘッセの作品。現実的で少し暗い展開。\n\n高校生のとき、ちょうど受験勉強をサボって図書館で読んでいたので、主人公と少し重なるところがあったのが思い出に残っている。",
21: "主人公が砂漠で王子様と出会う話。\n世界的に有名な作品。\n\n童話にちかい感覚で読める。\n抽象的な文章で、メッセージ性があり、とても印象に残っている。\n自分の創作の根幹にもなっている作品。",
};

let allBooks = [];

function getCoverUrl(isbn) {
  return `images/${isbn}.jpg`;
}

function renderBooks(ids) {
  const container = document.querySelector("#book-list");
  container.innerHTML = "";

  const books = allBooks.filter(b => ids.includes(Number(b.id)));

  books.forEach((book) => {
    const item = document.createElement("div");
    item.classList.add("book-item");

    const overlayHTML = `
      <div class="book-overlay">
        <div class="overlay-meta">
          <p class="overlay-publisher">${book.publisher}</p>
          <p class="overlay-year">${book.year}年</p>
          <p class="overlay-author">${book.author}</p>
        </div>
        ${book.comment ? `<div class="overlay-divider"></div><p class="overlay-comment">${book.comment.replace(/\n/g, "<br>")}</p>` : ""}
      </div>
    `;

    if (book.coverUrl) {
      item.innerHTML = `
        <div class="book-cover-wrapper">
          <img class="book-cover" src="${book.coverUrl}" alt="${book.title}" onerror="this.style.opacity='0'">
          ${overlayHTML}
        </div>
        <p class="book-title">${book.title}</p>
      `;
    } else {
      item.innerHTML = `
        <div class="book-cover-wrapper no-image">
          <span class="no-image-text">${book.title}</span>
          ${overlayHTML}
        </div>
        <p class="book-title">${book.title}</p>
      `;
    }

    container.appendChild(item);
  });
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filterKey = btn.dataset.filter;
      renderBooks(FILTERS[filterKey]);
    });
  });
}

async function loadBooks() {
  const dataPromise = cachedFetch(API_URL);

  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }

  const data = await dataPromise;
  const myData = data.filter(d => d.name === "Yasui");

  const booksWithCovers = myData.map((book) => {
    const coverUrl = getCoverUrl(book.isbn);
    const comment = COMMENTS[Number(book.id)] || "";
    return { ...book, coverUrl, comment };
  });

  allBooks = booksWithCovers;

  setupFilters();
  renderBooks(FILTERS.all);
}

loadBooks();