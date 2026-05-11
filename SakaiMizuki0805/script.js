const colors = ['#666a6d', '#7d7770', '#565c54', '#454b54', '#6b5e5b', '#575757', '#635d56'];

async function loadBooks() {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
    const data = await response.json();
    const originalData = data.filter(d => d.name === "Sakai");

    const track = document.getElementById('shelf-track');
    track.innerHTML = "";

    const repeatCount = 21;
    let allBooks = [];

    for (let i = 0; i < repeatCount; i++) {
        allBooks = allBooks.concat(originalData.map((book, index) => ({ ...book, originalIndex: index })));
    }

    allBooks.forEach((book, i) => {
        const spine = document.createElement("div");
        spine.className = "spine";

        const color = colors[book.originalIndex % colors.length];
        const height = 260 + (book.originalIndex % 3) * 15;

        spine.style.backgroundColor = color;
        spine.style.height = `${height}px`;

        const displayIndex = (book.originalIndex + 1).toString().padStart(2, '0');

        const titleLen = book.title.length || 1;
        const authorLen = book.author.length || 1;

        let titleFontSize = "1rem";
        let titleLineHeight = "1.3";
        
        if (titleLen >= 30) {
            titleFontSize = "0.45rem";
            titleLineHeight = "1.5";
        } else if (titleLen >= 20) {
            titleFontSize = "0.6rem";
            titleLineHeight = "1.45";
        } else if (titleLen >= 14) {
            titleFontSize = "0.75rem";
            titleLineHeight = "1.4";
        } else if (titleLen >= 8) {
            titleFontSize = "0.85rem";
            titleLineHeight = "1.35";
        }

        let authorFontSize = "0.75rem";
        if (authorLen >= 15) {
            authorFontSize = "0.45rem";
        } else if (authorLen >= 10) {
            authorFontSize = "0.55rem";
        } else if (authorLen >= 6) {
            authorFontSize = "0.65rem";
        }

        spine.innerHTML = `
            <div class="spine-index">${displayIndex}</div>
            <div class="spine-title-container">
                <div class="spine-title" style="font-size: ${titleFontSize}; line-height: ${titleLineHeight};">${book.title}</div>
            </div>
            <div class="spine-author" style="font-size: ${authorFontSize};">${book.author}</div>
        `;

        spine.addEventListener('mouseenter', () => openBookPreview(book, displayIndex, color));
        
        track.appendChild(spine);
    });

    track.addEventListener('mouseleave', closeBookPreview);

    initInfiniteScroll(track, originalData.length, repeatCount);
}

function initInfiniteScroll(track, setSize, repeatCount) {
    let isDragging = false;
    let startX = 0;

    const spineWidth = 62; 
    const setWidth = spineWidth * setSize;
    
    let scrollPos = -(setWidth * Math.floor(repeatCount / 2));
    track.style.transform = `translateX(${scrollPos}px)`;

    function updatePosition() {
        const centerOffset = -(setWidth * Math.floor(repeatCount / 2));
        if (scrollPos > centerOffset + setWidth) scrollPos -= setWidth;
        if (scrollPos < centerOffset - setWidth) scrollPos += setWidth;
        track.style.transform = `translateX(${scrollPos}px)`;
    }

    window.addEventListener('wheel', (e) => {
        scrollPos -= e.deltaY * 0.9;
        scrollPos -= e.deltaX * 0.9;
        updatePosition();
        closeBookPreview();
    });

    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scrollPos;
        track.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        scrollPos = e.pageX - startX;
        updatePosition();
        closeBookPreview();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });
}

const readingArea = document.getElementById('reading-area');
const coverFront = document.getElementById('cover-front');
let currentBookIndex = null;
let transitionTimeout;

function openBookPreview(book, index, color) {
    if (currentBookIndex === index) return;
    
    const delayTime = (currentBookIndex !== null) ? 450 : 50;
    currentBookIndex = index;

    readingArea.classList.remove('active');
    clearTimeout(transitionTimeout);

    transitionTimeout = setTimeout(() => {
        document.getElementById('top-index').textContent = `No. ${index}`;
        document.getElementById('top-title').textContent = book.title;
        document.getElementById('top-author').textContent = book.author;
        document.getElementById('top-isbn').textContent = `ISBN: ${book.isbn}`;

        const formattedComment = (book.comment || "").replace(/\n/g, '<br>');
        document.getElementById('top-comment').innerHTML = formattedComment;
        
        coverFront.style.backgroundColor = color;
        readingArea.classList.add('active');
    }, delayTime); 
}

function closeBookPreview() {
    currentBookIndex = null;
    clearTimeout(transitionTimeout);
    readingArea.classList.remove('active');
}

loadBooks();