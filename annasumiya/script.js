async function loadBooksAndPlates() {
  const container = document.querySelector("#book-list");
  container.innerHTML = "";

  const items = [
    // 1段目
    [
      { type: "plate", image: "saradai.png" },
      { type: "book", image: "booknishi.jpeg" },
      { type: "book", image: "bookazukari.jpeg" },
      { type: "plate", image: "saradai.png" }
    ],
    // 2段目
    [
      { type: "book", image: "bookchiisai.jpeg" },
      { type: "plate", image: "saradai.png" },
      { type: "book", image: "booknekomura.jpeg" },
      { type: "small-plate", image: "sarashou.png" },
      { type: "plate", image: "saradai.png" }
    ],
    // 3段目
    [
      { type: "book", image: "booknno.jpeg" },
      { type: "plate", image: "saradai.png" },
      { type: "book", image: "bookrive.jpeg" },
      { type: "book", image: "bookryuusei.jpeg" },
      { type: "plate", image: "saradai.png" }
    ]
  ];

  items.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    rowDiv.style.justifyContent = "center";
    rowDiv.style.gap = "1rem";

    row.forEach(item => {
      const element = document.createElement("div");

      if (item.type === "book") {
        element.classList.add("book-item");
        element.style.cursor = "pointer"; // Add pointer cursor
        element.onclick = () => {
          window.location.href = `detail.html?img=${encodeURIComponent(item.image)}`;
        };
        element.innerHTML = `
          <img src="${item.image}" alt="Book Image" style="width:200px; height:300px; object-fit:cover; border-radius:5px;">
        `;
      } else if (item.type === "plate") {
        element.classList.add("plate");
        element.innerHTML = `
          <img src="${item.image}" alt="Plate Image" style="width:100px; height:100px; object-fit:cover; border-radius:50%;">
        `;
      } else if (item.type === "small-plate") {
        element.classList.add("small-plate");
        element.innerHTML = `
          <img src="${item.image}" alt="Small Plate Image" style="width:80px; height:80px; object-fit:cover; border-radius:50%;">
        `;
      }

      rowDiv.appendChild(element);
    });

    container.appendChild(rowDiv);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadBooksAndPlates();
});