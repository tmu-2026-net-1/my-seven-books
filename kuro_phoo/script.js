const coverCache = new Map();

async function getBookCoverFromISBN(isbn) {
    if (!isbn) return '';
    const cleanISBN = String(isbn).replace(/[\-\s]/g, '');
    if (!cleanISBN) return '';

    if (coverCache.has(cleanISBN)) {
        return coverCache.get(cleanISBN);
    }

    // Do not prefetch/check with fetch(); just use image URL directly.
    // Cross-origin image fetch checks can fail even when <img> can display it.
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
    coverCache.set(cleanISBN, coverUrl);
    return coverUrl;
}

function renderShelf(books) {
    const container = document.querySelector('#book-list');
    if (!container) return;
    container.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'bookshelf-layout';

    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.innerHTML = `
    <div class="frame-inner">
    <img id="cover-image" alt="cover preview" referrerpolicy="no-referrer">
      <div class="frame-empty">画像をここに表示</div>
    </div>
    <div class="frame-caption" id="frame-caption"></div>
  `;

    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    const row = document.createElement('div');
    row.className = 'spine-row';

    const coverImg = frame.querySelector('#cover-image');
    const coverEmpty = frame.querySelector('.frame-empty');
    const caption = frame.querySelector('#frame-caption');
    let previewToken = 0;

    const buildCoverCandidates = (primaryUrl, isbn) => {
        const candidates = [];
        if (primaryUrl) candidates.push(primaryUrl);

        const cleanISBN = String(isbn || '').replace(/[\-\s]/g, '');
        if (cleanISBN) {
            candidates.push(`https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`);
            candidates.push(`https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`);
            candidates.push(`https://books.google.com/books/content?vid=ISBN${cleanISBN}&printsec=frontcover&img=1&zoom=2&source=gbs_api`);
            candidates.push(`https://books.google.com/books/content?vid=ISBN${cleanISBN}&printsec=frontcover&img=1&zoom=1&source=gbs_api`);
        }

        return [...new Set(candidates.filter(Boolean))];
    };

    const showCoverInFrame = (title, primaryUrl, isbn) => {
        const candidates = buildCoverCandidates(primaryUrl, isbn);
        const token = ++previewToken;

        if (candidates.length === 0) {
            coverImg.src = '';
            coverImg.style.display = 'none';
            coverEmpty.style.display = 'flex';
            caption.textContent = title || '';
            return;
        }

        caption.textContent = title || '';
        coverImg.style.objectFit = 'contain';
        coverImg.style.display = 'block';
        coverEmpty.style.display = 'none';

        const tryLoad = (index) => {
            if (token !== previewToken) return;
            if (index >= candidates.length) {
                coverImg.src = '';
                coverImg.style.display = 'none';
                coverEmpty.style.display = 'flex';
                return;
            }

            coverImg.onload = () => {
                if (token !== previewToken) return;
                coverImg.style.display = 'block';
                coverEmpty.style.display = 'none';
            };

            coverImg.onerror = () => {
                if (token !== previewToken) return;
                tryLoad(index + 1);
            };

            coverImg.src = candidates[index];
        };

        tryLoad(0);
    };

    books.forEach((b) => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        const spine = document.createElement('a');
        spine.className = 'spine';
        spine.style.background = '#ffffff';
        spine.setAttribute('aria-label', b.title || '無題');
        spine.dataset.cover = b.cover || '';
        spine.dataset.title = b.title || '';
        spine.dataset.isbn = b.isbn || '';

        const baseHref = b.href || '#';
        if (baseHref !== '#') {
            const params = new URLSearchParams();
            if (b.title) params.set('title', b.title);
            if (b.author) params.set('author', b.author);
            if (b.publisher) params.set('publisher', b.publisher);
            if (b.cover) params.set('cover', b.cover);
            if (b.isbn) params.set('isbn', b.isbn);
            const sep = baseHref.includes('?') ? '&' : '?';
            spine.href = `${baseHref}${sep}${params.toString()}`;
        } else {
            spine.href = '#';
        }

        spine.innerHTML = `
      <div class="spine-text">
        <div class="spine-title">${b.title || '無題'}</div>
        <div class="spine-author">${b.author || ''}</div>
      </div>
    `;

        bookItem.addEventListener('mouseenter', () => {
            showCoverInFrame(spine.dataset.title || '', spine.dataset.cover, spine.dataset.isbn);
        });

        bookItem.appendChild(spine);
        row.appendChild(bookItem);

        const title = b.title || '';
        const spineTitle = spine.querySelector('.spine-title');
        const spineAuthor = spine.querySelector('.spine-author');

        let spineWidth = 50;
        let spineHeight = 200;
        let spineTitleSize = 13;
        let spineAuthorSize = 10;
        const bunkoWidth = 36;
        const bunkoHeight = 175;
        const tankobonWidth = 44;
        const tankobonHeight = 240;
        const ehonWidth = 28;
        const ehonHeight = 300;

        if (title.includes('僕らの七日間戦争') || title.includes('十角館の殺人')) {
            spineWidth = bunkoWidth;
            spineHeight = bunkoHeight;
            spineTitleSize = 12;
            spineAuthorSize = 9;
        }

        if (title.includes('十角館の殺人')) {
            spineWidth = 40;
        }

        if (title.includes('世界でいちばん透き通った物語')) {
            spineWidth = 28;
            spineHeight = bunkoHeight;
            spineTitleSize = 11;
            spineAuthorSize = 8;
        }

        if (title.includes('スラムダンク') || title.includes('ハイキュー') || title.includes('学園ベビーシッターズ')) {
            spineWidth = tankobonWidth;
            spineHeight = tankobonHeight;
            spineTitleSize = 12;
            spineAuthorSize = 9;
        }

        if (title.includes('ぼくとかあさん')) {
            spineWidth = ehonWidth;
            spineHeight = ehonHeight;
            spineTitleSize = 11;
            spineAuthorSize = 8;
        }

        spine.style.width = `${spineWidth}px`;
        spine.style.height = `${spineHeight}px`;
        if (spineTitle) spineTitle.style.fontSize = `${spineTitleSize}px`;
        if (spineAuthor) spineAuthor.style.fontSize = `${spineAuthorSize}px`;
    });

    const base = document.createElement('div');
    base.className = 'shelf-base';

    shelf.appendChild(row);
    shelf.appendChild(base);

    layout.appendChild(frame);
    layout.appendChild(shelf);
    container.appendChild(layout);

    if (books.length > 0) {
        showCoverInFrame(books[0].title || '', books[0].cover || '', books[0].isbn || '');
    }
}

async function loadBooks() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec');
        const data = await response.json();

        const myData = data.filter(d => d.name === 'Kurosaki');

        const books = await Promise.all(
            myData.slice(0, 7).map(async (d, i) => {
                let cover = d.cover || d.image || d.thumbnail || '';
                if (!cover && d.isbn) {
                    cover = await getBookCoverFromISBN(d.isbn);
                }
                return {
                    title: d.title || d.book || d.name || '無題',
                    author: d.author || d.writer || '',
                    publisher: d.publisher || d.pub || '',
                    isbn: d.isbn || '',
                    href: d.href || d.link || `book${i + 1}.html`,
                    cover
                };
            })
        );

        if (books.length === 0) {
            const placeholders = Array.from({ length: 7 }).map((_, i) => ({
                title: `本の題名${i + 1}`,
                author: '著者名',
                publisher: '出版社',
                href: `book${i + 1}.html`,
                cover: ''
            }));
            renderShelf(placeholders);
        } else {
            renderShelf(books);
        }
    } catch (err) {
        console.error('loadBooks error', err);
        renderShelf(Array.from({ length: 7 }).map((_, i) => ({
            title: `本の題名${i + 1}`,
            author: '著者名',
            publisher: '出版社',
            href: `book${i + 1}.html`,
            cover: ''
        })));
    }
}

loadBooks();
