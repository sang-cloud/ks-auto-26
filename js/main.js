(function () {
  'use strict';

  // ============================================================
  // НАСТРОЙКИ — заполните своими данными
  // ============================================================

  // Токен вашего Telegram-бота (получите у @BotFather)
  const TELEGRAM_BOT_TOKEN = '8677587478:AAEqxVB_yJ4q7TbkJRUbFwaSh3tNBYu9eXA';

  // ID чата, куда приходят заявки (ваш user ID или ID группы)
  // Узнать свой ID: напишите боту @userinfobot или @getmyid_bot
  const TELEGRAM_CHAT_ID = '5796762111';

  // Номер телефона автосервиса (отображается на сайте и в tel: ссылках)
  const PHONE_DISPLAY = '+7 (938) 029-40-09';
  const PHONE_TEL = '+79380294009';

  // Ссылка на отзывы на Авито
  const AVITO_REVIEWS_URL = 'https://www.avito.ru/';

  // Embed-ссылка карты (Яндекс.Карты или Google Maps iframe src)
  const MAP_EMBED_URL = 'https://yandex.ru';

  // ============================================================
  // Рабочие часы записи
  // ============================================================
  const WORK_START = 9;   // 09:00
  const WORK_END = 19;    // до 19:00 (последний слот — 18:00)
  const SLOT_INTERVAL = 60; // минут

  // ============================================================
  // Список услуг
  // ============================================================
  const SERVICES = [
    { name: 'Развал-Схождение', icon: 'align' },
    { name: 'Шиномонтаж', icon: 'tire' },
    { name: 'Ремонт ходовой части', icon: 'chassis' },
    { name: 'Замена сцепления', icon: 'clutch' },
    { name: 'Замена ГРМ', icon: 'timing' },
    { name: 'Ремонт выхлопной системы', icon: 'exhaust' },
    { name: 'Промывка радиатора отопителя', icon: 'radiator' },
    { name: 'Замена масла двигателя', icon: 'oil' },
    { name: 'Замена масла коробки', icon: 'gearbox' },
    { name: 'Замена технических жидкостей', icon: 'fluids' },
    { name: 'Компьютерная диагностика', icon: 'diagnostic' },
    { name: 'Диагностика ходовой части', icon: 'inspect' },
    { name: 'Ремонт и обслуживание тормозной системы', icon: 'brakes' },
    { name: 'Ремонт топливной системы', icon: 'fuel' },
    { name: 'Промывка форсунок', icon: 'injector' },
    { name: 'Сварочные работы', icon: 'weld' },
  ];

  const PRICE_HINTS = [
    'Узнать точную цену по телефону',
    'Узнать цену у мастера',
  ];

  // SVG icons map
  const ICONS = {
    align: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 12h16M4 6h10M4 18h10"/>',
    tire: '<circle cx="12" cy="12" r="9" stroke-width="1.5"/><circle cx="12" cy="12" r="4" stroke-width="1.5"/>',
    chassis: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>',
    clutch: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>',
    timing: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    exhaust: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>',
    radiator: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
    oil: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
    gearbox: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
    fluids: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>',
    diagnostic: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>',
    inspect: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
    brakes: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    fuel: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
    injector: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>',
    weld: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>',
  };

  // ============================================================
  // DOM refs
  // ============================================================
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const bookingForm = document.getElementById('booking-form');
  const phoneInput = document.getElementById('phone');
  const serviceSelect = document.getElementById('service');
  const calDaysEl = document.getElementById('cal-days');
  const calMonthLabel = document.getElementById('cal-month-label');
  const calPrev = document.getElementById('cal-prev');
  const calNext = document.getElementById('cal-next');
  const selectedDateInput = document.getElementById('selected-date');
  const selectedTimeInput = document.getElementById('selected-time');
  const timeSlotsEl = document.getElementById('time-slots');
  const toast = document.getElementById('toast');
  const toastInner = document.getElementById('toast-inner');
  const toastMessage = document.getElementById('toast-message');

  let calYear, calMonth;
  let selectedDate = null;
  let selectedTime = null;

  const MONTH_NAMES = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
  ];

  // ============================================================
  // Init: phones, avito, map
  // ============================================================
  function initContacts() {
    document.querySelectorAll('.hero-phone, #header-phone, .mobile-phone, .booking-phone, .contact-phone, .footer-phone').forEach(function (el) {
      el.textContent = PHONE_DISPLAY;
      if (el.tagName === 'A') el.href = 'tel:' + PHONE_TEL;
    });

    document.querySelectorAll('#avito-link, #avito-link-contacts').forEach(function (el) {
      el.href = AVITO_REVIEWS_URL;
    });

    if (MAP_EMBED_URL) {
      const iframe = document.getElementById('map-iframe');
      const placeholder = document.getElementById('map-placeholder');
      iframe.src = MAP_EMBED_URL;
      iframe.classList.remove('hidden');
      if (placeholder) placeholder.classList.add('hidden');
    }
  }

  // ============================================================
  // Render services grid
  // ============================================================
  function renderServices() {
    const grid = document.getElementById('services-grid');
    grid.innerHTML = SERVICES.map(function (s) {
      const svgPath = ICONS[s.icon] || ICONS.diagnostic;
      return (
        '<article class="service-card group p-5 rounded-2xl bg-dark-800 border border-white/5 hover:border-accent/30 transition-all hover:-translate-y-1">' +
          '<div class="service-icon w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4 transition-all">' +
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' + svgPath + '</svg>' +
          '</div>' +
          '<h3 class="text-base font-semibold text-white leading-snug">' + s.name + '</h3>' +
        '</article>'
      );
    }).join('');

    SERVICES.forEach(function (s) {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      serviceSelect.appendChild(opt);
    });
  }

  // ============================================================
  // Render price list (no ruble amounts)
  // ============================================================
  function renderPrices() {
    const grid = document.getElementById('prices-grid');
    grid.innerHTML = SERVICES.map(function (s, i) {
      const hint = PRICE_HINTS[i % PRICE_HINTS.length];
      return (
        '<div class="flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-dark-800 border border-white/5 hover:border-accent/20 transition-colors">' +
          '<span class="text-white text-sm font-medium">' + s.name + '</span>' +
          '<span class="text-accent/90 text-xs sm:text-sm whitespace-nowrap text-right">' + hint + '</span>' +
        '</div>'
      );
    }).join('');
  }

  // ============================================================
  // Header & mobile menu
  // ============================================================
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('bg-dark-950/95', 'backdrop-blur-xl', 'shadow-lg', 'border-b', 'border-white/5');
    } else {
      header.classList.remove('bg-dark-950/95', 'backdrop-blur-xl', 'shadow-lg', 'border-b', 'border-white/5');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function toggleMenu() {
    const isOpen = !mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden');
    menuIconOpen.classList.toggle('hidden');
    menuIconClose.classList.toggle('hidden');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  menuBtn.addEventListener('click', toggleMenu);
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (!mobileMenu.classList.contains('hidden')) toggleMenu();
    });
  });

  // ============================================================
  // Phone mask
  // ============================================================
  function formatPhone(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    let rest = digits.startsWith('7') ? digits.slice(1) : digits.startsWith('8') ? digits.slice(1) : digits;
    let formatted = '+7';
    if (rest.length > 0) formatted += ' (' + rest.slice(0, 3);
    if (rest.length >= 3) formatted += ') ' + rest.slice(3, 6);
    if (rest.length >= 6) formatted += '-' + rest.slice(6, 8);
    if (rest.length >= 8) formatted += '-' + rest.slice(8, 10);
    return formatted;
  }

  phoneInput.addEventListener('input', function () {
    const pos = phoneInput.selectionStart;
    const oldLen = phoneInput.value.length;
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.setSelectionRange(pos + (phoneInput.value.length - oldLen), pos + (phoneInput.value.length - oldLen));
  });

  phoneInput.addEventListener('focus', function () {
    if (!phoneInput.value) phoneInput.value = '+7';
  });

  // ============================================================
  // Calendar helpers
  // ============================================================
  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function isPastDay(date) {
    const today = startOfDay(new Date());
    return startOfDay(date) < today;
  }

  function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDateDisplay(date) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function canGoPrevMonth() {
    const today = new Date();
    return calYear > today.getFullYear() ||
      (calYear === today.getFullYear() && calMonth > today.getMonth());
  }

  // ============================================================
  // Render calendar
  // ============================================================
  function renderCalendar() {
    calMonthLabel.textContent = MONTH_NAMES[calMonth] + ' ' + calYear;
    calPrev.disabled = !canGoPrevMonth();
    calPrev.classList.toggle('opacity-30', !canGoPrevMonth());
    calPrev.classList.toggle('cursor-not-allowed', !canGoPrevMonth());

    calDaysEl.innerHTML = '';

    const firstDay = new Date(calYear, calMonth, 1);
    let startWeekday = firstDay.getDay();
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = startOfDay(new Date());

    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day cal-empty';
      calDaysEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calYear, calMonth, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = day;
      btn.className = 'cal-day w-full aspect-square flex items-center justify-center rounded-lg text-sm border border-transparent text-gray-200';

      if (isPastDay(date)) {
        btn.classList.add('cal-disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () { selectDate(date); });
      }

      if (isSameDay(date, today)) btn.classList.add('cal-today');
      if (selectedDate && isSameDay(date, selectedDate)) btn.classList.add('cal-selected');

      calDaysEl.appendChild(btn);
    }
  }

  function selectDate(date) {
    selectedDate = startOfDay(date);
    selectedDateInput.value = formatDateISO(selectedDate);
    document.getElementById('date-error').classList.add('hidden');
    selectedTime = null;
    selectedTimeInput.value = '';
    renderCalendar();
    renderTimeSlots();
  }

  calPrev.addEventListener('click', function () {
    if (!canGoPrevMonth()) return;
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  calNext.addEventListener('click', function () {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  // ============================================================
  // Time slots
  // ============================================================
  function getTimeSlots() {
    const slots = [];
    for (let h = WORK_START; h < WORK_END; h += SLOT_INTERVAL / 60) {
      slots.push(String(h).padStart(2, '0') + ':00');
    }
    return slots;
  }

  function isTimePast(timeStr, date) {
    if (!date) return false;
    const today = startOfDay(new Date());
    if (!isSameDay(date, today)) return false;
    const parts = timeStr.split(':');
    const slotDate = new Date();
    slotDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    return slotDate <= new Date();
  }

  function renderTimeSlots() {
    timeSlotsEl.innerHTML = '';
    const slots = getTimeSlots();

    slots.forEach(function (time) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = time;
      btn.className = 'time-slot px-3 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-200';

      const past = isTimePast(time, selectedDate);
      if (!selectedDate || past) {
        btn.classList.add('time-disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () { selectTime(time, btn); });
      }

      if (selectedTime === time) btn.classList.add('time-selected');
      timeSlotsEl.appendChild(btn);
    });
  }

  function selectTime(time, btn) {
    selectedTime = time;
    selectedTimeInput.value = time;
    document.getElementById('time-error').classList.add('hidden');
    timeSlotsEl.querySelectorAll('.time-slot').forEach(function (el) {
      el.classList.remove('time-selected');
    });
    btn.classList.add('time-selected');
  }

  // ============================================================
  // Validation
  // ============================================================
  function showFieldError(input, message) {
    const wrapper = input.closest('div');
    const errorEl = wrapper && wrapper.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    input.classList.add('border-red-500');
    input.classList.remove('border-white/10');
  }

  function clearFieldError(input) {
    const wrapper = input.closest('div');
    const errorEl = wrapper && wrapper.querySelector('.field-error');
    if (errorEl) errorEl.classList.add('hidden');
    input.classList.remove('border-red-500');
    input.classList.add('border-white/10');
  }

  function validatePhone(phone) {
    return phone.replace(/\D/g, '').length === 11;
  }

  // ============================================================
  // Toast
  // ============================================================
  function showToast(message, isError) {
    toastMessage.textContent = message;
    toastInner.className = 'flex items-center gap-3 px-5 py-4 rounded-xl text-white shadow-2xl toast-enter ' +
      (isError ? 'bg-red-600' : 'bg-green-600');
    toast.classList.remove('hidden');
    setTimeout(function () {
      toastInner.classList.remove('toast-enter');
      toastInner.classList.add('toast-exit');
      setTimeout(function () { toast.classList.add('hidden'); toastInner.classList.remove('toast-exit'); }, 300);
    }, 5000);
  }

  // ============================================================
  // Telegram notification
  // ============================================================
  async function sendToTelegram(data) {
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
      throw new Error('Заполните TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в js/main.js');
    }

    const text = [
      '🚗 *Новая заявка KS_Auto_26*',
      '',
      '👤 *Имя:* ' + data.name,
      '📞 *Телефон:* ' + data.phone,
      '🔧 *Услуга:* ' + data.service,
      '📅 *Дата:* ' + data.dateDisplay,
      '🕐 *Время:* ' + data.time,
    ].join('\n');

    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.description || 'Ошибка отправки в Telegram');
    }
    return result;
  }

  // ============================================================
  // Form submit
  // ============================================================
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    let isValid = true;
    const nameInput = document.getElementById('name');
    const consentInput = document.getElementById('consent');
    const consentError = document.getElementById('consent-error');
    const dateError = document.getElementById('date-error');
    const timeError = document.getElementById('time-error');

    clearFieldError(nameInput);
    clearFieldError(phoneInput);
    clearFieldError(serviceSelect);
    consentError.classList.add('hidden');
    dateError.classList.add('hidden');
    timeError.classList.add('hidden');

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Введите ваше имя');
      isValid = false;
    }

    if (!validatePhone(phoneInput.value)) {
      showFieldError(phoneInput, 'Введите корректный номер телефона');
      isValid = false;
    }

    if (!serviceSelect.value) {
      showFieldError(serviceSelect, 'Выберите услугу');
      isValid = false;
    }

    if (!selectedDate) {
      dateError.classList.remove('hidden');
      isValid = false;
    }

    if (!selectedTime) {
      timeError.classList.remove('hidden');
      isValid = false;
    }

    if (!consentInput.checked) {
      consentError.textContent = 'Необходимо согласие на обработку данных';
      consentError.classList.remove('hidden');
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const formData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value,
      service: serviceSelect.value,
      date: selectedDateInput.value,
      dateDisplay: formatDateDisplay(selectedDate),
      time: selectedTime,
    };

    try {
      await sendToTelegram(formData);
      showToast('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
      bookingForm.reset();
      selectedDate = null;
      selectedTime = null;
      selectedDateInput.value = '';
      selectedTimeInput.value = '';
      renderCalendar();
      renderTimeSlots();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Не удалось отправить заявку. Попробуйте позвонить нам.', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });

  bookingForm.querySelectorAll('input, select').forEach(function (field) {
    field.addEventListener('input', function () {
      if (field.classList.contains('border-red-500')) clearFieldError(field);
    });
  });

  // ============================================================
  // Boot
  // ============================================================
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();

  initContacts();
  renderServices();
  renderPrices();
  renderCalendar();
  renderTimeSlots();
})();
