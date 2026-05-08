import { cachedFetch } from "./cached-fetch.js";

// 配列をシャッフルする関数（Fisher-Yates）
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadBooks() {
  try {
    const data = await cachedFetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
    const myData = data.filter(d => d.name === "yamaura");
    
    console.log(myData);
    
    const shelf = document.querySelector("#book-shelf");
    shelf.innerHTML = "";
    
    // 本のオブジェクト配列を作成
    const books = [];
    
    // APIから取得した7冊（黒）を追加
    myData.forEach((book) => {
      books.push({
        type: "real",
        title: book.title || "",
        author: book.author || "",
        year: book.year || ""
      });
    });
    
    // ダミーの白い本35冊を追加
    for (let i = 0; i < 35; i++) {
      books.push({
        type: "dummy"
      });
    }
    
    // 配列をシャッフル
    const shuffledBooks = shuffleArray(books);
    
    // シャッフルされた順序で表示
    shuffledBooks.forEach((book) => {
      const book_el = document.createElement("div");
      
      // 横の長さをランダムに設定（800px～1100px）
      const width = Math.floor(Math.random() * 300) + 800;
      book_el.style.width = width + "px";
      
      // 縦の高さをランダムに設定（40px～90px）※常に横より小さい
      const height = Math.floor(Math.random() * 50) + 40;
      book_el.style.height = height + "px";
      
      if (book.type === "real") {
        book_el.className = "book book-real";
        book_el.dataset.title = book.title;
        book_el.dataset.author = book.author;
        book_el.dataset.year = book.year;
        
        // ホバーイベント
        book_el.addEventListener("mouseenter", () => {
          document.querySelector("#book-title").textContent = book_el.dataset.title;
          document.querySelector("#book-author").textContent = book_el.dataset.author;
          document.querySelector("#book-year").textContent = book_el.dataset.year;
        });
      } else {
        book_el.className = "book";
      }
      
      shelf.appendChild(book_el);
    });
    
  } catch (error) {
    console.error("Failed to load books:", error);
  }
}

loadBooks();