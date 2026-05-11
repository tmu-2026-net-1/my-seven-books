let mydata = [];
let bookImages = [];
let pickupIndex = 0;
let intervalId = null;

const imageToHTML = {
  "pone.png": "book1.html",
  "genso.png": "book2.html",
  "Yoga.png": "book3.html",
  "nanairo.png": "book4.html",
  "Orange.png": "book5.html",
  "hoshi.png": "book6.html",
  "wakusei.png": "book7.html"
};

const pickupTexts= [
  {title: "ファンタジーが\nつまった\nアートブック", text: "『約束のネバーランド』作画の\n出水ぽすか氏が描く、\n緻密なイラストを収録"},
  {title: "美しく楽しく、\n元素を知る", text: "誰でも楽しめる元素の雑学書"},
  {title: "飾らない君と、\n本当の私", text: "映画化もされた、\n自分と向き合う高校生たちの\n青春ストーリー"},
  {title: "大嫌いで\n大好きな、\n私の親友", text: "学生の女子グループの\n友情と葛藤を描いた少女漫画"},
  {title: "未来の私から、\n手紙が届いた", text: "自分の後悔と向き合い、\n未来を少しずつ変えていく物語"},
  {title: "親なんて\n思い出したくも\nなかったのに", text: "自分を捨てた母親とすれ違う\n娘を描いた、\n切なくも温かい長編小説"},
  {title: "ジブンは\n「宇宙人」だ", text: "あれはおかあさんじゃない。きっとそうだ。\nだって、おあかさんはあんな顔しない。"}
]

async function loadData() { //asyncによる非同期関数宣言
  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  mydata = (await response.json()).filter(d => d.name === "Ishii"); //GoogleSheetからデータを取得し、nameがIshiiのものだけをmydataに格納

  const imageFiles= ["pone.png", "genso.png", "Yoga.png", "nanairo.png", "Orange.png", "hoshi.png", "wakusei.png"];

  bookImages = imageFiles.map((image, idx) => ({
    image,
    html:imageToHTML[image],
    data: mydata[idx] || {} //対応するGoogleSheetのデータがない場合は空のオブジェクトを使用
  }))

  renderBooks();

  if (intervalId !== null) clearInterval(intervalId);
  intervalId = setInterval(() =>{
    pickupIndex = (pickupIndex + 1) % bookImages.length; //pickupIndexを更新
    renderBooks();
  },5500);
  }


function renderBooks() { //asyncによる非同期関数宣言
  const container = document.querySelector("#book-list");
  if (!container || bookImages.length === 0) return; //containerが存在しない、もしくはmydataが空の場合は処理をしない
  container.innerHTML = ""; //コンテナの中をからに

  const pickupBook = bookImages[pickupIndex]; //pickupBookにmydataのpickupIndex番目の要素を格納
  const unpickupBooks = bookImages.filter((_, index) => index !== pickupIndex); //unpickupBooksにpickupIndex番目以外の要素を格納

  const pickupArea = document.createElement("div"); //pickupAreaを作成
  pickupArea.className = "pickup-area"; //pickupAreaにクラス名を追加
  
  const unpickupArea = document.createElement("div"); //unpickupAreaを作成
  unpickupArea.className = "unpickup-area"; //unpickupAreaにクラス名を追加

const pickupCard = document.createElement("div");
pickupCard.className = "pickup-card";

const bookLabel = document.createElement("div");
bookLabel.className = "pickup-label";
bookLabel.innerHTML = `
  <div class="book-label-title">${pickupBook.data.title || 'タイトル不明'}</div>
  <div class="book-label-author">${pickupBook.data.author || ''}</div>
`;

const pickupHTMl = document.createElement("div");
pickupHTMl.className = "book-item-pickup";
pickupHTMl.innerHTML = `
 <button class="main-book-button" data-file="${pickupBook.html}" aria-label="${pickupBook.data.title || 'book'}">
    <img src="images/${pickupBook.image}" alt="${pickupBook.data.title || ''}">
    <div class="pickup-info">
      <div class="pickup-title">${pickupTexts[pickupIndex].title}</div>
      <div class="pickup-text">${pickupTexts[pickupIndex].text}</div>
    </div>
  </button>
`;

pickupCard.appendChild(bookLabel);
pickupCard.appendChild(pickupHTMl);
pickupArea.appendChild(pickupCard);



  unpickupBooks.forEach(book => {
    const item = document.createElement("div"); //書籍一冊用のdivを作成
    item.classList.add("book-item"); //itemにbook-itemクラスを追加
    item.innerHTML = `
      <button class="sub-book-button" data-file="${book.html}" aria-label="${book.data.title || 'book'}">
        <img src="images/${book.image}" alt="${book.data.title || ''}">
        <div class="book-info">
          <div class="title">${book.data.title || 'タイトル不明'}</div>
          <div class="author">${book.data.author || ''}</div>
        </div>
      </button>`;
    unpickupArea.appendChild(item); //unpickupAreaにitemを追加
  });


  container?.appendChild(pickupArea); //pickupAreaをcontainerに追加
  container?.appendChild(unpickupArea); //unpickupAreaをcontainerに追加

  container.querySelectorAll("button[data-file]").forEach(button => {
    button.onclick = () => {
      const url = button.getAttribute("data-file");
      if (url && url !=="#") location.href = url;
    }
  });
  
}
loadData();


document.addEventListener("DOMContentLoaded", () => {
  const commentButton = document.querySelector("#commentToggle");
  const comment = document.querySelector("#bookComment");

  if (!commentButton || !comment) return;

  commentButton.addEventListener("click", () => {
    commentButton.style.display = "none";
    comment.style.display = "block";
  });
});
