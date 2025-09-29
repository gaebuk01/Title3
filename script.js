const musicData = [
    // musicUrl에는 YouTube 영상 ID (예: 'J9_3hls2RNI')만 넣어야 합니다.
    { id: 'song1', x: 600, y: 300, titleUrl: 'https://i.imgur.com/2VnvYnd.png', musicUrl: 'J9_3hls2RNI', popupImageUrl: 'https://i.imgur.com/2VnvYnd.png' },
    { id: 'song2', x: 1100, y: 500, titleUrl: 'https://i.imgur.com/yuoBtHk.png', musicUrl: 'J9_3hls2RNI', popupImageUrl: 'https://i.imgur.com/yuoBtHk.png' },
    { id: 'song3', x: 1060, y: 1700, titleUrl: 'https://i.imgur.com/xdCf04u.png', musicUrl: 'J9_3hls2RNI', popupImageUrl: 'https://i.imgur.com/xdCf04u.png' },
    { id: 'song4', x: 750, y: 1600, titleUrl: 'https://i.imgur.com/XaKkgtV.png', musicUrl: 'J9_3hls2RNI', popupImageUrl: 'https://i.imgur.com/XaKkgtV.png' },
    { id: 'song5', x: 1200, y: 700, titleUrl: 'https://i.imgur.com/RvPiwCy.png', musicUrl: 'J9_3hls2RNI', popupImageUrl: 'https://i.imgur.com/RvPiwCy.png' },
    { id: 'song6', x: 1340, y: 400, titleUrl: 'https://i.imgur.com/Hu82gDg.png', musicUrl: 'dQw4w9WgXcQ', popupImageUrl: 'https://i.imgur.com/Hu82gDg.png' },
    { id: 'song7', x: 1100, y: 1300, titleUrl: 'https://i.imgur.com/jRmUZq1.png', musicUrl: 'dQw4w9WgXcQ', popupImageUrl: 'https://i.imgur.com/jRmUZq1.png' },
    { id: 'song8', x: 1150, y: 600, titleUrl: 'https://i.imgur.com/EzEtIUh.png', musicUrl: 'dQw4w9WgXcQ', popupImageUrl: 'https://i.imgur.com/EzEtIUh.png' },
    { id: 'song9', x: 1000, y: 1500, titleUrl: 'https://i.imgur.com/R8kJ9GF.png', musicUrl: 'dQw4w9WgXcQ', popupImageUrl: 'https://i.imgur.com/R8kJ9GF.png' },
    { id: 'song10', x: 750, y: 600, titleUrl: 'https://i.imgur.com/XB8QeJg.png', musicUrl: 'dQw4w9WgXcQ', popupImageUrl: 'https://i.imgur.com/XB8QeJg.png' },
];

let hideTimeout;
let ytPlayer = null;
let currentSongId = null;

document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport');
    const mapContainer = document.getElementById('map-container');
    const titleContainer = document.getElementById('title-container');
    const musicPopup = document.getElementById('music-popup');
    const popupImage = document.getElementById('popup-image');
    const videoPlayerDiv = document.getElementById('video-player');

    musicData.forEach(data => {
        const img = document.createElement('img');
        if (data.titleUrl) {
            img.src = data.titleUrl;
            img.className = 'music-title';
            img.id = data.id;
            img.style.left = `${data.x}px`;
            img.style.top = `${data.y}px`;
            titleContainer.appendChild(img);
        }
    });
    
    const closePopup = () => {
        musicPopup.classList.add('hidden');
        videoPlayerDiv.innerHTML = '';
        popupImage.style.display = 'block';
        if (ytPlayer) {
            ytPlayer.destroy();
            ytPlayer = null;
        }
        currentSongId = null;
    };

    titleContainer.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (target.classList.contains('music-title')) {
            if (currentSongId && currentSongId !== target.id) {
                closePopup();
            }
            clearTimeout(hideTimeout);
            const songData = musicData.find(song => song.id === target.id);
            if (songData) {
                popupImage.src = songData.popupImageUrl;
                currentSongId = target.id;
                musicPopup.classList.remove('hidden');
            }
        }
    });

    titleContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('music-title')) {
            e.preventDefault();
            clearTimeout(hideTimeout);
            const songData = musicData.find(song => song.id === e.target.id);
            if (ytPlayer || !songData) {
                return;
            }
            popupImage.style.display = 'none';
            ytPlayer = new YT.Player(videoPlayerDiv, {
                height: '180',
                width: '320',
                videoId: songData.musicUrl,
                playerVars: { 'autoplay': 1, 'controls': 1, 'mute': 0, 'rel': 0, 'playsinline': 1 },
                events: { 'onReady': (event) => { event.target.playVideo(); } }
            });
        }
    });

    titleContainer.addEventListener('mouseout', (e) => { if (e.target.classList.contains('music-title')) { hideTimeout = setTimeout(closePopup, 250); } });
    musicPopup.addEventListener('mouseover', () => { clearTimeout(hideTimeout); });
    musicPopup.addEventListener('mouseout', () => { hideTimeout = setTimeout(closePopup, 250); });

    const mouseX = document.getElementById('mouse-tracker-x');
    const mouseY = document.getElementById('mouse-tracker-y');
    const mouseBox = document.getElementById('mouse-tracker-box');
    document.addEventListener('mousemove', (e) => { mouseX.style.top = `${e.clientY}px`; mouseY.style.left = `${e.clientX}px`; mouseBox.style.left = `${e.clientX}px`; mouseBox.style.top = `${e.clientY}px`; if (!musicPopup.classList.contains('hidden')) { let t = e.clientX, o = e.clientY; const n = musicPopup.offsetWidth, a = musicPopup.offsetHeight; let l = t + 15, s = o + 15; t + 15 + n > viewport.offsetWidth && (l = t - 15 - n), o + 15 + a > viewport.offsetHeight && (s = o - 15 - a), musicPopup.style.left = `${l}px`, musicPopup.style.top = `${s}px` } });
    const rulerX = document.getElementById('ruler-x');
    const rulerY = document.getElementById('ruler-y');
    let translateX = 0, translateY = 0, zoomLevel = 1;
    let isDragging = false;
    let startPointerX, startPointerY, startTranslateX, startTranslateY;
    const initialTranslateX = (viewport.offsetWidth - mapContainer.offsetWidth) / 2;
    const initialTranslateY = (viewport.offsetHeight - mapContainer.offsetHeight) / 2;
    translateX = initialTranslateX;
    translateY = initialTranslateY;
    const minZoom = 0.6, maxZoom = 4, zoomStep = 0.07;
    function updateTransform() { mapContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`; generateRulers(); }
    function generateRulers() { rulerX.innerHTML='';rulerY.innerHTML='';const t=viewport.offsetWidth,e=viewport.offsetHeight;let o=100*zoomLevel,n=20*zoomLevel;o<50&&(o=50),o>200&&(o=200);const a=-translateX/zoomLevel,l=a+t/zoomLevel;let s=Math.floor(a/o)*o;s<a&&(s+=o);for(let i=s;i<=l+o;i+=o){const c=(i*zoomLevel)+translateX;if(c>=0&&c<t){const d=document.createElement("div");d.className="ruler-line-x major",d.style.left=`${c}px`,rulerX.appendChild(d);const r=document.createElement("div");r.className="ruler-number-x",r.style.left=`${c}px`,r.textContent=Math.round(i),rulerX.appendChild(r);for(let p=1;p<o/n;p++){const m=i+p*n,u=(m*zoomLevel)+translateX;if(u>=0&&u<t){const g=document.createElement("div");g.className="ruler-line-x minor",g.style.left=`${u}px`,rulerX.appendChild(g)}}}}const H=-translateY/zoomLevel,v=H+e/zoomLevel;let h=Math.floor(H/o)*o;h<H&&(h+=o);for(let f=h;f<=v+o;f+=o){const y=(f*zoomLevel)+translateY;if(y>=0&&y<e){const b=document.createElement("div");b.className="ruler-line-y major",b.style.top=`${y}px`,rulerY.appendChild(b);const E=document.createElement("div");E.className="ruler-number-y",E.style.top=`${y}px`,E.textContent=Math.round(f),rulerY.appendChild(E);for(let k=1;k<o/n;k++){const L=f+k*n,x=(L*zoomLevel)+translateY;if(x>=0&&x<e){const w=document.createElement("div");w.className="ruler-line-y minor",w.style.top=`${x}px`,rulerY.appendChild(w)}}}}}
    viewport.addEventListener('wheel', (e) => { e.preventDefault();const t=zoomLevel,o=Math.sign(e.deltaY);o<0?zoomLevel<maxZoom&&(zoomLevel=Math.min(maxZoom,zoomLevel+zoomStep)):zoomLevel>minZoom&&(zoomLevel=Math.max(minZoom,zoomLevel-zoomStep));const n=mapContainer.getBoundingClientRect(),a=e.clientX-n.left,l=e.clientY-n.top;translateX-=(a/t)*(zoomLevel-t),translateY-=(l/t)*(zoomLevel-t),updateTransform(); });
    document.addEventListener('mousedown', (e) => { if(e.target.classList.contains('music-title')||e.target.closest('#music-popup'))return;if(e.target.closest('#map-container')){isDragging=!0,startPointerX=e.clientX,startPointerY=e.clientY,startTranslateX=translateX,startTranslateY=translateY,viewport.style.cursor='grabbing'} });
    document.addEventListener('mousemove', (e) => { if(!isDragging)return;const t=e.clientX-startPointerX,o=e.clientY-startPointerY;translateX=startTranslateX+t,translateY=startTranslateY+o,updateTransform() });
    document.addEventListener('mouseup', () => { isDragging=!1,viewport.style.cursor='grab' });
    updateTransform();
    viewport.style.cursor = 'grab';
});