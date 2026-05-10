let allBooks = [];
let infoOverlay = null;
let infoCardTitle = null;
let infoCardBody = null;
let infoCloseButton = null;

function updatePageScale() {
    const baseWidth = 1600;
    const baseHeight = 1000;
    const availableWidth = window.innerWidth - 48;
    const availableHeight = window.innerHeight - 48;
    const scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);

    document.documentElement.style.setProperty("--page-scale", scale.toFixed(4));
}

function ensureInfoElements() {
    infoOverlay = document.querySelector(".info-overlay");
    infoCardTitle = document.querySelector(".info-card-title");
    infoCardBody = document.querySelector(".info-card-body");
    infoCloseButton = document.querySelector(".info-close");
}

function openInfoCard(book, bookIndex = -1) {
    if (!infoOverlay || !infoCardTitle || !infoCardBody) {
        return;
    }

    if (book) {
        const notesByIndex = [
            "ばけものの少年といじめられっ子の少女の成長を描いた物語。リアルとファンタジーが共存していて、住野よるさんの世界観に引き込まれる作品である。特に最後の一文が印象に残っている。私はこの本から、自分を受け入れて1歩を踏み出すことの大切さを学んだ。",
            "自分たちの修学旅行で、悪い大人たちを知恵といたずらでやっつける痛快な物語。ぼくらシリーズはどの話も大人VS子供の対決が面白く、小学生の頃によく読んでいた。登場人物たちはそれぞれ異なる個性を持っているが、一人一人に活躍する場面があるところが魅力の一つである。｢ぼくら｣たちの自由な発想や行動に元気をもらえる作品である。",
            "死んで魂となった僕が、ある天使に導かれ人生を見つめ直す物語。森絵都さんの代表作である。文章は軽快でとても読みやすい。人は誰しもがカラフルであり、見えているものが全てではないことを教えてくれた。励まされる言葉がたくさんあり、何度でも読み返したくなる作品である。",
            "代書屋を営む主人公と個性的な鎌倉の人々が織りなす温かい物語。四季折々の鎌倉の風景が、小川糸さんの繊細で柔らかい筆致で書かれている。主人公が代書した文字がそのまま記載されており、実際に手紙を読んでいる感覚を味わえるのも魅力の一つである。作中には様々な文房具が登場し、文房具に興味を持つきっかけになった本である。",
            "反抗期の中学生の少女が戦時中にタイムスリップし、特攻隊の青年と恋をする物語。テーマは重いが、軽やかな文体でまとめられているため読みやすい。戦争で日本が負けると知っている主人公と、それでも戦おうとする青年がとの切なく苦しい関係が描かれている。当たり前の日常への感謝を改めて感じた作品である。",
            "薙刀に出会った高校生が、薙刀部の仲間たちと切磋琢磨してインターハイを目指す物語。自分自身も薙刀をしていた頃にこの漫画を読み、主人公たちが汗水を垂らして必死で薙刀を振る姿に胸が熱くなった。試合シーンは特に迫力があり、ストーリー展開も面白い。最初は未熟だった主人公が努力を積み重ねて成長していく姿が魅力的な作品である。",
            "わかったさんが不思議なシンフォニーに招待され、森を冒険しながらレモンドーナツを作る物語。砂糖の砂場や油の池などが描かれており、子供の頃に想像するような不思議な世界観に惹かれた。シリーズの中でもこの話が一番印象に残っており、小学生の頃に何回も読んでいた。巻末に作中で作ったお菓子のレシピが載っているところも魅力の一つである。",
        ];

        const rightText = notesByIndex[bookIndex] ?? "";

        infoCardTitle.textContent = book.title ?? "";
        infoCardBody.innerHTML = `
            <div class="info-grid">
                <div class="info-meta">
                    <div class="author"><span class="meta-label">著者:</span> ${book.author ?? ""}</div>
                    <div class="author"><span class="meta-label">出版社:</span> ${book.publisher ?? ""}</div>
                    <div class="author"><span class="meta-label">出版年:</span> ${book.year ?? ""}</div>
                </div>
                <div class="book-note">${rightText}</div>
            </div>
        `;
    } else {
        infoCardTitle.textContent = "";
        infoCardBody.innerHTML = `<div class="author">情報が見つかりませんでした。</div>`;
    }

    infoOverlay.classList.add("is-open");
    infoOverlay.setAttribute("aria-hidden", "false");
}

function closeInfoCard() {
    if (!infoOverlay) {
        return;
    }

    infoOverlay.classList.remove("is-open");
    infoOverlay.setAttribute("aria-hidden", "true");
}

async function loadBooks() {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
    const data = await response.json(); 
    //const dataWithISBN = data.filter(d => d.isbn);
    //console.log(dataWithISBN);
    allBooks = data.slice(98, 105);
    const myData = allBooks;
    console.log(myData);

    const escapeHTML = (str) => String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const tooltipTexts = [
        "ばけものの少年といじめられっ子の少女の成長を描いた物語。",
        "自分たちの修学旅行で、悪い大人たちを知恵といたずらでやっつける痛快な物語。",
        "死んで魂となった僕が、ある天使に導かれ人生を見つめ直す物語。",
        "代書屋を営む主人公と個性的な鎌倉の人々が織りなす温かい物語。",
        "反抗期の中学生の少女が戦時中にタイムスリップし、特攻隊の青年と恋をする物語。",
        "薙刀に出会った高校生が、薙刀部の仲間たちと切磋琢磨してインターハイを目指す物語。",
        "わかったさんが不思議なシンフォニーに招待され、森を冒険しながらレモンドーナツを作る物語。",
    ];

    const bookTooltips = document.querySelectorAll(".book-illustration .book-tooltip");
    bookTooltips.forEach((tooltip, index) => {
        const title = allBooks[index]?.title ?? "";
        const text = tooltipTexts[index] ?? "";
        tooltip.innerHTML = `<span class="tooltip-title">${escapeHTML(title)}</span>` + (text ? `<span class="tooltip-sub">${escapeHTML(text)}</span>` : "");
    });

    const bookIllustrations = document.querySelector(".book-illustrations");
    // 各本の正確な位置（padding-left: 90px + 各本の left オフセットで計算）
    const bookHitRanges = [
        { start: -60, end: 360 },      // 1番目: 90 - 150 = -60, -60 + 420 = 360
        { start: 180, end: 600 },      // 2番目: 510 - 330 = 180, 180 + 420 = 600
        { start: 420, end: 840 },      // 3番目: 930 - 510 = 420, 420 + 420 = 840
        { start: 660, end: 1080 },     // 4番目: 1350 - 690 = 660, 660 + 420 = 1080
        { start: 900, end: 1320 },     // 5番目: 1770 - 870 = 900, 900 + 420 = 1320
        { start: 1140, end: 1560 },    // 6番目: 2190 - 1050 = 1140, 1140 + 420 = 1560
        { start: 1380, end: 1800 },    // 7番目: 2610 - 1230 = 1380, 1380 + 420 = 1800
    ];

    bookIllustrations?.addEventListener("click", (event) => {
        const rowRect = bookIllustrations.getBoundingClientRect();
        const scale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--page-scale")) || 1;
        const localX = (event.clientX - rowRect.left) / scale;
        const bookIndex = bookHitRanges.findIndex((range) => localX >= range.start && localX < range.end);

        console.log(`Click at localX: ${localX.toFixed(2)}, scale: ${scale.toFixed(4)}, bookIndex: ${bookIndex}`);

        if (bookIndex >= 0) {
            openInfoCard(allBooks[bookIndex], bookIndex);
        }
    });
}

ensureInfoElements();
infoOverlay?.addEventListener("click", (event) => {
    if (event.target === infoOverlay) {
        closeInfoCard();
    }
});

infoCloseButton?.addEventListener("click", closeInfoCard);
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeInfoCard();
    }
});

updatePageScale();
window.addEventListener("resize", updatePageScale);
loadBooks();