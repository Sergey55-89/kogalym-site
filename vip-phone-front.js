/* VIP + PHONE FRONT PATCH / FINAL SAFE */
(function(){
  'use strict';

  const STORAGE_KEYS = ['ads','announcements','kogalym_ads','site_ads'];

  const ready = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  function readArray(key){
    try{
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data : [];
    }catch(e){
      return [];
    }
  }

  function getAds(){
    let best = [];
    STORAGE_KEYS.forEach((key) => {
      const arr = readArray(key);
      if(arr.length > best.length) best = arr;
    });
    return best;
  }

  function norm(text){
    return String(text || '').toLowerCase().trim();
  }

  function getCardTitle(card){
    return card.querySelector('h3,.ad-title,.ann-title')?.textContent || '';
  }

  function findAdForCard(card, index, ads){
    if(!ads.length) return null;

    const byIndex = ads[index];
    const title = norm(getCardTitle(card));

    if(title){
      const byTitle = ads.find((ad) => norm(ad.title || ad.name || ad.heading).includes(title) || title.includes(norm(ad.title || ad.name || ad.heading)));
      if(byTitle) return byTitle;
    }

    return byIndex || null;
  }

  function ensureButton(card, phone){
    let phoneBtn =
      card.querySelector('.show-phone-btn') ||
      card.querySelector('.phone-btn') ||
      card.querySelector('.ad-phone-btn');

    if(!phoneBtn){
      const body =
        card.querySelector('.ad-card-content,.announcement-card-content,.ann-card-body,.ad-content') ||
        card;

      phoneBtn = document.createElement('button');
      phoneBtn.type = 'button';
      phoneBtn.className = 'show-phone-btn';
      phoneBtn.textContent = 'Показать телефон';
      body.appendChild(phoneBtn);
    }

    phoneBtn.dataset.phone = phone || '';

    if(phoneBtn.dataset.vipPhoneReady !== '1'){
      phoneBtn.dataset.vipPhoneReady = '1';
      phoneBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();

        const value = phoneBtn.dataset.phone;
        phoneBtn.textContent = value && /\d/.test(value) ? value : 'Телефон не указан';
        phoneBtn.classList.add('phone-revealed');
      });
    }
  }

  function applyVip(card){
    card.classList.add('vip');

    if(getComputedStyle(card).position === 'static'){
      card.style.position = 'relative';
    }

    if(!card.querySelector('.vip-badge')){
      const badge = document.createElement('div');
      badge.className = 'vip-badge';
      badge.textContent = 'VIP';
      card.appendChild(badge);
    }
  }

  function run(){
    const list =
      document.querySelector('#adsList') ||
      document.querySelector('.ads-list') ||
      document.querySelector('.announcements-list');

    if(!list) return;

    const cards = Array.from(list.querySelectorAll('.ad-card,.announcement-card,.ann-card'));
    const ads = getAds();

    cards.forEach((card, index) => {
      const ad = findAdForCard(card, index, ads);
      if(!ad) return;

      const isVip = Boolean(ad.vip || ad.isVip || ad.top || ad.premium);
      const phone = ad.phone || ad.tel || ad.contact || ad.contactPhone || '';

      if(isVip) applyVip(card);
      ensureButton(card, phone);
    });

    const vipCards = Array.from(list.querySelectorAll('.ad-card.vip,.announcement-card.vip,.ann-card.vip'));
    vipCards.reverse().forEach((card) => list.prepend(card));
  }

  ready(() => {
    run();

    const list =
      document.querySelector('#adsList') ||
      document.querySelector('.ads-list') ||
      document.querySelector('.announcements-list');

    if(list){
      const observer = new MutationObserver(() => window.requestAnimationFrame(run));
      observer.observe(list, { childList:true });
    }
  });
})();
