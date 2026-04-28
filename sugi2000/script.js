async function loadBooks() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  const data = await response.json();
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