// マウスホイールでの横スクロール制御
window.addEventListener("wheel", (e) => {
    const list = document.querySelector("#book-list");
    if (!list) return;

    // 縦方向のスクロール量を横スクロール量に変換
    list.scrollLeft += e.deltaY;

    // ブラウザ標準の縦スクロールを防止
    if (e.deltaY !== 0) {
        e.preventDefault();
    }
}, { passive: false });

// データの読み込み
async function loadBooks() {
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
        const data = await response.json();
        const myData = data.filter((item) => item.name === "Tanaka");

        const container = document.querySelector("#book-list");
        container.innerHTML = "";

        for (let i = 0; i < myData.length; i++) {
            const book = myData[i];
            
            // スプレッドシートの項目名が "comment" なので book.comment を取得する
            const commentText = book.comment || "（あらすじが登録されていません）";
            
            const item = document.createElement("div");
            item.classList = "book-list-item";

            const order = (i + 1).toString().padStart(2, '0');
            const coverUrl = await getBookCover(book.isbn);
            
            item.innerHTML = `
                <div class="book-main">
                    <div class="book-number">${order}</div>
                    <div class="book-cover">
                        <img src="${coverUrl}" alt="${book.title}">
                    </div>
                    <div class="book-info">
                        <span class="title">${book.title}</span>
                        <span class="author">${book.author}</span>
                    </div>
                </div>
                <div class="book-detail">
                    <div class="detail-inner">
                        <p class="description">${commentText}</p>
                        <div class="meta-bottom">
                            <span class="publisher">${book.publisher}</span>
                            <span class="year">${book.year}年</span>
                        </div>
                    </div>
                </div>`;
            container.appendChild(item);
        }
    } catch (error) {
        console.error("データの読み込みに失敗しました", error);
    }
}

/**
 * 複数のソースから書影を探す関数
 */
async function getBookCover(isbn) {
    if (!isbn) return "https://placehold.jp/24/cccccc/ffffff/150x210.png?text=No%20ISBN";

    const cleanIsbn = isbn.toString().replace(/-/g, "");

    // 1. openBD を検証
    const openBDUrl = `https://cover.openbd.com/${cleanIsbn}.jpg`;
    if (await checkImage(openBDUrl)) return openBDUrl;

    // 2. Open Library を検証
    const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg?default=false`;
    if (await checkImage(openLibraryUrl)) return openLibraryUrl;

    // 3. Google Books を検証
    try {
        const gbooksRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
        const gbooksData = await gbooksRes.json();
        if (gbooksData.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
            return gbooksData.items[0].volumeInfo.imageLinks.thumbnail.replace("http://", "https://");
        }
    } catch (e) {
        console.log("Google Books API Error");
    }

    return "https://placehold.jp/24/cccccc/ffffff/150x210.png?text=No%20Image";
}

/**
 * 画像URLが有効かチェックする補助関数
 */
function checkImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

loadBooks();