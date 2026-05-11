async function loadBooks() {
  const API_URL = "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec";

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    console.log("届いたデータ:", data);
    const myData = data.filter(d => d.name?.includes("Itagaki"));
    const sortedItems = [...myData].sort(
      (a, b) => Number(b.year) - Number(a.year)
    );

    const container = document.querySelector("#book-list-2");
    if (!container) {
      console.error("containerが見つからない");
      return;
    }

    container.innerHTML = "";

    const bookListWrapper = document.createElement("div");
    bookListWrapper.className = "book-list-container";
    container.appendChild(bookListWrapper);

    sortedItems.forEach((book) => {
      const item = document.createElement("div");
      item.className = "book-list-item";

      const cleanIsbn = String(book.isbn || "").replace(/[-\s]/g, "");

      const openbdUrl = cleanIsbn
        ? `https://covers.openbd.jp/${cleanIsbn}.jpg`
        : null;

      const googleUrl = cleanIsbn
        ? `https://books.google.com/books/content?vid=ISBN:${cleanIsbn}&printsec=frontcover&img=1&zoom=1`
        : null;

      const fallbackUrl = "https://via.placeholder.com/150x200?text=No+Cover";

      console.log(`タイトル: ${book.title}, ISBN: ${cleanIsbn}`);

      item.innerHTML = `
        <div class="book-cover" style="min-height:150px; background:#eee;">
          ${cleanIsbn
          ? `<img 
                  src="${openbdUrl}"
                  style="width:100%; height:auto; display:block;"
                  onerror="
                    this.onerror=null;
                    this.src='${googleUrl}';
                    this.onerror=function(){this.src='${fallbackUrl}'};
                  "
                />`
          : `<img src="${fallbackUrl}" style="width:100%;" />`
        }
        </div>

        <div class="book-details">
          <div class="book-info-main">
            <div class="title">${book.title || "タイトルなし"}</div>
            <div class="author">${book.author || "著者不明"}</div>
          </div>
          <div class="book-info-sub">
            <div class="publisher">${book.publisher || ""}</div>
            <div class="year">${book.year || ""}年</div>
          </div>
        </div>
      `;

      bookListWrapper.appendChild(item);
    });

    console.log("表示完了:", sortedItems);

  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

// 実行
loadBooks();