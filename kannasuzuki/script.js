import { cachedFetch } from "./cached-fetch.js";
const API_URL = "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec";

async function loadBooks() {
  //const response = await cachedFetch(API_URL);
  const dataPromise = cachedFetch(API_URL);

  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r,{ once: true }));
  }

    const data = await dataPromise;

    const dataWithISBN = data.filter(d => d.isbn);
    console.log(dataWithISBN);
    const myData = data.filter(d => d.name === "Suzuki");
    console.log(myData);

    const bookId = document.body.dataset.bookId;
    const book = myData.find(d => d.id == bookId);

const idToClassMap = {
  "67": "book1",
  "69": "book2",
  "65": "book3",
  "70": "book4",
  "64": "book5",
  "66": "book6",
  "68": "book7",
}
const bookClass = idToClassMap[bookId];
document.body.classList.add(bookClass);


    const container = document.querySelector("#book-list");
    container.innerHTML = "";
    const booklist = document.createElement("div");
    container?.appendChild(booklist);

    const item = document.createElement("div");
    item.classList.add("book-item");
    item.innerHTML =
      `<div class = "bookgroup">
      <div class = "book-title">${book.title}</div>
   <div class="book-author">${book.author}</div>
   <div class="book-publisher">${book.publisher}</div>
   <div class="book-year">${book.year}年</div>
   <div class="book-isbn">${book.isbn}</div>
   </div>`;

    booklist?.appendChild(item);

  }

  loadBooks();