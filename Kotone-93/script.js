import { cachedFetch } from "./cached-fetch.js";

const API_URL = "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec";

async function loadBooks() {
  const dataPromise = cachedFetch(API_URL);

  // ページの読み込みが完了していない場合は待機する
  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }
  const data = await dataPromise;
  const dataWithISBN = data.filter(d => d.isbn !== "");
  console.log(dataWithISBN);
  const myData = data.filter(d => d.name === "Kitasho");
  console.log(myData);

  // 本棚レイアウト
  let shelf = document.getElementById("bookshelf");
  if (!shelf) {
    shelf = document.createElement("div");
    shelf.id = "bookshelf";
    const container = document.querySelector("#book-list");
    container.innerHTML = "";
    container.appendChild(shelf);
  } else {
    shelf.innerHTML = "";
  }

  // 7冊だけ表示
  myData.slice(0, 7).forEach((book, idx) => {
    // idx: 0〜6 → book1.html〜book7.html
    const link = document.createElement("a");
    link.href = `book${idx + 1}.html`;
    link.style.textDecoration = "none";
    link.target = "_self";

    const item = document.createElement("div");
    item.classList.add("book-item");

    // タイトル文字数制限（19文字）
    let title = book.title || "";
    if (title.length > 19) {
      title = title.slice(0, 19) + "…";
    }

    // カバー画像取得（OpenBD）
    let coverUrl = "";
    if (book.isbn) {
      coverUrl = `https://cover.openbd.jp/${book.isbn}.jpg`;
    }

    item.innerHTML = `
      <img class="book-cover" src="${coverUrl}" alt="cover" onerror="this.style.display='none'">
      <div class="title">${title}</div>
    `;
    link.appendChild(item);
    shelf.appendChild(link);
  });
}

loadBooks();