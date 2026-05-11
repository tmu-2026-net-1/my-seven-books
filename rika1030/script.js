const bookImages = {
  "ロミオとジュリエット": "images/RJ.jpg",
  "なんでも魔女商会13 星くずのブラックドレス": "images/blackdress.JPG",
  "蒼穹の昴 1": "images/subaru.JPG",
  "BLEACH 12": "images/bleach.JPG",
  "「キャラクター」のデザイン&描き方": "images/kakikata.JPG",
  "かげきしょうじょ！！ 1": "images/syoujo.JPG",
  "二月の勝者-絶対合格の教室- 1": "images/syousya.JPG",
};

async function loadBooks() {

  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec"
  );

  const data = await response.json();

  const mydata = data.filter(d => d.name === "Machimoto");

  const container = document.querySelector("#book-list-2");

  container.innerHTML = "";

  // 本一覧コンテナ
  const booklist = document.createElement("div");
  booklist.className = "book-list-container";

  container.appendChild(booklist);

  // ul作成
  const ul = document.createElement("ul");

  mydata.forEach((book, idx) => {

    // 画像取得
    const imageSrc =
      bookImages[book.title] || "images/default.jpg";

    // li作成
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="books/template.html?id=${idx}" class="book-link">

        <img
          src="${imageSrc}"
          alt="${book.title}"
          class="book-image"
        >

        <div class="book-text">
          <span class="title">${book.title}</span>

          <span class="author">
            ${book.author}
          </span>
        </div>

      </a>
    `;

    ul.appendChild(li);
  });

  booklist.appendChild(ul);
}

loadBooks();