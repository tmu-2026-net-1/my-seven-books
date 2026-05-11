async function loadBooks() {

  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  const data = await response.json();
  const dataWithISBN = data.filter(d => d.isbn);    // ISBNがあるデータのみを抽出
  console.log(data);
  console.log(dataWithISBN);
  const mydata = data.filter(d => d.name === "Hayai");   // 名前が"Hayai"のデータのみを抽出
  console.log(mydata);

  const container = document.querySelector("#book-list");
  container.innerHTML = "";
  const booklist = document.createElement("div");
  booklist.classList.add("bookshelf"); // 本棚のクラスを追加
  container?.appendChild(booklist);

  let bookElements = [];

  mydata.forEach((book) => {
    const item = document.createElement("div");
    item.classList.add("book-item", "real-book");
    booklist?.appendChild(item); // 先に追加してレイアウトを確保
    bookElements.push(item);

    // ISBNを取得
    const isbnRaw = book.isbn ? String(book.isbn).replace(/-/g, '') : '';

    // 画像はimagesフォルダ内の画像（タイトル名.jpg）のみを使用
    let coverUrl = `images/${book.title}.jpg`;
    let nfdUrl = `images/${book.title.normalize('NFD')}.jpg`;

    item.innerHTML = `
      <a href="detail.html?isbn=${isbnRaw}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&publisher=${encodeURIComponent(book.publisher)}&year=${encodeURIComponent(book.year)}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
        <div class="cover-wrapper">
          <img src="${coverUrl}" alt="${book.title}の表紙" class="book-cover" onerror="if(!this.dataset.nfdChecked){this.dataset.nfdChecked='true'; this.src='${nfdUrl}';}else{this.src='https://via.placeholder.com/150x220?text=No+Cover';}">
        </div>
        <div class="book-info">
          <div class="title">${book.title}</div>
          <div class="author">${book.author}</div>
          <div class="publisher">${book.publisher} / ${book.year}</div>
        </div>
      </a>
    `;
  });

  // 本を配置した後に小人を配置し、画面リサイズ時にも再計算する
  updateDwarfs();
  window.addEventListener('resize', updateDwarfs);

  function updateDwarfs() {
    // 既存の小人を削除
    document.querySelectorAll('.dwarf-item').forEach(el => el.remove());

    const container = document.querySelector('.bookshelf');
    if (!container || bookElements.length === 0) return;

    // 本棚の実質的な幅を計算（padding: 0 30px なので両側合わせて60px引く）
    const shelfWidth = container.clientWidth - 60;
    const itemWidth = 160;
    const gap = 20;

    // 1行に最大何冊置けるかを計算: n * 160 + (n-1) * 20 <= shelfWidth
    // (n * 180) - 20 <= shelfWidth  →  n <= (shelfWidth + 20) / 180
    let cols = Math.floor((shelfWidth + gap) / (itemWidth + gap));
    if (cols < 1) cols = 1;

    const bookCount = bookElements.length;
    const remainder = bookCount % cols;
    const emptySlots = remainder === 0 ? 0 : cols - remainder;

    // 空きがある場合、下段の左側（本の前に）小人を配置
    if (emptySlots > 0) {
      const lastRowStartIndex = bookCount - remainder;
      const referenceNode = bookElements[lastRowStartIndex];

      for (let i = 0; i < emptySlots; i++) {
        const dwarf = document.createElement('div');
        dwarf.classList.add('book-item', 'dwarf-item');

        // 小人のSVGイラスト
        dwarf.innerHTML = `
          <div class="dwarf-wrapper">
            <svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
              <!-- 脚（紐でぶら下がっている部分） 少し曲線で開きすぎないように -->
              <path d="M 40,115 Q 30,125 32,135" fill="none" stroke="#bdc3c7" stroke-width="4"/>
              <path d="M 60,115 Q 70,125 68,135" fill="none" stroke="#bdc3c7" stroke-width="4"/>

              <!-- 靴（明るめの暖色系に変更、少し角度をつけてつま先を下に向ける） -->
              <path d="M 32,135 L 18,143" fill="none" stroke="#e67e22" stroke-width="16" stroke-linecap="round"/>
              <path d="M 68,135 L 82,143" fill="none" stroke="#e67e22" stroke-width="16" stroke-linecap="round"/>

              <!-- 体（深い森のようなダークグリーンにして自然の要素をプラス） -->
              <path d="M 30,120 L 30,80 Q 50,70 70,80 L 70,120 Z" fill="#1e432b"/>
              <!-- ヒゲ -->
              <path d="M 20,60 Q 50,110 80,60 Z" fill="#ecf0f1"/>
              <!-- 顔 -->
              <circle cx="50" cy="55" r="20" fill="#ffdab9"/>
              <!-- 鼻 -->
              <circle cx="50" cy="62" r="6" fill="#f5b7b1"/>
              <!-- 目 -->
              <circle cx="43" cy="52" r="2" fill="#333"/>
              <circle cx="57" cy="52" r="2" fill="#333"/>
              <!-- 帽子 (上端を尖らせる) -->
              <path d="M 10,60 Q 40,30 50,0 Q 60,30 90,60 Q 50,40 10,60 Z" fill="#e74c3c"/>
            </svg>
          </div>
        `;
        container.insertBefore(dwarf, referenceNode);
      }
    }
  }
}


loadBooks();

