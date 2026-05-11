/* script.js
   - Fetches book rows from a Google Apps Script endpoint (spreadsheet)
   - Filters rows for the current user and renders the vertical-spine bookshelf
   - Auto-fetches book cover images from Google Books API using ISBN
*/

// Get book cover image URL from ISBN using multiple APIs with fallback
async function getBookCoverFromISBN(isbn) {
  if (!isbn) return '';
  try {
    // Clean ISBN: remove hyphens and spaces
    const cleanISBN = String(isbn).replace(/[\-\s]/g, '');
    if (!cleanISBN) return '';
    
    // Try Google Books API first
    try {
      const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`;
      const response = await Promise.race([
        fetch(searchUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]);
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const imageLinks = data.items[0].volumeInfo?.imageLinks;
          if (imageLinks && imageLinks.thumbnail) {
            const coverUrl = imageLinks.thumbnail.replace('http://', 'https://');
            console.log(`✓ Found cover for ISBN ${cleanISBN} (Google Books)`);
            return coverUrl;
          }
        }
      }
    } catch (err) {
      console.log(`Google Books API failed for ${cleanISBN}, trying OpenLibrary...`);
    }
    
    // Fallback: Try OpenLibrary API
    try {
      const olUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
      const response = await Promise.race([
        fetch(olUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]);
      
      if (response.ok && response.status === 200) {
        console.log(`✓ Found cover for ISBN ${cleanISBN} (OpenLibrary)`);
        return olUrl;
      }
    } catch (err) {
      console.log(`OpenLibrary API failed for ${cleanISBN}`);
    }
    
    console.warn(`⚠ No image found for ISBN ${cleanISBN}`);
    return '';
  } catch (err) {
    console.warn(`⚠ ISBN lookup failed for ${isbn}:`, err.message);
    return '';
  }
}

// Get image dimensions
async function getImageDimensions(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => {
      resolve({ width: 140, height: 240 }); // Default dimensions
    };
    
    img.src = imageUrl;
  });
}
async function getColorFromImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        
        // Draw center portion of image
        ctx.drawImage(img, img.width / 2 - 25, img.height / 2 - 25, 50, 50, 0, 0, 50, 50);
        
        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        const pixelCount = data.length / 4;
        r = Math.round(r / pixelCount);
        g = Math.round(g / pixelCount);
        b = Math.round(b / pixelCount);
        
        const color = `rgb(${r}, ${g}, ${b})`;
        console.log(`✓ Extracted color: ${color}`);
        resolve(color);
      } catch (err) {
        console.warn('Color extraction failed:', err);
        resolve('');
      }
    };
    
    img.onerror = () => {
      console.warn('Failed to load image for color extraction');
      resolve('');
    };
    
    img.src = imageUrl;
  });
}

function renderShelf(books) {
  const container = document.querySelector('#book-list');
  if (!container) return;
  container.innerHTML = '';

  // layout: left frame, right shelf
  const layout = document.createElement('div');
  layout.className = 'bookshelf-layout';

  // frame (left)
  const frame = document.createElement('div');
  frame.className = 'frame';
  frame.innerHTML = `
    <div class="frame-inner">
      <img id="cover-image" alt="cover preview">
      <div class="frame-empty">画像をここに表示</div>
    </div>
    <div class="frame-caption" id="frame-caption"></div>
  `;

  // shelf (right) - stacked books with info above spine
  const shelf = document.createElement('div');
  shelf.className = 'shelf';
  const row = document.createElement('div');
  row.className = 'spine-row';

  const coverImg = frame.querySelector('#cover-image');
  const coverEmpty = frame.querySelector('.frame-empty');
  const caption = frame.querySelector('#frame-caption');

  books.forEach((b) => {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';

    // info section above spine
    const info = document.createElement('div');
    info.className = 'book-info';
    info.innerHTML = `
      <div class="book-title">${b.title || '無題'}</div>
      <div class="book-author">${b.author || ''}</div>
      <div class="book-publisher">${b.publisher || ''}</div>
      <div class="book-year">${b.year || ''}</div>
    `;

    // spine (colored bar)
    const spine = document.createElement('a');
    spine.className = 'spine';
    spine.style.background = '#ffffff';
    spine.setAttribute('aria-label', b.title || '無題');
    spine.dataset.cover = b.cover || '';
    spine.dataset.title = b.title || '';
    spine.dataset.author = b.author || '';
    spine.dataset.publisher = b.publisher || '';
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

    // hover: show cover in frame
    bookItem.addEventListener('mouseenter', async () => {
      const url = spine.dataset.cover;
      if (url) {
        // Try loading the image, fallback to OpenLibrary if it fails
        const img = new Image();
        img.onload = () => {
          coverImg.src = url;
          coverImg.style.display = 'block';
          coverEmpty.style.display = 'none';
          console.log(`✓ Image loaded successfully: ${url}`);

          // Keep frame size fixed so shelf position never shifts.
          coverImg.style.objectFit = 'contain';
        };
        img.onerror = async () => {
          console.warn(`⚠ Failed to load: ${url}, trying OpenLibrary...`);
          const isbn = spine.dataset.isbn;
          if (isbn) {
            const cleanISBN = String(isbn).replace(/[\-\s]/g, '');
            const olUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
            const img2 = new Image();
            img2.onload = () => {
              coverImg.src = olUrl;
              coverImg.style.display = 'block';
              coverEmpty.style.display = 'none';
              coverImg.style.objectFit = 'contain';
              console.log(`✓ Fallback loaded: ${olUrl}`);
            };
            img2.onerror = () => {
              console.warn(`✗ All attempts failed for ISBN ${cleanISBN}`);
              coverImg.style.display = 'none';
              coverEmpty.style.display = 'flex';
            };
            img2.src = olUrl;
          } else {
            coverImg.style.display = 'none';
            coverEmpty.style.display = 'flex';
          }
        };
        img.src = url;
      } else {
        coverImg.src = '';
        coverImg.style.display = 'none';
        coverEmpty.style.display = 'flex';
      }
      caption.textContent = spine.dataset.title || '';
    });

    bookItem.appendChild(info);
    bookItem.appendChild(spine);
    row.appendChild(bookItem);
    
    // Adjust spine height and color based on cover image
    if (b.cover) {
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

      // 文庫本サイズ
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

      // 単行本サイズ
      if (title.includes('スラムダンク') || title.includes('ハイキュー') || title.includes('学園ベビーシッターズ')) {
        spineWidth = tankobonWidth;
        spineHeight = tankobonHeight;
        spineTitleSize = 12;
        spineAuthorSize = 9;
      }

      // 絵本サイズ
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
    }
  });

  const base = document.createElement('div');
  base.className = 'shelf-base';

  shelf.appendChild(row);
  shelf.appendChild(base);

  layout.appendChild(frame);
  layout.appendChild(shelf);
  container.appendChild(layout);
}

async function loadBooks() {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec');
    const data = await response.json();

    // Adjust the filter key if your sheet uses a different column name for owner
    const myData = data.filter(d => d.name === 'Kurosaki');

    const palette = ['#f47272', '#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#67e8f9', '#a78bfa'];

    // Map spreadsheet rows to books, attempt to fetch covers from ISBN
    let books = await Promise.all(
      myData.slice(0, 7).map(async (d, i) => {
        // Use existing cover field if provided, otherwise fetch from ISBN
        let cover = d.cover || d.image || d.thumbnail || '';
        if (!cover && d.isbn) {
          cover = await getBookCoverFromISBN(d.isbn);
        }
        return {
          title: d.title || d.book || d.name || '無題',
          author: d.author || d.writer || '',
          publisher: d.publisher || d.pub || '',
          year: d.year || '',
          isbn: d.isbn || '',
          href: d.href || d.link || `book${i + 1}.html`,
          color: palette[i % palette.length],
          cover: cover
        };
      })
    );

    if (books.length === 0) {
      // fallback placeholders
      const placeholders = Array.from({ length: 7 }).map((_, i) => ({
        title: `本の題名${i + 1}`,
        author: '著者名',
        publisher: '出版社',
        year: '年',
        href: `book${i + 1}.html`,
        color: palette[i % palette.length],
        cover: ''
      }));
      renderShelf(placeholders);
    } else {
      renderShelf(books);
    }
  } catch (err) {
    console.error('loadBooks error', err);
    const palette = ['#f47272', '#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#67e8f9', '#a78bfa'];
    renderShelf(Array.from({ length: 7 }).map((_, i) => ({
      title: `本の題名${i + 1}`,
      author: '著者名',
      publisher: '出版社',
      year: '年',
      href: `book${i + 1}.html`,
      color: palette[i % palette.length],
      cover: ''
    })));
  }
}

loadBooks();
