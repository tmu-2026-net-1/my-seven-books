const BOOKS_DATA_URL = "https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec";
// Link to individual book pages by ID
const getBookDetailPage = (bookId) => `book-${bookId}.html`;
const BOOKS_DATA_CACHE_KEY = "books_data_cache_v1";
const FALLBACK_BOOKS = [
  { id: 127, name: "Ota", isbn: "978-4-488-40101-6", title: "孤島の鬼", author: "江戸川乱歩", publisher: "創元推理文庫", year: 1987, comment: "", coverUrl: "covers/9784488401016.JPG" },
  { id: 128, name: "Ota", isbn: "978-4-10-114901-1", title: "江戸川乱歩傑作選", author: "江戸川乱歩", publisher: "新潮文庫", year: 1960, comment: "", coverUrl: "covers/9784101149011.JPG" },
  { id: 129, name: "Ota", isbn: "978-4-10-135551-1", title: "向日葵の咲かない夏", author: "道尾秀介", publisher: "新潮文庫", year: 2008, comment: "", coverUrl: "covers/9784101355511.png" },
  { id: 130, name: "Ota", isbn: "978-4-04-373602-7", title: "月魚", author: "三浦しをん", publisher: "角川文庫", year: 2004, comment: "", coverUrl: "covers/9784043736027.JPG" },
  { id: 131, name: "Ota", isbn: "978-4-15-203476-2", title: "五番目のサリー", author: "ダニエル・キイス", publisher: "早川書房", year: 1991, comment: "", coverUrl: "covers/9784152034762.JPG" },
  { id: 132, name: "Ota", isbn: "978-4-08-747577-7", title: "ネバーランド", author: "恩田陸", publisher: "集英社文庫", year: 2003, comment: "", coverUrl: "covers/9784087475777.JPG" },
  { id: 133, name: "Ota", isbn: "978-4-10-131511-9", title: "夏の庭", author: "湯本香樹実", publisher: "新潮文庫", year: 1994, comment: "", coverUrl: "covers/9784101315119.JPG" },
];

const normalizeIsbn = (isbn) => String(isbn || "").replace(/[^0-9Xx]/g, "");

const getLocalCoverUrl = (book) => {
  const normalizedIsbn = normalizeIsbn(book?.isbn);
  return normalizedIsbn ? `covers/${normalizedIsbn}.jpg` : "";
};

const getLocalCoverCandidates = (book) => {
  const candidates = [];
  const preferredUrl = book?.coverUrl || getLocalCoverUrl(book);

  if (!preferredUrl) {
    return candidates;
  }

  candidates.push(preferredUrl);

  const stem = preferredUrl.replace(/\.(jpe?g|png)$/i, "");
  const jpgUrl = `${stem}.jpg`;
  const pngUrl = `${stem}.png`;

  if (!candidates.includes(jpgUrl)) {
    candidates.push(jpgUrl);
  }
  if (!candidates.includes(pngUrl)) {
    candidates.push(pngUrl);
  }

  // Also try filenames based on the original ISBN string (with hyphens)
  try {
    const rawIsbn = String(book?.isbn || "").replace(/\s+/g, "");
    if (rawIsbn) {
      const hyphenPath = `covers/${rawIsbn}`;
      const hyphenJpg = `${hyphenPath}.jpg`;
      const hyphenPng = `${hyphenPath}.png`;
      if (!candidates.includes(hyphenJpg)) candidates.push(hyphenJpg);
      if (!candidates.includes(hyphenPng)) candidates.push(hyphenPng);
    }
  } catch (e) {
    // ignore
  }

  return candidates;
};

const fetchBooksData = async () => {
  const readCachedBooks = () => {
    const cached = localStorage.getItem(BOOKS_DATA_CACHE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  };

  const cached = readCachedBooks();
  if (cached) {
    return cached;
  }

  return FALLBACK_BOOKS;
};

const fetchCoverUrl = (book) => getLocalCoverUrl(book);

const createBookItem = (book, coverUrl = "") => {
  const item = document.createElement("a");
  item.className = "book-list-item book-link";
  item.href = getBookDetailPage(book.id);
  item.setAttribute("aria-label", `${book.title} の詳細を見る`);
  item.dataset.bookId = String(book.id);

  const coverDiv = document.createElement("div");
  coverDiv.className = "book-cover";

  const coverCandidates = getLocalCoverCandidates(book);

  if (coverCandidates.length) {
    const img = document.createElement("img");
    img.className = "cover-image";
    img.src = coverCandidates[0];
    img.alt = book.title;
    img.loading = "lazy";
    let coverIndex = 0;
    img.onerror = () => {
      coverIndex += 1;
      if (coverIndex < coverCandidates.length) {
        img.src = coverCandidates[coverIndex];
        return;
      }
      coverDiv.innerHTML = '<div class="cover-placeholder">No Cover</div>';
    };
    coverDiv.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "cover-placeholder";
    ph.textContent = "No Cover";
    coverDiv.appendChild(ph);
  }

  const infoDiv = document.createElement("div");
  infoDiv.className = "book-info";
  infoDiv.innerHTML = `
    <div class="title">${book.title}</div>
    <div class="author">${book.author}</div>
    <div class="publisher">${book.publisher}</div>
    <div class="year">${book.year}年</div>`;

  item.appendChild(coverDiv);
  item.appendChild(infoDiv);
  return item;
};

// --- Comment Management Functions ---
const loadComments = (bookId) => {
  const key = `book_${bookId}_comments`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
};

const saveComments = (bookId, comments) => {
  const key = `book_${bookId}_comments`;
  localStorage.setItem(key, JSON.stringify(comments));
};

const renderComments = (bookId) => {
  const commentsList = document.getElementById('comments-list');
  if (!commentsList) return;
  const comments = loadComments(bookId);
  commentsList.innerHTML = '';
  comments.forEach((comment, idx) => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
      <p class="comment-text">${comment.text}</p>
      <p class="comment-meta">${new Date(comment.timestamp).toLocaleString('ja-JP')}</p>
    `;
    commentsList.appendChild(div);
  });
};

const handleCommentSubmit = (bookId, event) => {
  event.preventDefault();
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text) return;
  
  const comments = loadComments(bookId);
  comments.push({
    text,
    timestamp: new Date().toISOString()
  });
  saveComments(bookId, comments);
  input.value = '';
  renderComments(bookId);
};

const updateBookCover = (bookId, coverUrl, title) => {
  const items = document.querySelectorAll(`.book-list-item[data-book-id="${CSS.escape(String(bookId))}"]`);
  items.forEach((item) => {
    const coverDiv = item.querySelector(".book-cover");
    if (!coverDiv) {
      return;
    }

    if (coverUrl) {
      coverDiv.innerHTML = "";
      const img = document.createElement("img");
      img.className = "cover-image";
      img.src = coverUrl;
      img.alt = title;
      img.loading = "lazy";
      img.onerror = () => {
        coverDiv.innerHTML = '<div class="cover-placeholder">No Cover</div>';
      };
      coverDiv.appendChild(img);
    } else {
      coverDiv.innerHTML = '<div class="cover-placeholder">No Cover</div>';
    }
  });
};

async function loadBooks() {
  const data = await fetchBooksData();
  const myData = data.filter(d => d.name === "Ota");

  const container = document.querySelector("#book-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  const booklist = document.createElement("div");
  booklist.className = "book-list-container";
  container.appendChild(booklist);

  const sortedItems = [...myData].sort((a, b) => b.year - a.year);
  const baseItems = sortedItems.map((book, idx) => {
    const coverUrl = fetchCoverUrl(book);
    return createBookItem(book, coverUrl);
  });

  const fragment = document.createDocumentFragment();

  [...baseItems, ...baseItems.map(item => item.cloneNode(true)), ...baseItems.map(item => item.cloneNode(true))]
    .forEach(item => fragment.appendChild(item));

  booklist.appendChild(fragment);

  // Attach error handlers to all images (including cloned nodes) so they try alternate
  // local candidates (jpg/png and hyphenated filenames) when a source is missing.
  booklist.querySelectorAll('.book-list-item').forEach((item) => {
    const id = item.dataset.bookId;
    const book = sortedItems.find(b => String(b.id) === String(id));
    if (!book) return;
    const candidates = getLocalCoverCandidates(book);
    const img = item.querySelector('img.cover-image');
    if (!img || candidates.length === 0) return;

    let coverIndex = Math.max(0, candidates.indexOf(img.getAttribute('src')));
    img.onerror = () => {
      coverIndex += 1;
      if (coverIndex < candidates.length) {
        img.src = candidates[coverIndex];
        return;
      }
      const coverDiv = item.querySelector('.book-cover');
      if (coverDiv) coverDiv.innerHTML = '<div class="cover-placeholder">No Cover</div>';
    };
    // If the current src is missing, setting src again will trigger onerror to try next
    img.src = img.getAttribute('src');
  });

  const items = [...booklist.querySelectorAll(".book-list-item")];
  const loopItemCount = baseItems.length;
  const jumpWidth = () => {
    const first = items[loopItemCount];
    const last = items[loopItemCount * 2 - 1];
    return first && last ? last.offsetLeft + last.offsetWidth - first.offsetLeft : 0;
  };

  let frameId = 0;
  let isJumping = false;

  const centerOnMiddleSet = () => {
    const first = items[loopItemCount];
    if (first) {
      container.scrollLeft = first.offsetLeft - (container.clientWidth - first.clientWidth) / 2;
    }
  };

  const updateCenteredItem = () => {
    const centerX = container.getBoundingClientRect().left + container.clientWidth / 2;
    let closestItem = null;
    let closestDistance = Infinity;

    items.forEach((item) => {
      const itemCenter = item.getBoundingClientRect().left + item.clientWidth / 2;
      const distance = Math.abs(centerX - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });

    items.forEach((item) => item.classList.toggle("is-centered", item === closestItem));
  };

  const keepLooping = () => {
    if (isJumping || !loopItemCount) {
      return;
    }

    const width = jumpWidth();
    if (!width) {
      return;
    }

    if (container.scrollLeft <= 0) {
      isJumping = true;
      container.scrollLeft += width;
      requestAnimationFrame(() => { isJumping = false; });
    } else if (container.scrollLeft >= width * 2) {
      isJumping = true;
      container.scrollLeft -= width;
      requestAnimationFrame(() => { isJumping = false; });
    }
  };

  const onScroll = () => {
    if (frameId) {
      return;
    }

    frameId = requestAnimationFrame(() => {
      keepLooping();
      updateCenteredItem();
      frameId = 0;
    });
  };

  container.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    centerOnMiddleSet();
    updateCenteredItem();
  });

  requestAnimationFrame(() => {
    centerOnMiddleSet();
    updateCenteredItem();
  });

  // --- Keyboard navigation: ArrowLeft / ArrowRight to move focused (centered) book ---
  const findCenteredIndex = () => {
    const centerX = container.getBoundingClientRect().left + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    items.forEach((item, i) => {
      const itemCenter = item.getBoundingClientRect().left + item.clientWidth / 2;
      const distance = Math.abs(centerX - itemCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    return closestIndex;
  };

  const focusByDelta = (delta) => {
    if (!loopItemCount) return;
    const centeredIdx = findCenteredIndex();
    const baseIdx = centeredIdx % loopItemCount;
    const targetBase = (baseIdx + delta + loopItemCount) % loopItemCount;
    const targetItem = items[loopItemCount + targetBase]; // center set
    if (!targetItem) return;
    const left = targetItem.offsetLeft - (container.clientWidth - targetItem.clientWidth) / 2;
    container.scrollTo({ left, behavior: 'smooth' });
    // update classes after a frame
    requestAnimationFrame(() => updateCenteredItem());
  };

  const keydownHandler = (ev) => {
    if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      focusByDelta(1);
    } else if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      focusByDelta(-1);
    }
  };

  document.addEventListener('keydown', keydownHandler, { passive: false });

}

async function loadBookDetail() {
  const detailContainer = document.querySelector("#book-detail");
  if (!detailContainer) {
    return;
  }

  const data = await fetchBooksData();
  const myData = data.filter(d => d.name === "Ota");
  // Get book ID from window.BOOK_ID (set in individual HTML files)
  const bookId = window.BOOK_ID || Number(new URLSearchParams(window.location.search).get("id"));
  const book = myData.find(item => item.id === bookId) || myData[0];

  if (!book) {
    detailContainer.innerHTML = '<p class="book-detail-empty">本が見つかりませんでした。</p>';
    return;
  }

  detailContainer.innerHTML = "";

  const amazonUrl = book.isbn
    ? `https://www.amazon.co.jp/s?k=${encodeURIComponent(book.isbn)}`
    : `https://www.amazon.co.jp/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`;

  const detail = document.createElement("section");
  detail.className = "book-detail-shell";
  detail.innerHTML = `
    <a class="back-link" href="index.html">一覧に戻る</a>
    <div class="book-detail-grid">
      <div class="book-detail-cover-wrap">
        <div class="cover-placeholder cover-placeholder-large">No Cover</div>
      </div>
      <div class="book-detail-info">
        <p class="book-detail-kicker">BOOK DETAIL</p>
        <h2 class="book-detail-title">${book.title}</h2>
        <p class="book-detail-author">${book.author}</p>
        <dl class="book-detail-meta">
          <div><dt>出版社</dt><dd>${book.publisher}</dd></div>
          <div><dt>刊行年</dt><dd>${book.year}年</dd></div>
          <div><dt>ISBN</dt><dd>${book.isbn || "-"}</dd></div>
        </dl>
        <div class="book-detail-actions">
          <a id="amazon-link" class="amazon-link" href="${amazonUrl}" target="_blank" rel="noopener">Amazonで見る</a>
        </div>
      </div>
    </div>

  `;

  detailContainer.appendChild(detail);

  const coverWrap = detail.querySelector(".book-detail-cover-wrap");
  if (coverWrap) {
    const coverCandidates = getLocalCoverCandidates(book);
    if (coverCandidates.length) {
      coverWrap.innerHTML = `<img class="book-detail-cover" src="${coverCandidates[0]}" alt="${book.title}">`;
      const img = coverWrap.querySelector("img");
      if (img) {
        let coverIndex = 0;
        img.onerror = () => {
          coverIndex += 1;
          if (coverIndex < coverCandidates.length) {
            img.src = coverCandidates[coverIndex];
            return;
          }
          coverWrap.innerHTML = '<div class="cover-placeholder cover-placeholder-large">No Cover</div>';
        };
      }
    }
  }
}

if (document.querySelector("#book-detail")) {
  loadBookDetail();
} else if (document.querySelector("#book-list")) {
  loadBooks();
}
