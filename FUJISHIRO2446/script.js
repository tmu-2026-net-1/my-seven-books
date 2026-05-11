async function fetchBookCover(isbn) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].volumeInfo.imageLinks?.thumbnail || null;
    }
  } catch (error) {
    console.error('Error fetching cover:', error);
  }
  return null;
}

async function loadBooks() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  const data = await response.json();
  const myData = data.filter(d => d.name === "Fujishiro");
  console.log(myData);

  // Get SVG container
  const svg = document.querySelector("#books-stack");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 360 700");
  svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

  // Draw vertically stacked books with only the spines visible
  const bookWidth = 260;
  const bookHeight = 30;
  const baseX = 22;
  let yOffset = 12;
  
  myData.forEach((book, index) => {
    // Slight offset and rotation for a hand-stacked look
    const xOffset = (Math.random() - 0.5) * 44;
    const widthVariance = (index % 3) * 6;
    const randomWidth = bookWidth + Math.round((Math.random() - 0.5) * 28);
    const randomHeight = bookHeight + Math.round((Math.random() - 0.5) * 8);
    const defaultFill = "#f7f7f7";
    const hoverFill = "#d7263d";
    
    // Create group for each book
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${baseX + xOffset}, ${yOffset})`);
    g.style.cursor = "pointer";
    
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(-widthVariance * 0.25));
    rect.setAttribute("width", String(bookWidth + widthVariance));
    rect.setAttribute("height", String(randomHeight));
    rect.setAttribute("fill", defaultFill);
    rect.setAttribute("stroke", "#111");
    rect.setAttribute("stroke-width", "2");
    g.appendChild(rect);

    const edgeLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    edgeLine.setAttribute("x1", "8");
    edgeLine.setAttribute("y1", String(randomHeight - 4));
    edgeLine.setAttribute("x2", String(randomWidth - 8));
    edgeLine.setAttribute("y2", String(randomHeight - 4));
    edgeLine.setAttribute("stroke", "#bbb");
    edgeLine.setAttribute("stroke-width", "1");
    g.appendChild(edgeLine);
    
    // Add book title on the spine, keeping the reading direction horizontal
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String((bookWidth + widthVariance) / 2));
    text.setAttribute("y", String(randomHeight / 2 + 1));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "11");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.setAttribute("letter-spacing", "0.2px");
    text.setAttribute("fill", "#111");
    text.setAttribute("pointer-events", "none");
    text.setAttribute("writing-mode", "vertical-rl");
    text.setAttribute("text-orientation", "upright");
    text.setAttribute("glyph-orientation-vertical", "0");
    text.setAttribute("transform", `rotate(90 ${(bookWidth + widthVariance) / 2} ${randomHeight / 2 + 1})`);
    text.textContent = book.title.length > 26 ? `${book.title.slice(0, 25)}…` : book.title;
    g.appendChild(text);

    // Add hover event
    g.addEventListener("mouseenter", async () => {
      rect.setAttribute("fill", hoverFill);
      showBookDetail(book);
    });

    g.addEventListener("mouseleave", () => {
      rect.setAttribute("fill", defaultFill);
    });
    
    svg.appendChild(g);
    yOffset += 32;
  });
}

async function showBookDetail(book) {
  // Update title
  document.querySelector("#detail-title").textContent = book.title;
  document.querySelector("#detail-author").textContent = book.author;
  document.querySelector("#detail-year").textContent = book.year;
  document.querySelector("#detail-publisher").textContent = book.publisher;
  
  // Fetch and display cover
  if (book.isbn) {
    const coverUrl = await fetchBookCover(book.isbn);
    if (coverUrl) {
      document.querySelector("#detail-cover").src = coverUrl;
      document.querySelector("#detail-cover").style.display = "block";
    } else {
      document.querySelector("#detail-cover").style.display = "none";
    }
  } else {
    document.querySelector("#detail-cover").style.display = "none";
  }
}

loadBooks();

