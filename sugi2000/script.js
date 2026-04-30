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
  const myData = data.filter(d => d.name === "Sugimoto");
  console.log(myData);

  const container = document.querySelector("#book-list");
  container.innerHTML = "";
  const booklist = document.createElement("div");
  container?.appendChild(booklist);
  myData.forEach((book) => {
    const item = document.createElement("div");
    item.classList.add("book-item");
    item.innerHTML = `<div class="title">
      ${book.title}
    </div>
    <div>
      ${book.author}
    </div>
    <div class="publisher">
      ${book.publisher} / ${book.year}年
    </div>`;
    booklist?.appendChild(item);
  });
}

loadBooks();
