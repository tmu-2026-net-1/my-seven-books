// book.js
// URLのクエリパラメータからbookIdを取得し、APIから該当データを取得して表示
(async function() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');
  if (!bookId) return;
  const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
  const data = await response.json();
  const mydata = data.filter(d => d.name === "Machimoto");
  const book = mydata[bookId];
  if (!book) return;
  document.getElementById('book-title').textContent = book.title;
  document.getElementById('book-author').textContent = '著者: ' + book.author;
  document.getElementById('book-publisher').textContent = '出版社: ' + book.publisher;
  document.getElementById('book-year').textContent = '出版年: ' + book.year;
  document.getElementById('book-isbn').textContent = 'ISBN: ' + (book.isbn || 'なし');
  // 画像・レビュー・あらすじ・おすすめ
  const bookData = {
    "ロミオとジュリエット": {
      img: "../images/RJ.jpg",
      summary: "運命に翻弄される若い恋人たちの悲劇。",
      recommend: "純愛や悲劇的な物語が好きな人",
      review: "シェイクスピアの名作。時代を超えて心に響く。"
    },
    "なんでも魔女商会13 星くずのブラックドレス": {
      img: "../images/blackdress.JPG",
      summary: "魔女商会で起こる不思議な出来事と成長の物語。",
      recommend: "ファンタジーや成長物語が好きな人",
      review: "優しい世界観で癒される。子どもにもおすすめ。"
    },
    "蒼穹の昴 1": {
      img: "../images/subaru.JPG",
      summary: "清朝末期の中国を舞台にした壮大な歴史ドラマ。",
      recommend: "歴史小説や中国史に興味がある人",
      review: "重厚なストーリーで一気に読める。"
    },
    "BLEACH 12": {
      img: "../images/bleach.JPG",
      summary: "死神となった高校生のバトルと成長。",
      recommend: "バトル漫画や友情物語が好きな人",
      review: "キャラが魅力的でテンポも良い。"
    },
    "「キャラクター」のデザイン&描き方": {
      img: "../images/kakikata.JPG",
      summary: "キャラクターデザインのコツや実践的な描き方を解説。",
      recommend: "イラストやデザインに興味がある人",
      review: "実用的で初心者にも分かりやすい。"
    },
    "かげきしょうじょ！！ 1": {
      img: "../images/syoujo.JPG",
      summary: "音楽学校で夢を追う少女たちの青春群像劇。",
      recommend: "青春・努力・夢の物語が好きな人",
      review: "キャラの成長が丁寧に描かれていて感動。"
    },
    "二月の勝者-絶対合格の教室- 1": {
      img: "../images/syousya.JPG",
      summary: "中学受験をテーマにしたリアルな学園ドラマ。",
      recommend: "教育や受験に関心がある人",
      review: "現代の教育事情がよく分かる。親にもおすすめ。"
    }
  };
  const d = bookData[book.title] || {};
  const img = document.getElementById('book-image');
  img.src = d.img || "../images/default.jpg";
  img.alt = book.title;
  document.getElementById('summary-body').textContent = d.summary || '';
  document.getElementById('recommend-body').textContent = d.recommend || '';
  document.getElementById('review-body').textContent = d.review || '';
  // Amazonリンク（個別ページのみ）
  if (book.isbn) {
    document.getElementById('book-amazon').innerHTML = `<a class="amazon-link" href="https://www.amazon.co.jp/s?k=${book.isbn}" target="_blank">Amazonで探す</a>`;
  } else {
    document.getElementById('book-amazon').innerHTML = '';
  }
})();
