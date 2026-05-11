async function loadBooks() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  const data = await response.json();

  const dataWithISBN = data.filter(d => d.isbn !== ""); //ISBN番号を持つ本のみでフィルタリング
  console.log(dataWithISBN);
  const myData = data.filter(d => d.name === "Nagata");
  //console.log(myData);　                                //コンソールに自分のおすすめ本だけを表示する

  const container = document.querySelector("#book-list");
  if(!container) return;

  container.innerHTML = "";

  const booklist = document.createElement("div");
  booklist.classList.add("book-list-container");
  container?.appendChild(booklist);

  myData.forEach((book) => {
    const item = document.createElement("div");
    item.classList.add("book-item");
    item.innerHTML = `
      <div class="title">${book.title}</div>
      <div class="details">
        <div class="cover">
          <img src="${book.cover || ''}" alt="cover">
        </div>

        <div class="meta">
          <div class="author">${book.author}</div>
          <div class="comment">${book.comment}</div>
          <div class="publisher">${book.publisher}</div>
          <div class="year">${book.year}</div>
        </div>
      </div>
    `;
    booklist?.appendChild(item);
  });

}

loadBooks();


