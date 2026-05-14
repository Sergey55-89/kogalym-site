/* VIP + PHONE ADMIN PATCH / FINAL SAFE */
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

  function writeArray(key, data){
    try{
      localStorage.setItem(key, JSON.stringify(data));
    }catch(e){
      console.error('VIP phone save error:', e);
    }
  }

  function findMainStorageKey(){
    let bestKey = 'ads';
    let bestLength = -1;

    STORAGE_KEYS.forEach((key) => {
      const arr = readArray(key);
      if(arr.length > bestLength){
        bestKey = key;
        bestLength = arr.length;
      }
    });

    return bestKey;
  }

  function injectFields(form){
    if(document.querySelector('#adPhone') || document.querySelector('#adVip')) return;

    const block = document.createElement('div');
    block.className = 'vip-phone-block';
    block.innerHTML = `
      <div class="vip-phone-admin-fields">
        <label class="vip-phone-label">
          Телефон для связи
          <input type="tel" id="adPhone" name="phone" placeholder="+7 (___) ___-__-__" autocomplete="tel">
        </label>

        <label class="vip-checkbox-label">
          <input type="checkbox" id="adVip" name="vip">
          Сделать объявление VIP
        </label>
      </div>
    `;

    form.appendChild(block);
  }

  function collectFormData(form){
    const phone = (document.querySelector('#adPhone')?.value || '').trim();
    const vip = Boolean(document.querySelector('#adVip')?.checked);

    return { phone, vip };
  }

  function patchLatestAd(phone, vip){
    const key = findMainStorageKey();
    const ads = readArray(key);

    if(!ads.length) return;

    const lastIndex = ads.length - 1;
    const firstIndex = 0;

    // Patch both common patterns: append-to-end and prepend-to-start.
    [lastIndex, firstIndex].forEach((idx) => {
      if(ads[idx] && typeof ads[idx] === 'object'){
        ads[idx].phone = phone;
        ads[idx].vip = vip;
        ads[idx].isVip = vip;
      }
    });

    writeArray(key, ads);

    // Mirror to ads if another key is used, so announcements page has fallback.
    if(key !== 'ads'){
      writeArray('ads', ads);
    }
  }

  ready(() => {
    const form =
      document.querySelector('#adForm') ||
      document.querySelector('form') ||
      document.querySelector('.admin-form');

    if(!form) return;

    injectFields(form);

    form.addEventListener('submit', () => {
      const { phone, vip } = collectFormData(form);
      setTimeout(() => patchLatestAd(phone, vip), 120);
      setTimeout(() => patchLatestAd(phone, vip), 450);
    }, true);

    const buttons = form.querySelectorAll('button, input[type="button"], input[type="submit"]');
    buttons.forEach((btn) => {
      if(btn.dataset.vipPhoneReady === '1') return;
      btn.dataset.vipPhoneReady = '1';

      btn.addEventListener('click', () => {
        const { phone, vip } = collectFormData(form);
        setTimeout(() => patchLatestAd(phone, vip), 120);
        setTimeout(() => patchLatestAd(phone, vip), 450);
      }, true);
    });
  });
})();
