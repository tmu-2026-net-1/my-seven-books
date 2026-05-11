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
      summary: "敵同士の家に生まれた少年ロミオと少女ジュリエット。許されない恋だとわかっていても、ふたりは強く惹かれ合っていく。秘密の出会い、すれ違う想い、そして運命に翻弄される結末――。何百年経っても愛され続ける、世界で最も悲しい恋の物語。",
      recommend: "純愛や悲劇的な物語が好きな人",
      review: "私が小学生の頃に出会った大好きな物語です。タイトルのネームバリューの割に中身を知ってる人がとても少ない物語だと思います。戯曲の脚本なので少し読みにくいところもありますが、その分時代背景の解説なども載っており読みやすいです。有名な「ロミオ、どうしてあなたはロミオなの？」の場面の訳がどの訳本の中でも1番綺麗だと思っています。"
    },
    "なんでも魔女商会13 星くずのブラックドレス": {
      img: "../images/blackdress.JPG",
      summary: "お客さまにぴったりの服を仕立ててくれる“なんでも魔女商会”。今回の依頼は、お仕立て支店の魔女ポプリン。名門一族の娘にウェディングドレスを注文されたポプリンは大変な失敗を失敗をしてしまう。そんなポプリンに店主のシルクがしたアドバイスとは？読めばきっと、自分だけの「大切」を見つけたくなる物語。",
      recommend: "ファンタジーや成長物語、そして服のデザインが好きな人",
      review: "小学生の頃に愛読していたシリーズの一冊です。この本の中には主人公のシルクがデザインしたデザイン画が毎回必ず入っています。可愛くてキラキラしたドレスのデザインに心を動かされました。今絵を描くことが好きなのはこの本のおかげかもしれません。その中でも1番エピソードが好きなこの本を選びました。"
    },
    "蒼穹の昴 1": {
      img: "../images/subaru.JPG",
      summary: "貧しい少年・春児は「昴」という星に導かれるように、激動の清王朝へと足を踏み入れる。一方、秀才の文秀もまた、それぞれの夢を抱えて時代の渦へ――。壮大な歴史の中で交差する友情、野望、陰謀。まるで映画のようなスケールで描かれる、中国歴史ロマンの傑作。",
      recommend: "歴史小説や中国史に興味がある人",
      review: "宝塚歌劇での舞台化を機に読んだ物語です。花として大輪を咲かせ、そして散っていくような清王朝と、その激動の時代を生きた登場人物たちにページを捲る手が止まりませんでした。全4巻ありますが、一気に読み切ってしまったことを思い出します。"
    },
    "BLEACH 12": {
      img: "../images/bleach.JPG",
      summary: "幽霊が見える高校生・黒崎一護は、ある日“死神”の力を手にしてしまう。人間を襲う怪物「虚（ホロウ）」との戦い、仲間との絆、次々と明かされる秘密――。スタイリッシュなバトルと熱すぎる名言の連続で、一気に世界へ引き込まれる大人気作品。",
      recommend: "バトル漫画や友情物語が好きな人",
      review: "キこの漫画にはコロナの自粛期間中に出会いました。3日で公開されている約40巻を読み切り、自分のお金で全巻初めて集めました。その中でも、この巻の表紙である藍染惣右介のことがとても好きになりました。なのでこの巻を選びました。キャラクターデザインが何より大好きで、今の自分のデザインの要素に少なからず取り込まれた漫画だと思います。"
    },
    "「キャラクター」のデザイン&描き方": {
      img: "../images/kakikata.JPG",
      summary: "キャラクターデザインのコツや実践的な描き方を解説する一冊。感覚ではなく、理論的な観点からキャラクターデザインを解説しており、キャラクターの魅力を引き出すための具体的なテクニックや、デザインの基本原則を学ぶことができる。実用的で初心者にも分かりやすい内容で、キャラクターデザインのスキルアップに役立つ一冊。",
      recommend: "キャラクターデザインに興味がある人",
      review: "私が最初に出会った技術書な気がします。この本を買う前からキャラクターデザインが好きで、度々デザインしていたのですが、この本に出会ってからキャラクターデザインの見方が変わりました。私のキャラクターデザインの基礎を作ってくれた大切な一冊です。"
    },
    "かげきしょうじょ！！ 1": {
      img: "../images/syoujo.JPG",
      summary: "未来のスターを夢見る少女たちが集う、歌劇学校。ライバルでもあり仲間でもある彼女たちは、悩み、ぶつかり合いながら舞台を目指して成長していく。キラキラした青春だけじゃない、夢に本気で向き合う姿に心を掴まれる青春ドラマ。",
      recommend: "青春・努力・夢の物語が好きな人",
      review: "私は宝塚歌劇が好きなので、それをモチーフとした漫画ということで最初は手に取りました。綺麗事だけじゃなく、がむしゃらにスターを目指して駆け抜けるキャラクターたちがとても大好きです。自分の既に持っている知識と合わせて楽しんだり、キャラクターの今後を予想したりとまた別の方向で楽しめるのも大好きです。"
    },
    "二月の勝者-絶対合格の教室- 1": {
      img: "../images/syousya.JPG",
      summary: "「中学受験は、課金ゲームだ。」そんな衝撃的な言葉を放つ最強塾講師・黒木。成績、親子関係、プレッシャー…受験に挑む子どもたちのリアルが、時に苦しく、時に熱く描かれる。勉強の話なのに、気づけば続きが止まらなくなる受験エンタメ漫画！",
      recommend: "受験に関心/経験がある人",
      review: "自分が中学受験をしたので特に刺さりました。なぜか読み進めていくたびに、過去の自分に照らし合わせていた、そんな気がします。生々しくリアルに描かれているからこそ、キャラクターたちが困難を乗り越えた時は私も心から嬉しくなり、キャラクターたちが苦しんでいる時我也涙が目に浮かんでいました。"
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
