(() => {
  'use strict';

  const login = document.querySelector('#login');
  const cabinet = document.querySelector('#cabinet');
  const bookings = document.querySelector('#bookings');
  const newCount = document.querySelector('#new-count');
  const feedback = document.querySelector('#feedback');
  const refresh = document.querySelector('#refresh');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const config = window.KSAutoConfig;
  const pageSize = 30;
  const refreshInterval = 15000;
  let loading = false;
  let updating = false;
  let lastRows = '';
  let hasNext = false;
  let accessToken = '';
  let page = 0;

  function showLogin() {
    accessToken = '';
    page = 0;
    loading = updating = hasNext = false;
    lastRows = '';
    newCount.textContent = '';
    bookings.replaceChildren();
    cabinet.hidden = true;
    login.hidden = false;
  }

  async function request(path, options = {}) {
    const session = accessToken;
    const response = await fetch(config.url.replace(/\/$/, '') + path, {
      signal: AbortSignal.timeout(12000),
      ...options,
      headers: {
        apikey: config.publishableKey,
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
        ...options.headers,
      },
    });
    if (response.status === 401 && session && session === accessToken) {
      showLogin();
      feedback.textContent = 'Вход истёк. Войдите снова.';
      throw new Error(feedback.textContent);
    }
    if (!response.ok) throw new Error('Сервис вернул ошибку.');
    if (options.method === 'HEAD') return response.headers;
    return response.status === 204 ? null : response.json();
  }

  function renderBooking(row) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const detail = document.createElement('p');
    const update = document.createElement('button');
    title.textContent = row.customer_name + ' · ' + row.customer_phone;
    detail.textContent = row.requested_service + ' · ' +
      row.requested_date.split('-').reverse().join('.') + ' ' +
      row.requested_time.slice(0, 5) + ' · ' +
      (row.status === 'new' ? 'Новая' : 'Обработана');
    update.textContent = row.status === 'new' ? 'Отметить обработанной' : 'Вернуть в новые';
    update.addEventListener('click', async () => {
      if (loading || updating || !accessToken) return;
      const session = accessToken;
      updating = true;
      update.disabled = true;
      try {
        const changed = await request('/rest/v1/bookings?id=eq.' + row.id, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ status: row.status === 'new' ? 'processed' : 'new' }),
        });
        if (session !== accessToken) return;
        if (changed.length !== 1) throw new Error('Статус не изменился.');
        await loadBookings(page);
      } catch {
        if (session === accessToken) feedback.textContent = 'Не удалось изменить статус.';
      } finally {
        if (session === accessToken) updating = false;
        update.disabled = false;
      }
    });
    const copy = document.createElement('button');
    copy.textContent = 'Скопировать заявку';
    copy.addEventListener('click', async () => {
      const session = accessToken;
      try {
        await navigator.clipboard.writeText(title.textContent + '\n' + detail.textContent);
        if (session === accessToken) feedback.textContent = 'Заявка скопирована.';
      } catch {
        if (session === accessToken) feedback.textContent = 'Не удалось скопировать заявку.';
      }
    });
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(update, copy);
    item.append(title, detail, actions);
    return item;
  }

  async function loadBookings(targetPage, automatic = false) {
    if (!accessToken || loading || (automatic && updating)) return;
    loading = true;
    const session = accessToken;
    if (!automatic) refresh.disabled = previous.disabled = next.disabled = true;
    try {
      const fields = 'id,customer_name,customer_phone,requested_service,requested_date,requested_time,status';
      const [rows, count] = await Promise.allSettled([
        request('/rest/v1/bookings?select=' + fields +
          '&order=created_at.desc,id.desc&limit=' + (pageSize + 1) + '&offset=' + targetPage * pageSize),
        request('/rest/v1/bookings?select=id&status=eq.new&limit=1', {
          method: 'HEAD',
          headers: { Prefer: 'count=exact' },
        }),
      ]);
      if (session !== accessToken) return;
      const total = count.status === 'fulfilled'
        ? count.value.get('content-range')?.split('/').pop()
        : null;
      const countText = total && /^\d+$/.test(total) ? 'Новых заявок: ' + total : 'Счётчик недоступен';
      if (newCount.textContent !== countText) newCount.textContent = countText;
      if (rows.status === 'rejected') throw rows.reason;
      const visibleRows = rows.value.slice(0, pageSize);
      const snapshot = JSON.stringify(visibleRows);
      page = targetPage;
      hasNext = rows.value.length > pageSize;
      if (snapshot !== lastRows) {
        bookings.replaceChildren(...visibleRows.map(renderBooking));
        lastRows = snapshot;
      }
      if (!automatic || !visibleRows.length || feedback.textContent === 'Заявок пока нет.' ||
          feedback.textContent.startsWith('Не удалось загрузить заявки')) {
        feedback.textContent = visibleRows.length ? '' : 'Заявок пока нет.';
      }
    } catch {
      if (session === accessToken) feedback.textContent = 'Не удалось загрузить заявки. Попробуйте обновить.';
    } finally {
      if (session === accessToken) {
        loading = false;
        refresh.disabled = false;
        previous.disabled = page === 0;
        next.disabled = !hasNext;
      }
    }
  }

  login.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = login.querySelector('button');
    const fields = new FormData(login);
    button.disabled = true;
    feedback.textContent = '';
    try {
      const session = await request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email: fields.get('email'), password: fields.get('password') }),
      });
      accessToken = session.access_token;
      const allowed = await request('/rest/v1/rpc/is_booking_owner', { method: 'POST', body: '{}' });
      if (!allowed) {
        showLogin();
        feedback.textContent = 'У этой учётной записи нет доступа к заявкам.';
        return;
      }
      login.hidden = true;
      cabinet.hidden = false;
      await loadBookings(0);
    } catch {
      showLogin();
      feedback.textContent = 'Не удалось войти. Проверьте почту и пароль.';
    } finally {
      login.elements.password.value = '';
      button.disabled = false;
    }
  });

  function refreshVisibleCabinet() {
    if (!document.hidden && !cabinet.hidden) {
      loadBookings(page, true);
    }
  }

  window.setInterval(refreshVisibleCabinet, refreshInterval);
  document.addEventListener('visibilitychange', refreshVisibleCabinet);
  window.addEventListener('online', refreshVisibleCabinet);

  refresh.addEventListener('click', () => { if (!updating) loadBookings(page); });
  previous.addEventListener('click', () => { if (!updating) loadBookings(page - 1); });
  next.addEventListener('click', () => { if (!updating) loadBookings(page + 1); });
  document.querySelector('#logout').addEventListener('click', () => {
    request('/auth/v1/logout', { method: 'POST' }).catch(() => {});
    showLogin();
    feedback.textContent = '';
  });

  if (!config?.url || !config.publishableKey) {
    login.querySelector('button').disabled = true;
    feedback.textContent = 'Кабинет появится после подключения базы.';
  }
})();
