(() => {
  'use strict';

  const login = document.querySelector('#login');
  const cabinet = document.querySelector('#cabinet');
  const bookings = document.querySelector('#bookings');
  const feedback = document.querySelector('#feedback');
  const refresh = document.querySelector('#refresh');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  const config = window.KSAutoConfig;
  const pageSize = 30;
  let accessToken = '';
  let page = 0;

  function showLogin() {
    accessToken = '';
    page = 0;
    bookings.replaceChildren();
    cabinet.hidden = true;
    login.hidden = false;
  }

  async function request(path, options = {}) {
    const response = await fetch(config.url.replace(/\/$/, '') + path, {
      ...options,
      headers: {
        apikey: config.publishableKey,
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
        ...options.headers,
      },
    });
    if (response.status === 401 && accessToken) {
      showLogin();
      throw new Error('Вход истёк. Войдите снова.');
    }
    if (!response.ok) throw new Error('Сервис вернул ошибку.');
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
      const session = accessToken;
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
        update.disabled = false;
      }
    });
    item.append(title, detail, update);
    return item;
  }

  async function loadBookings(targetPage) {
    const session = accessToken;
    refresh.disabled = previous.disabled = next.disabled = true;
    let hasNext = false;
    try {
      const fields = 'id,customer_name,customer_phone,requested_service,requested_date,requested_time,status';
      const rows = await request('/rest/v1/bookings?select=' + fields +
        '&order=created_at.desc,id.desc&limit=' + (pageSize + 1) + '&offset=' + targetPage * pageSize);
      if (session !== accessToken) return;
      page = targetPage;
      hasNext = rows.length > pageSize;
      bookings.replaceChildren(...rows.slice(0, pageSize).map(renderBooking));
      feedback.textContent = rows.length ? '' : 'Заявок пока нет.';
    } catch {
      if (session === accessToken) feedback.textContent = 'Не удалось загрузить заявки. Попробуйте обновить.';
    } finally {
      if (session === accessToken) {
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

  refresh.addEventListener('click', () => loadBookings(page));
  previous.addEventListener('click', () => loadBookings(page - 1));
  next.addEventListener('click', () => loadBookings(page + 1));
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
