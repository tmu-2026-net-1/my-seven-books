const container = document.getElementById('container');
const loading = document.getElementById('loading');

let fallingItems = [];
let animationId;
let globalPlacementCount = 0;
let isPaused = false;
let targetItem = null;
let nextInitialY = -200;
const verticalGap = 120;

function waitForImageLoad(img, timeoutMs = 8000) {
    return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timerId);
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            resolve();
        };

        const onLoad = () => finish();
        const onError = () => finish();
        const timerId = window.setTimeout(finish, timeoutMs);

        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onError, { once: true });

        if (img.complete) {
            finish();
        }
    });
}

async function init() {
    // データの取得
    const response = await fetch("https://script.google.com/macros/s/AKfycbzcbPFBgkWfbA4BsX9EruALPgvwk1mkE-1mwX4Nv6aG1eBkQXIYtOtg9Y7tEYX5zypo/exec");
    const data = await response.json();
    const dataWithISBN = data.filter(d => d.isbn);
    const myData = dataWithISBN.filter(d => d.name === "Tahara");

    // 各データについて要素を生成し、書影の読み込み完了を待つ
    for (const data of myData) {
        await createFallingItem(data);
    }

    // すべて描画できたらローディング画面を消す
    loading.style.display = 'none';

    // マウスホイールによるスクロール操作
    window.addEventListener('wheel', (e) => {
        if (isPaused) {
            isPaused = false;
            if (targetItem) {
                targetItem.element.classList.remove('expanded');
                targetItem = null;
            }
        }
        fallingItems.forEach(item => {
            item.y -= e.deltaY;
        });
    });

    animate();
}

function applyLayout(itemData, isLeft) {
    const { element, imgWrapper, infoDiv } = itemData;
    element.style.flexDirection = isLeft ? 'row' : 'row-reverse';
    imgWrapper.style.marginRight = isLeft ? '-20vw' : '0';
    imgWrapper.style.marginLeft = isLeft ? '0' : '-20vw';
    infoDiv.style.paddingLeft = isLeft ? '24vw' : '40px';
    infoDiv.style.paddingRight = isLeft ? '40px' : '24vw';

    // 回転も適度に交互になるように設定（すこしランダムのノイズを混ぜる）
    const noise = (Math.random() - 0.5) * 10;
    // タイトルに被らないように、上半分が外側を向くよう回転
    const baseAngle = isLeft ? (-15 + noise) : (15 + noise);
    imgWrapper.style.transform = `rotateZ(${baseAngle}deg)`;
}

// 種類をばらけさせる配列
const infoTypes = ['type-manuscript', 'type-memo', 'type-graph', 'type-manuscript', 'type-memo', 'type-graph'];
// 手書きフォントもばらけさせる配列
const fontTypes = ['font-klee'];

function createDetailPaper(className, title, content, typeClass, fontClass) {
    const paper = document.createElement('div');
    paper.className = `detail-paper ${className} ${typeClass} ${fontClass}`;
    
    // 少しランダムに傾ける
    paper.style.transform += ` rotate(${(Math.random() - 0.5) * 15}deg)`;

    const titleEl = document.createElement('div');
    titleEl.className = 'detail-title';
    titleEl.textContent = title;

    const contentEl = document.createElement('div');
    contentEl.className = 'detail-content';
    contentEl.textContent = content || '不明';

    paper.appendChild(titleEl);
    paper.appendChild(contentEl);
    return paper;
}

async function createFallingItem(book) {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-wrapper';
    
    // 交互に左・右へ配置
    const isImageLeft = (globalPlacementCount % 2 === 0);
    const initialY = nextInitialY;

    // 用紙とフォントの種類を順番に選ぶ（まんべんなく散らす）
    const type = infoTypes[globalPlacementCount % infoTypes.length];
    const font = fontTypes[globalPlacementCount % fontTypes.length];

    globalPlacementCount++;

    wrapper.style.transform = `translateY(${initialY}px)`;
    
    const itemData = {
        element: wrapper,
        y: initialY,
        speed: 1.5,
        isLeft: isImageLeft,
        height: 400
    };

    // クリックで中心に移動＆詳細情報を展開する
    wrapper.addEventListener('click', (e) => {
        // もしすでに開いているなら閉じる
        if (targetItem === itemData && isPaused) {
            isPaused = false;
            targetItem.element.classList.remove('expanded');
            targetItem = null;
        } else {
            // 前のものを閉じて新しいものを開く
            if (targetItem) {
                targetItem.element.classList.remove('expanded');
            }
            targetItem = itemData;
            isPaused = true;
            targetItem.element.classList.add('expanded');
        }
    });

    // --- 画像部分 ---
    let coverUrl = null;
    let description = '';
    let publisher = '';
    let publishedDate = '';
    let pageCount = '';
    const isbnStr = book.isbn ? String(book.isbn) : '';
    const isbn = isbnStr.replace(/-/g, '');

    if (isbn) {
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                const info = data.items[0].volumeInfo;
                if (info.imageLinks) {
                    coverUrl = info.imageLinks.thumbnail.replace('http:', 'https:');
                }
                if (info.description) description = info.description;
                if (info.publisher) publisher = info.publisher;
                if (info.publishedDate) publishedDate = info.publishedDate;
                if (info.pageCount) pageCount = info.pageCount + 'ページ';
            }
        } catch (e) {
            console.error("Google Books API fetch error: ", e);
        }
    }

    if (!coverUrl && isbn) coverUrl = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;
    
    const imgWrapper = document.createElement('div');
    imgWrapper.style.zIndex = '2';
    imgWrapper.style.position = 'relative';
    itemData.imgWrapper = imgWrapper;

    const img = document.createElement('img');
    img.src = coverUrl || 'data:image/svg+xml;utf8,<svg width="200" height="280" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="280" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%23666">No Image</text></svg>';
    img.className = 'book-cover';
    imgWrapper.appendChild(img);

    // --- 情報部分（切れ端デザイン） ---
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-paper';
    infoDiv.style.zIndex = '1';
    itemData.infoDiv = infoDiv;
    
    infoDiv.classList.add(type);
    infoDiv.classList.add(font);
    infoDiv.style.setProperty('--rand-rot', `${(Math.random() - 0.5) * 6}deg`);

    const titleEl = document.createElement('h2');
    titleEl.className = 'info-title';
    titleEl.textContent = book.title || '無題';

    const authorEl = document.createElement('p');
    authorEl.className = 'info-author';
    authorEl.textContent = book.author ? `著者: ${book.author}` : '';

    const descEl = document.createElement('div');
    descEl.className = 'info-desc';
    descEl.textContent = description || 'あらすじ情報がありません...';

    infoDiv.appendChild(titleEl);
    infoDiv.appendChild(authorEl);
    infoDiv.appendChild(descEl);

    // --- 詳細情報の小論文たちを追加 ---
    const detail1 = createDetailPaper('detail-1', '出版情報', publisher || '情報なし', 'type-graph', font);
    const detail2 = createDetailPaper('detail-2', '出版日', publishedDate || '情報なし', 'type-memo', font);
    const detail3 = createDetailPaper('detail-3', 'ページ数', pageCount || '情報なし', 'type-manuscript', font);
    wrapper.appendChild(detail1);
    wrapper.appendChild(detail2);
    wrapper.appendChild(detail3);

    // 初期レイアウト適用
    applyLayout(itemData, itemData.isLeft);

    wrapper.appendChild(imgWrapper);
    wrapper.appendChild(infoDiv);
    container.appendChild(wrapper);

    await waitForImageLoad(img);
    itemData.height = wrapper.offsetHeight;
    nextInitialY = initialY - itemData.height - verticalGap;

    fallingItems.push(itemData);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2 - 200; // 要素の大体の中心

    if (isPaused && targetItem) {
        // ターゲットを中心にスナップさせる
        const diff = centerY - targetItem.y;
        const move = diff * 0.1; 
        
        fallingItems.forEach((item) => {
            item.y += move;
            
            // 下に行き過ぎたら上に戻す
            if (item.y > windowHeight + 500) {
                let minY = Infinity;
                fallingItems.forEach(fi => {
                    if (fi.y < minY) minY = fi.y;
                });
                item.y = minY - (item.height || 0) - verticalGap;
                
                item.isLeft = (globalPlacementCount % 2 === 0);
                globalPlacementCount++;
                applyLayout(item, item.isLeft);
            } else if (item.y < -3000) {
                let maxY = -Infinity;
                fallingItems.forEach(fi => {
                    if (fi.y > maxY) maxY = fi.y;
                });
                item.y = maxY + (item.height || 0) + verticalGap;
                item.isLeft = (globalPlacementCount % 2 === 0);
                globalPlacementCount++;
                applyLayout(item, item.isLeft);
            }

            item.element.style.transform = `translateY(${item.y}px)`;
            item.element.style.transition = 'none';
        });

    } else {
        fallingItems.forEach((item) => {
            item.y += item.speed;
            
            if (item.y > windowHeight + 500) {
                let minY = Infinity;
                fallingItems.forEach(fi => {
                    if (fi.y < minY) minY = fi.y;
                });
                item.y = minY - (item.height || 0) - verticalGap;
                item.isLeft = (globalPlacementCount % 2 === 0);
                globalPlacementCount++;
                applyLayout(item, item.isLeft);
            } else if (item.y < -3000) {
                let maxY = -Infinity;
                fallingItems.forEach(fi => {
                    if (fi.y > maxY) maxY = fi.y;
                });
                item.y = maxY + (item.height || 0) + verticalGap;
                item.isLeft = (globalPlacementCount % 2 === 0);
                globalPlacementCount++;
                applyLayout(item, item.isLeft);
            }

            item.element.style.transform = `translateY(${item.y}px)`;
            item.element.style.transition = 'none';
        });
    }
}

init();
