(function(){
  'use strict';

  const categories = [
    ['all','Все'], ['medicine','Медицина'], ['education','Школы'], ['kids','Детсады'], ['shops','Магазины'], ['food','Кафе'], ['sport','Спорт'], ['gov','Госслужбы'], ['transport','Транспорт'], ['finance','Банки'], ['leisure','Отдых']
  ];

  const points = [
    {type:'gov', title:'Администрация города Когалыма', address:'Когалым, улица Дружбы Народов, 7', hours:'пн–пт, рабочее время', phone:'+7 (34667) 93-594'},
    {type:'gov', title:'МФЦ «Мои документы»', address:'Когалым, улица Мира, 15', hours:'по графику МФЦ', phone:'122 доб. 4'},
    {type:'medicine', title:'Когалымская городская больница', address:'Когалым, Молодёжная улица, 19', hours:'по графику отделений', phone:'+7 (34667) 4-30-44'},
    {type:'medicine', title:'Взрослая поликлиника', address:'Когалым, Молодёжная улица, 19', hours:'пн–пт 07:30–20:00', phone:'+7 (34667) 2-10-45'},
    {type:'education', title:'Средняя школа №8', address:'Когалым, улица Янтарная, 11', hours:'пн–пт 08:00–16:30', phone:'+7 (34667) 2-74-03'},
    {type:'kids', title:'Детский сад «Берёзка»', address:'Когалым, Ленинградская улица, 55', hours:'пн–пт 07:00–19:00', phone:'+7 (34667) 4-73-23'},
    {type:'shops', title:'ТЦ «Галактика»', address:'Когалым, торговый центр Галактика', hours:'ежедневно', phone:'актуально на карте'},
    {type:'shops', title:'Продуктовые магазины', address:'Когалым, продуктовые магазины', hours:'по графику филиалов', phone:'актуально на карте'},
    {type:'food', title:'Кафе и рестораны', address:'Когалым, кафе и рестораны', hours:'по графику заведений', phone:'актуально на карте'},
    {type:'sport', title:'Спортивные объекты', address:'Когалым, спортивные комплексы', hours:'по расписанию', phone:'актуально на карте'},
    {type:'transport', title:'АЗС', address:'Когалым, автозаправочные станции', hours:'обычно круглосуточно', phone:'не требуется'},
    {type:'finance', title:'Банки и банкоматы', address:'Когалым, банки и банкоматы', hours:'по графику отделений', phone:'актуально на карте'},
    {type:'leisure', title:'Парк Победы', address:'Когалым, Парк Победы', hours:'круглосуточно', phone:'не требуется'},
    {type:'leisure', title:'Набережная', address:'Когалым, набережная', hours:'круглосуточно', phone:'не требуется'},
    {type:'leisure', title:'СКК «Галактика»', address:'Когалым, СКК Галактика', hours:'по расписанию', phone:'актуально на карте'}
  ];

  const filterBox = document.getElementById('mapFilters');
  const list = document.getElementById('mapPointList');
  const search = document.getElementById('mapSearch');
  const count = document.getElementById('mapCount');
  const frame = document.getElementById('cityMapFrame');
  const openMap = document.getElementById('openMapLink');
  const route = document.getElementById('routeMapLink');
  const geo = document.getElementById('geoBtn');
  let currentType = 'all';
  let currentQuery = 'Когалым';

  function esc(value){return String(value || '').replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
  function norm(value){return String(value || '').toLowerCase().replace(/ё/g,'е').trim();}
  function categoryName(type){return (categories.find(c => c[0] === type) || categories[0])[1];}
  function mapUrl(query){return 'https://yandex.ru/maps/?text=' + encodeURIComponent(query || 'Когалым');}
  function routeUrl(query){return 'https://yandex.ru/maps/?rtext=~' + encodeURIComponent(query || 'Когалым') + '&rtt=auto';}
  function frameUrl(query){return 'https://yandex.ru/map-widget/v1/?text=' + encodeURIComponent(query || 'Когалым') + '&z=12';}

  function setMap(query){
    currentQuery = query || 'Когалым';
    if(frame) frame.src = frameUrl(currentQuery);
    if(openMap) openMap.href = mapUrl(currentQuery);
    if(route) route.href = routeUrl(currentQuery);
  }

  function renderFilters(){
    if(!filterBox) return;
    filterBox.innerHTML = categories.map(c => `<button type="button" class="map-filter${c[0] === currentType ? ' active' : ''}" data-map-filter="${esc(c[0])}">${esc(c[1])}</button>`).join('');
  }

  function renderList(){
    if(!list) return;
    const q = norm(search ? search.value : '');
    const filtered = points.filter(p => {
      const typeOk = currentType === 'all' || p.type === currentType;
      const text = norm([p.title,p.address,p.hours,p.phone,categoryName(p.type)].join(' '));
      return typeOk && (!q || text.includes(q));
    });
    list.innerHTML = filtered.map((p, i) => `
      <article class="map-point" data-address="${esc(p.address)}" data-title="${esc(p.title)}">
        <div><span>${esc(categoryName(p.type))}</span><h2>${esc(p.title)}</h2><p>${esc(p.address)}</p></div>
        <small>${esc(p.hours)}</small>
        <button type="button">Показать</button>
      </article>`).join('') || '<div class="map-empty">Ничего не найдено.</div>';
    if(count) count.textContent = String(filtered.length);
    if(filtered[0]) setMap(filtered[0].address || filtered[0].title);
  }

  document.addEventListener('click', event => {
    const filter = event.target.closest('[data-map-filter]');
    if(filter){
      currentType = filter.dataset.mapFilter || 'all';
      renderFilters();
      renderList();
      return;
    }
    const point = event.target.closest('.map-point');
    if(point){
      document.querySelectorAll('.map-point.active').forEach(el => el.classList.remove('active'));
      point.classList.add('active');
      setMap(point.dataset.address || point.dataset.title || 'Когалым');
    }
  });

  search?.addEventListener('input', renderList);
  geo?.addEventListener('click', () => {
    if(!navigator.geolocation){ alert('Геолокация недоступна в браузере.'); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = pos.coords.latitude + ',' + pos.coords.longitude;
      setMap(coords + ' Когалым');
    }, () => alert('Не удалось получить геолокацию.'));
  });

  renderFilters();
  renderList();
  setMap('Когалым');
})();
