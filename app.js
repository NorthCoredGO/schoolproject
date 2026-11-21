'use strict';

const houses = [
  {name:'Дом Бурлова',address:'Октябрьская, 11',description:'Купеческий особняк конца XIX века. Сейчас здесь расположен Дом вологодского масла.',coords:[59.2185649,39.8802391],source:'https://turvologda.ru/museums-and-display-facilities/44/6666/'},
  {name:'Дом Засецких',address:'Ленинградская, 12',description:'Один из старейших сохранившихся деревянных особняков Вологды.',coords:[59.2239481,39.8763789],source:'https://turvologda.ru/museums-and-display-facilities/44/5881/'},
  {name:'Дом Извощикова',address:'Чернышевского, 55',description:'Образец деревянного модерна 1915 года. Дом восстановили в 2019 году.',coords:[59.2312679,39.8979125],source:'https://turvologda.ru/museums-and-display-facilities/44/5838/'},
  {name:'Дом Левина — Ватагина',address:'Советский проспект, 18',description:'Особняк первой половины XIX века. Купец Ватагин сдавал его врачу Левину.',coords:[59.2170936,39.8948020],source:'https://turvologda.ru/museums-and-display-facilities/44/7562/'},
  {name:'Флигель дома Дружинина',address:'Мальцева, 18',description:'Флигель усадьбы статского советника Николая Дружинина, построенный в конце 1850-х годов.',coords:[59.2207285,39.8785540],source:'https://turvologda.ru/museums-and-display-facilities/44/7470/'},
  {name:'Дом купца Попова',address:'Маяковского, 4',description:'Дом купца Евгения Попова перенесли на эту улицу в 1973 году.',coords:[59.2269105,39.8743892],source:'https://turvologda.ru/museums-and-display-facilities/44/7469/'},
  {name:'Дом Воробьёва',address:'Засодимского, 14',description:'Особняк 1910 года с резным декором, напоминающим вологодское кружево.',coords:[59.2251082,39.8740498],source:'https://turvologda.ru/museums-and-display-facilities/44/7142/'},
  {name:'Дом Бутыриной',address:'Благовещенская, 22',description:'Деревянный жилой особняк 1902 года с угловым балконом и резными деталями.',coords:[59.2206201,39.8823932],source:'https://turvologda.ru/museums-and-display-facilities/44/7141/'},
  {name:'Дом Наумова',address:'Благовещенская, 20',description:'Дом 1912 года. После реставрации здесь открылся Центр ремёсел.',coords:[59.2205500,39.8827418],source:'https://turvologda.ru/museums-and-display-facilities/44/6710/'},
  {name:'Дом Караулова',address:'Маяковского, 9',description:'Дом рубежа XIX–XX веков перенесли в Верхний посад в 1970-х годах.',coords:[59.2262377,39.8754825],source:'https://turvologda.ru/museums-and-display-facilities/44/6691/'},
  {name:'Дом Алаева',address:'Проспект Победы, 32',description:'Доходный дом 1912 года, который сохранил жилую функцию.',coords:[59.2244761,39.8736250],source:'https://turvologda.ru/museums-and-display-facilities/44/6681/'},
  {name:'Дом Немирова',address:'Чернышевского, 56',description:'Особняк 1840-х годов. Позднее в нём работало ремесленное училище.',coords:[59.2307128,39.8983048],source:'https://turvologda.ru/museums-and-display-facilities/44/6654/'},
  {name:'Дом Черноглазова',address:'Чернышевского, 17',description:'Особняк конца XIX — начала XX века с историческими интерьерами.',coords:[59.2267975,39.8935875],source:'https://turvologda.ru/museums-and-display-facilities/44/6637/'},
  {name:'Дом Соковикова',address:'Советский проспект, 20',description:'В этом деревянном доме снимал квартиру поэт Константин Батюшков.',coords:[59.2169435,39.8950093],source:'https://turvologda.ru/museums-and-display-facilities/44/74/'},
  {name:'Дом купца Самарина',address:'Советский проспект, 16А',description:'Комплекс из трёх деревянных построек купца Самарина. Теперь здесь работает музей.',coords:[59.2169445,39.8940997],source:'https://turvologda.ru/museums-and-display-facilities/44/64/'},
  {name:'Дом актёра (дом Орлова)',address:'Ленинградская, 4',description:'Деревянный особняк, в котором работает Дом актёра и Союз театральных деятелей.',coords:[59.2250531,39.8772314],source:'https://www.cultinfo.ru/organization/vologda-branch-of-the-union-of-theatrical-figures-of-russia.php?clear_cache=Y'}
];

const center = [59.2235,39.8855];
const cityZoom = 13;
const list = document.getElementById('house-list');
const count = document.getElementById('house-count');
const mapMessage = document.getElementById('map-message');
const openMapLink = document.getElementById('open-map');
const dialog = document.getElementById('house-dialog');
const panorama = document.getElementById('panorama');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const buttons = [];
const rows = [];
const favoriteButtons = [];
const markers = [];
const search = document.getElementById('house-search');
const streetFilter = document.getElementById('street-filter');
const emptyState = document.getElementById('empty-state');
const mapCount = document.getElementById('map-count');
const allTab = document.getElementById('filter-all');
const favoritesTab = document.getElementById('filter-favorites');
const dialogFavorite = document.getElementById('dialog-favorite');
let favorites = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('vologda-favorites') || '[]');
  if (Array.isArray(saved)) favorites = new Set(saved.filter(index => Number.isInteger(index) && index >= 0 && index < houses.length));
} catch {}
let favoritesOnly = false;
let currentHouse = -1;
let map = null;
let openTimer = null;

count.textContent = String(houses.length);
const streets = [...new Set(houses.map(house => house.address.split(',')[0].trim()))].sort((a,b) => a.localeCompare(b,'ru'));
document.getElementById('street-count').textContent = String(streets.length);
streets.forEach(street => {
  const option = document.createElement('option');
  option.value = street;
  option.textContent = street;
  streetFilter.appendChild(option);
});

function applyFilters() {
  if (openTimer !== null) window.clearTimeout(openTimer);
  openTimer = null;
  if (map) map.stop();
  setSelected(-1);
  const query = search.value.trim().toLocaleLowerCase('ru');
  const street = streetFilter.value;
  let visibleCount = 0;
  houses.forEach((house,index) => {
    const visible = (!query || `${house.name} ${house.address} ${house.description}`.toLocaleLowerCase('ru').includes(query)) && (!street || house.address.split(',')[0].trim() === street) && (!favoritesOnly || favorites.has(index));
    rows[index].hidden = !visible;
    if (visible) visibleCount++;
    if (map && markers[index]) {
      if (visible && !map.hasLayer(markers[index])) markers[index].addTo(map);
      if (!visible && map.hasLayer(markers[index])) map.removeLayer(markers[index]);
    }
  });
  count.textContent = String(visibleCount);
  const word = visibleCount % 10 === 1 && visibleCount % 100 !== 11 ? 'дом' : visibleCount % 10 >= 2 && visibleCount % 10 <= 4 && (visibleCount % 100 < 12 || visibleCount % 100 > 14) ? 'дома' : 'домов';
  mapCount.textContent = `${visibleCount} ${word} на карте`;
  emptyState.textContent = favoritesOnly && favorites.size === 0 ? 'Здесь пока пусто. Нажмите ♡ рядом с домом, чтобы сохранить его.' : 'Ничего не найдено. Измените запрос или фильтры.';
  emptyState.hidden = visibleCount !== 0;
  list.classList.toggle('is-empty',visibleCount === 0);
}

function updateFavorites() {
  document.getElementById('favorite-count').textContent = String(favorites.size);
  favoriteButtons.forEach((button,index) => {
    const saved = favorites.has(index);
    button.textContent = saved ? '♥' : '♡';
    button.setAttribute('aria-pressed',String(saved));
    button.setAttribute('aria-label',`${saved ? 'Убрать из избранного' : 'Добавить в избранное'}: ${houses[index].name}`);
  });
  if (currentHouse >= 0) {
    const saved = favorites.has(currentHouse);
    dialogFavorite.textContent = saved ? '♥ В избранном' : '♡ Сохранить в избранное';
    dialogFavorite.setAttribute('aria-pressed',String(saved));
  }
}

function toggleFavorite(index) {
  if (favorites.has(index)) favorites.delete(index); else favorites.add(index);
  try { localStorage.setItem('vologda-favorites',JSON.stringify([...favorites])); } catch {}
  updateFavorites();
  if (favoritesOnly) applyFilters();
}

function setFavoriteView(value) {
  favoritesOnly = value;
  allTab.classList.toggle('active',!value);
  favoritesTab.classList.toggle('active',value);
  allTab.setAttribute('aria-pressed',String(!value));
  favoritesTab.setAttribute('aria-pressed',String(value));
  applyFilters();
}

function setSelected(index) {
  buttons.forEach((button,i) => { button.classList.toggle('active',i === index); button.setAttribute('aria-pressed',String(i === index)); });
  markers.forEach((marker,i) => marker?.getElement()?.querySelector('.map-pin')?.classList.toggle('selected',i === index));
}

function updateMapLink() {
  if (!map) return;
  const point = map.getCenter();
  openMapLink.href = `https://www.openstreetmap.org/#map=${Math.round(map.getZoom())}/${point.lat.toFixed(6)}/${point.lng.toFixed(6)}`;
}

function openDetails(index) {
  openTimer = null;
  const house = houses[index];
  currentHouse = index;
  updateFavorites();
  document.getElementById('dialog-title').textContent = house.name;
  document.getElementById('dialog-address').textContent = house.address;
  document.getElementById('dialog-description').textContent = house.description;
  document.getElementById('source-link').href = house.source;
  const point = `${house.coords[1]},${house.coords[0]}`;
  document.getElementById('panorama-link').href = `https://yandex.ru/maps/21/vologda/?l=stv%2Csta&ll=${encodeURIComponent(point)}&z=17`;
  panorama.src = `panorama.html?lon=${encodeURIComponent(house.coords[1])}&lat=${encodeURIComponent(house.coords[0])}`;
  if (!dialog.open) dialog.showModal();
}

function selectHouse(index) {
  const zoomDurationMs = 900;
  if (openTimer !== null) window.clearTimeout(openTimer);
  setSelected(index);
  const house = houses[index];
  if (map) {
    map.stop();
    if (reduceMotion) map.setView(house.coords,17);
    else map.flyTo(house.coords,17,{duration:zoomDurationMs / 1000});
    updateMapLink();
  }
  if (!map || reduceMotion) openDetails(index);
  else openTimer = window.setTimeout(() => { openTimer = null; openDetails(index); },zoomDurationMs);
}

houses.forEach((house,index) => {
  const row = document.createElement('div');
  row.className = 'house-row';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'house-button';
  button.setAttribute('aria-label',`Дом ${index+1}: ${house.name}, ${house.address}. Открыть описание и панораму`);
  button.innerHTML = `<span class="number"><span class="house-digit">${index+1}</span></span><span class="house-copy"><span class="house-name"></span><span class="house-address"></span></span><span class="house-arrow" aria-hidden="true">↗</span>`;
  button.querySelector('.house-name').textContent = house.name;
  button.querySelector('.house-address').textContent = house.address;
  button.addEventListener('click',() => selectHouse(index));
  const favorite = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'favorite-button';
  favorite.addEventListener('click',() => toggleFavorite(index));
  row.append(button,favorite);
  list.appendChild(row);
  rows.push(row);
  buttons.push(button);
  favoriteButtons.push(favorite);
});
updateFavorites();

search.addEventListener('input',applyFilters);
streetFilter.addEventListener('change',applyFilters);
allTab.addEventListener('click',() => setFavoriteView(false));
favoritesTab.addEventListener('click',() => setFavoriteView(true));
dialogFavorite.addEventListener('click',() => { if (currentHouse >= 0) toggleFavorite(currentHouse); });
document.addEventListener('keydown',event => {
  if (document.body.classList.contains('locked')) return;
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !dialog.open) {
    event.preventDefault();
    setSidebarOpen(true);
    search.focus();
  }
});

try {
  if (!window.L) throw new Error('Leaflet не загрузился');
  map = L.map('map',{zoomControl:false,minZoom:cityZoom}).setView(center,cityZoom);
  L.control.zoom({position:'topleft'}).addTo(map);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
  }).addTo(map);
  let failedTiles = 0;
  tiles.on('tileerror',() => { if (++failedTiles >= 3) mapMessage.hidden = false; });
  tiles.on('tileload',() => { failedTiles = 0; mapMessage.hidden = true; });
  map.on('moveend zoomend',updateMapLink);
  houses.forEach((house,index) => {
    const icon = L.divIcon({className:'house-icon',html:`<span class="map-pin"><span class="house-digit">${index+1}</span></span>`,iconSize:[34,34],iconAnchor:[17,17]});
    const marker = L.marker(house.coords,{icon,alt:`${house.name} — ${house.address}`,riseOnHover:true}).addTo(map);
    const labelMarker = () => marker.getElement().setAttribute('aria-label',`${house.name} — ${house.address}`);
    labelMarker();
    marker.on('add',labelMarker);
    const preview = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = house.name;
    const address = document.createElement('span');
    address.textContent = house.address;
    preview.append(name,address);
    marker.bindTooltip(preview,{direction:'top',offset:[0,-19],className:'house-preview'});
    marker.on('click',() => selectHouse(index));
    markers[index] = marker;
  });
  window.addEventListener('resize',() => map.invalidateSize());
} catch (error) {
  console.error('Карта недоступна:',error);
  mapMessage.hidden = false;
  map = null;
}

document.getElementById('show-all').addEventListener('click',() => {
  if (openTimer !== null) window.clearTimeout(openTimer);
  openTimer = null;
  if (dialog.open) dialog.close();
  setSelected(-1);
  search.value = '';
  streetFilter.value = '';
  setFavoriteView(false);
  if (map) {
    map.stop();
    if (reduceMotion) map.setView(center,cityZoom);
    else map.flyTo(center,cityZoom,{duration:1.1});
  }
});

document.getElementById('dialog-close').addEventListener('click',() => dialog.close());
dialog.addEventListener('close',() => {
  panorama.removeAttribute('src');
  currentHouse = -1;
  setSelected(-1);
});

const sidebar = document.getElementById('sidebar');
const detailsToggle = document.getElementById('details-toggle');
const sidebarClose = document.getElementById('sidebar-close');
function setSidebarOpen(open) {
  sidebar.classList.toggle('is-open',open);
  sidebar.toggleAttribute('inert',!open);
  sidebar.setAttribute('aria-hidden',String(!open));
  detailsToggle.setAttribute('aria-expanded',String(open));
  if (open) sidebarClose.focus();
  else if (sidebar.contains(document.activeElement)) detailsToggle.focus();
}
detailsToggle.addEventListener('click',() => setSidebarOpen(true));
sidebarClose.addEventListener('click',() => setSidebarOpen(false));

const loginForm = document.getElementById('login-form');
const loginName = document.getElementById('login-name');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const sessionKey = 'vologda-demo-login';

async function setGuideVisible(visible, animate = false) {
  const screen = loginForm.closest('.login-screen');
  const fade = animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && screen.animate;
  try {
    if (fade) {
      document.body.classList.add('switching-screen');
      document.body.inert = true;
    }
    if (visible) {
      document.body.classList.remove('locked');
      map?.invalidateSize();
    }
    if (fade) {
      await screen.animate([{opacity:1},{opacity:0}], {
        duration:600, easing:'ease-in-out', direction:visible ? 'normal' : 'reverse'
      }).finished;
    }
  } finally {
    document.body.classList.toggle('locked',!visible);
    document.body.classList.remove('switching-screen');
    document.body.inert = false;
    (visible ? detailsToggle : loginName).focus();
  }
}

try {
  if (sessionStorage.getItem(sessionKey) === 'admin') setGuideVisible(true);
} catch {}

loginForm.addEventListener('submit',event => {
  event.preventDefault();
  if (loginName.value !== 'admin' || passwordInput.value !== '12345') {
    loginError.textContent = 'Неверный логин или пароль.';
    passwordInput.focus();
    passwordInput.select();
    return;
  }
  try { sessionStorage.setItem(sessionKey,'admin'); } catch {}
  loginError.textContent = '';
  setGuideVisible(true,true).then(() => loginForm.reset());
});
loginForm.addEventListener('input',() => { loginError.textContent = ''; });
document.getElementById('logout').addEventListener('click',() => {
  try { sessionStorage.removeItem(sessionKey); } catch {}
  if (openTimer !== null) window.clearTimeout(openTimer);
  setSidebarOpen(false);
  setGuideVisible(false,true);
});
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open') && !dialog.open) setSidebarOpen(false);
});

