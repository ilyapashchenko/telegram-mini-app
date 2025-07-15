document.addEventListener('DOMContentLoaded', async () => {
  window.Telegram.WebApp.expand();

  try {
    const initData = window.Telegram.WebApp.initData;

    const response = await fetch('/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    });

    const result = await response.json();

    if (result.success) {

      // походу это поиск имени и аватарки
      // document.getElementById('username').textContent = result.user.firstName;
      // document.getElementById('avatar').src = result.user.photoUrl;

      const serviceList = document.getElementById('serviceList');
      serviceList.innerHTML = '';

      if (result.places.length > 0) {
        result.places.forEach((place, index) => {
          const div = document.createElement('div');
          div.className = 'service-item';

          const title = document.createElement('div');
          title.textContent = place.place_name;

          const buttonGroup = document.createElement('div');
          buttonGroup.style.display = 'flex';
          buttonGroup.style.gap = '8px';

          // Кнопка удаления — слева
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-button';
          deleteBtn.innerHTML = '🗑️';
          deleteBtn.onclick = () => confirmDelete(place.place_id);

          // Кнопка записи — справа
          const bookBtn = document.createElement('button');
          bookBtn.textContent = 'Записаться';
          bookBtn.className = 'book-button';
          bookBtn.onclick = () => {
            openChooseMasterModal(place.place_id);
          };


          // Добавляем кнопки в нужном порядке: сначала 🗑, потом "Записаться"
          buttonGroup.appendChild(deleteBtn);
          buttonGroup.appendChild(bookBtn);

          div.appendChild(title);
          div.appendChild(buttonGroup);
          serviceList.appendChild(div);


          if (
            index < result.places.length - 1 &&
            serviceList.lastChild?.classList?.contains('service-divider') === false
          ) {
            const divider = document.createElement('div');
            divider.className = 'service-divider';
            serviceList.appendChild(divider);
          }

        });



      } else {
        serviceList.textContent = 'Сервисов пока нет';
      }

    } else {
      showNotification('Ошибка аутентификации');
    }
  } catch (error) {
    console.error('Ошибка при загрузке:', error);
  }
});

// Модалки:
function openModal() {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'block'; // включаем overlay
  document.getElementById('addModal').style.display = 'block';
}


function closeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('addModal').style.display = 'none';
  document.getElementById('idInputModal').style.display = 'none';

  const input = document.getElementById('serviceIdInput');
  if (input) {
    input.disabled = false;
    input.value = '';
  }
}

function closeAllModals() {
  document.getElementById('overlay').style.display = 'none';

  document.getElementById('addModal').style.display = 'none';
  document.getElementById('idInputModal').style.display = 'none';
  document.getElementById('confirmModal').style.display = 'none';

  // Закрытие меню
  const menu = document.getElementById('dropdownMenu');
  const button = document.getElementById('menuButton');
  menu.style.display = 'none';
  button.textContent = '☰';

  const input = document.getElementById('serviceIdInput');
  if (input) {
    input.disabled = false;
    input.value = '';
  }

  placeIdToDelete = null;
}





function addByQR() {
  showNotification('Сканер QR пока не реализован');
  return;
}

function addByID() {
  console.log('addByID called');
  document.getElementById('addModal').style.display = 'none';
  const idModal = document.getElementById('idInputModal');
  idModal.style.display = 'block';

  const input = document.getElementById('serviceIdInput');
  input.value = '';
  input.disabled = false;

  requestAnimationFrame(() => {
    input.focus();
    console.log('Focus set via requestAnimationFrame');
  });
}



async function submitId() {
  console.log('submitId called');
  const idInput = document.getElementById('serviceIdInput');
  const id = idInput.value.trim();

  console.log('Initial: input.disabled =', idInput.disabled);

  if (!id) {
    showNotification('Пожалуйста, введите ID');
    return;
  }

  if (!/^\d+$/.test(id)) {
    showNotification('ID должен содержать только цифры.');
    return;
  }

  try {
    const initData = window.Telegram.WebApp.initData;

    const response = await fetch('/addPlaceById', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, placeId: id })
    });

    const result = await response.json();

    console.log('Response received:', result);

    if (result.success) {
      closeModal();
      showNotification('Сервис успешно добавлен!');
      location.reload(); // перезагрузка страницы для обновления списка
    } else {
      showNotification('Ошибка: ' + result.error);
      idInput.value = '';
      idInput.disabled = false;
      console.log('Error case: input.disabled =', idInput.disabled);
    }
  } catch (error) {
    console.error('Ошибка при добавлении места:', error);
    showNotification('Произошла ошибка');
    idInput.value = '';
    idInput.disabled = false;
    console.log('Catch case: input.disabled =', idInput.disabled);
  }
}




// обработка работы гамбургера

function toggleMenu() {
  const menu = document.getElementById('dropdownMenu');
  const button = document.getElementById('menuButton');
  const overlay = document.getElementById('overlay');

  const isOpen = menu.style.display === 'block';

  if (isOpen) {
    menu.style.display = 'none';
    button.textContent = '☰';
    overlay.style.display = 'none';
  } else {
    menu.style.display = 'block';
    button.textContent = '×';
    overlay.style.display = 'block';
  }
}






function showSupport() {
  window.open('https://t.me/tap_tap_support', '_blank');
  toggleMenu();
}

// функция закрытия меню

function closeMenu() {
  const menu = document.getElementById('dropdownMenu');
  const button = document.getElementById('menuButton');

  menu.style.display = 'none';
  button.textContent = '☰';
}

function showNotification(message) {
  const alertBox = document.getElementById('customAlert');
  alertBox.textContent = message;
  alertBox.style.display = 'block';

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3000); // Скрыть через 3 секунды
}

let placeIdToDelete = null;

function confirmDelete(placeId) {
  placeIdToDelete = placeId;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('confirmModal').style.display = 'block';
}


function closeConfirmModal() {
  placeIdToDelete = null;
  document.getElementById('confirmModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}


async function deleteConfirmedService() {
  if (!placeIdToDelete) return;

  try {
    const initData = window.Telegram.WebApp.initData;

    const response = await fetch('/deletePlace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, placeId: placeIdToDelete })
    });

    const result = await response.json();

    closeConfirmModal();

    if (result.success) {
      showNotification('Сервис удалён');
      location.reload();
    } else {
      showNotification('Ошибка: ' + result.error);
    }
  } catch (error) {
    console.error('Ошибка при удалении сервиса:', error);
    showNotification('Произошла ошибка при удалении');
    closeConfirmModal();
  }
}

// Функция открытия модалки выбора мастера

// ПЕРЕМЕННЫЕ
let currentBookingPlaceId = null;
let selectedMaster = null;
let selectedServices = [];
let selectedDate = null;
let totalDuration = 0;
let selectedSlot = null;
let bookingDuration = 0;



// ВЫБОР МАСТЕРА
function openChooseMasterModal(placeId) {
  currentBookingPlaceId = placeId;
  fetch('/getMastersByPlace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const masterList = document.getElementById('masterList');
        masterList.innerHTML = '';

        data.masters.forEach(master => {
          const btn = document.createElement('button');
          btn.textContent = master.name;
          btn.onclick = () => {
            selectedMaster = master;
            closeChooseMasterModal();
            openChooseServiceModal(currentBookingPlaceId);
          };
          masterList.appendChild(btn);
        });

        document.getElementById('overlay').style.display = 'block';
        document.getElementById('chooseMasterModal').style.display = 'block';
      } else {
        showNotification('Ошибка при получении мастеров');
      }
    })
    .catch(err => {
      console.error('Ошибка при получении мастеров:', err);
      showNotification('Сетевая ошибка');
    });
}

function closeChooseMasterModal() {
  document.getElementById('chooseMasterModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}


















// ВЫБОР УСЛУГИ
function openChooseServiceModal(placeId) {
  fetch('/getServicesByPlace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const serviceList = document.getElementById('serviceSelectList');
        serviceList.innerHTML = '';
        selectedServices = [];

        data.services.forEach(service => {
          const label = document.createElement('label');
          label.style.display = 'block';
          label.style.marginBottom = '8px';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = service.service_id;

          // ✅ Добавляем необходимые data-атрибуты
          checkbox.dataset.name = service.name;
          checkbox.dataset.duration = service.duration_minutes;

          checkbox.onchange = () => {
            if (checkbox.checked) {
              selectedServices.push({
                id: service.service_id,
                name: service.name,
                duration: service.duration_minutes
              });
            } else {
              selectedServices = selectedServices.filter(s => s.id !== service.service_id);
            }
          };

          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(` ${service.name} (${service.duration_minutes} мин)`));
          serviceList.appendChild(label);
        });

        document.getElementById('chooseServiceModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
      } else {
        showNotification('Не удалось получить список услуг');
      }
    })
    .catch(err => {
      console.error('Ошибка при получении услуг:', err);
      showNotification('Ошибка сервера');
    });
}


// кнопка продолжить после выбора услуг
function submitSelectedServices() {
  // Собираем выбранные услуги из чекбоксов
  selectedServices = Array.from(document.querySelectorAll('#serviceSelectList input[type="checkbox"]:checked')).map(input => ({
    id: input.value,
    name: input.dataset.name,
    duration: Number(input.dataset.duration)
  }));

  if (selectedServices.length === 0) {
    showNotification('Выберите хотя бы одну услугу');
    return;
  }

  closeChooseServiceModal();

  bookingDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  console.log('Выбран мастер:', selectedMaster.name);
  console.log('Услуги:', selectedServices.map(s => s.name));
  console.log('Общая длительность:', totalDuration, 'минут');

  // дальше вызовем функцию показа календаря
  // const selectedDate = '2025-07-11'; // временная дата для теста

  // openChooseTimeModal(selectedDate, totalDuration);
  // Показываем календарь вместо слотов сразу
  openChooseDateModal();

}

function closeChooseServiceModal() {
  document.getElementById('chooseServiceModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

// подгрузка чекбоксов
function renderServices(services) {
  const serviceSelectList = document.getElementById('serviceSelectList');
  serviceSelectList.innerHTML = ''; // очищаем список перед вставкой

  services.forEach(service => {
    const label = document.createElement('label');
    label.style.display = 'block'; // чтобы каждый чекбокс был с новой строки
    label.innerHTML = `
      <input type="checkbox" 
             value="${service.service_id}" 
             data-name="${service.service_name}" 
             data-duration="${service.duration}">
      ${service.service_name} (${service.duration} мин)
    `;
    serviceSelectList.appendChild(label);
  });
}













// ВЫБОР ДАТЫ
function openChooseDateModal() {
  const dateInput = document.getElementById('bookingDatePicker');

  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;

  selectedDate = today;

  dateInput.onchange = () => {
    selectedDate = dateInput.value;
  };

  document.getElementById('chooseDateModal').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

function closeChooseDateModal() {
  document.getElementById('chooseDateModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

function submitSelectedDate() {
  if (!selectedDate) {
    showNotification('Выберите дату');
    return;
  }

  console.log('Дата выбрана:', selectedDate);

  closeChooseDateModal();

  // Переход к следующему шагу: выбор времени (свободные слоты)
  openChooseTimeModal(selectedDate, bookingDuration);
  // openChooseSlotModal(); // эту функцию сделаем дальше
}


















//ВЫБОР ВРЕМЕНИ
function openChooseTimeModal(date, totalDuration) {
  console.log('🔍 masterId:', selectedMaster?.master_id);
  console.log('📅 date:', date);
  console.log('⏱ duration:', totalDuration);
  fetch('/getFreeSlots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      masterId: selectedMaster.master_id,
      date: date,
      duration: totalDuration
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const slotList = document.getElementById('slotList');
        slotList.innerHTML = '';

        if (data.slots.length === 0) {
          showNotification('В этот день нет свободных мест. Пожалуйста, выберите другую');
          return;
        }

        
        data.slots.forEach(slot => {
          const btn = document.createElement('button');
          btn.textContent = slot;
          btn.className = 'slot-button';

          btn.onclick = () => {
            // сбрасываем выделение
            document.querySelectorAll('.slot-button').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            // запоминаем выбранный слот
            selectedSlot = slot;

            // активируем кнопку записи
            document.getElementById('confirmBookingBtn').disabled = false;
          };

          slotList.appendChild(btn);
        });

        document.getElementById('chooseTimeModal').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
      } else {
        showNotification('Ошибка при получении свободного времени');
      }
    })
    .catch(err => {
      console.error('Ошибка при получении слотов:', err);
      showNotification('Ошибка сервера');
    });
}

function closeChooseTimeModal() {
  document.getElementById('chooseTimeModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  selectedSlot = null;
  document.getElementById('confirmBookingBtn').disabled = true;
}













// ПОДТВЕРЖДЕНИЕ ЗАПИСИ
function submitBooking() {
  if (!selectedSlot || !selectedDate || !selectedMaster || selectedServices.length === 0) {
    showNotification('Пожалуйста, выберите все данные для записи');
    return;
  }

  const initData = window.Telegram.WebApp.initData;

  fetch('/createBooking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initData,
      masterId: selectedMaster.master_id,
      date: selectedDate,
      time: selectedSlot,
      services: selectedServices
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showNotification('Вы успешно записаны!');
        closeChooseTimeModal(); // закрываем модалку
      } else {
        showNotification('Ошибка при записи: ' + data.error);
      }
    })
    .catch(err => {
      console.error('Ошибка при записи:', err);
      showNotification('Ошибка сервера при записи');
    });
}










// ПЕРЕКЛЮЧАТЕЛЬ МЕЖДУ ОСНОВНЫМИ ОКНАМИ 

function switchTab(tab) {
  console.log('👉 Переключение вкладки на:', tab);

  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.style.display = 'none');

  const title = document.getElementById('mainTitle');

  if (tab === 'home') {
    console.log('➡️ Открываем главный экран');
    document.getElementById('mainScreen').style.display = 'block';
    if (title) {
      title.style.display = 'block';
      title.textContent = 'Ваши сервисы:';
    }
  } else if (tab === 'bookings') {
    console.log('➡️ Открываем экран записей');
    document.getElementById('bookingsScreen').style.display = 'block';
    loadBookings();
    if (title) {
      title.style.display = 'block';
      title.textContent = 'Ваши записи:';
    }
  } else if (tab === 'business') {
    console.log('➡️ Открываем экран Бизнес');
    document.getElementById('businessScreen').style.display = 'block';
    if (title) {
      title.style.display = 'none'; // у бизнес-экрана свой заголовок
    }
    loadBusinessContent(); // вызываем загрузку бизнес-контента
  }
}








// ФУНКЦИЯ ЗАГРУЗКИ ЗАПИСЕЙ
function loadBookings() {
  const initData = window.Telegram.WebApp.initData;

  fetch('/getUserBookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData })
  })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('bookingList');
      list.innerHTML = '';

      if (data.success && data.bookings.length > 0) {
        data.bookings.forEach(booking => {
          const formattedDate = new Date(booking.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });

          const formattedTime = booking.time.slice(0, 5); // Обрезаем до HH:MM

          const div = document.createElement('div');
          div.className = 'booking-card';
          div.innerHTML = `
            <strong>${booking.service_name}</strong><br>
            Дата: ${formattedDate}<br>
            Время: ${formattedTime}<br>
            Мастер: ${booking.master_name}<br>
            Длительность: ${booking.duration} мин
          `;
          list.appendChild(div);
        });
      } else {
        list.innerHTML = '<div>У вас пока нет записей.</div>';
      }
    })
    .catch(err => {
      console.error('Ошибка при получении записей:', err);
      showNotification('Не удалось загрузить записи');
    });
}




function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}



// ФУНКЦИЯ ОТОБРАЖЕНИЯ КОНТЕНТА ДЛЯ ЭКРАНА БИЗНЕС
// Обновлённая функция loadBusinessContent с фильтрацией по дате и отображением мастера
async function loadBusinessContent() {
  console.log('🚀 Загружаем бизнес-контент...');

  const businessContent = document.getElementById('businessContent');
  businessContent.innerHTML = 'Загрузка...';

  try {
    const initData = window.Telegram.WebApp.initData;
    console.log('📦 initData:', initData);

    const response = await fetch('/api/getUserRole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    });

    console.log('📨 Ответ от /api/getUserRole получен');
    const data = await response.json();
    console.log('📨 Распарсенный ответ:', data);

    if (!data.success) {
      console.warn('❌ Ошибка определения роли:', data.error || 'unknown');
      businessContent.innerHTML = '<p>Не удалось определить роль пользователя.</p>';
      return;
    }

    if (data.role === 'client') {
      console.log('👤 Пользователь — обычный клиент');
      businessContent.innerHTML = `
        <p>Если вы хотите подключить свой бизнес к нашему сервису, напишите нам</p>
        <button id="contactButton" class="modal-button">Связаться</button>
      `;
      document.getElementById('contactButton').onclick = () => {
        console.log('📞 Нажата кнопка "Связаться"');
        showSupport();
      };

    } else if (data.role === 'staff') {
      console.log('🧑‍💼 Пользователь — сотрудник. Загружаем записи...');

      // 👉 Добавим поле выбора даты
      const today = new Date().toISOString().split('T')[0];
      businessContent.innerHTML = `
        <label for="datePicker">Выберите дату:</label>
        <input type="date" id="datePicker" value="${today}">
        <div id="recordsTable">Загрузка записей...</div>
      `;

      const datePicker = document.getElementById('datePicker');
      const recordsTable = document.getElementById('recordsTable');

      const fetchBookings = async (selectedDate) => {
        const bookingsResponse = await fetch('/api/getStaffBookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData, selectedDate })
        });

        console.log('📨 Ответ от /api/getStaffBookings получен');
        const bookingsData = await bookingsResponse.json();
        console.log('📨 Распарсенные записи:', bookingsData);

        if (!bookingsData.success) {
          console.warn('❌ Ошибка при загрузке записей:', bookingsData.error || 'unknown');
          recordsTable.innerHTML = '<p>Ошибка при загрузке записей.</p>';
          return;
        }

        if (bookingsData.bookings.length === 0) {
          console.log('ℹ️ У сотрудника нет записей');
          recordsTable.innerHTML = '<p>У вас пока нет записей на эту дату.</p>';
          return;
        }

        console.log('✅ Показываем записи');
        let html = '<table><thead><tr><th>Время</th><th>Клиент</th><th>Услуга</th><th>Мастер</th></tr></thead><tbody>';

        bookingsData.bookings.forEach(b => {
          html += `<tr>
            <td>${b.time.slice(0, 5)}</td>
            <td>${b.client_name || 'неизвестный'}</td>
            <td>${b.services_names}</td>
            <td>${b.master_name || '—'}</td>
          </tr>`;
        });

        html += '</tbody></table>';
        recordsTable.innerHTML = html;
      };

      await fetchBookings(today);

      datePicker.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        fetchBookings(selectedDate);
      });

    } else {
      console.warn('⚠️ Неизвестная роль:', data.role);
      businessContent.innerHTML = '<p>Роль пользователя не определена.</p>';
    }

  } catch (error) {
    console.error('💥 Ошибка в loadBusinessContent:', error);
    businessContent.innerHTML = '<p>Ошибка при загрузке данных.</p>';
  }
}








// ПОКАЗЫВАТЬ ГЛАВНЫЙ ЭКРАН ПРИ ЗАПУСКЕ
document.addEventListener('DOMContentLoaded', () => {
  switchTab('home');
});



// Автоматически скрывать меню при клике вне его
document.addEventListener('click', function (event) {
  const menu = document.getElementById('dropdownMenu');
  const button = document.getElementById('menuButton');
  if (menu.style.display === 'block' &&
    !menu.contains(event.target) &&
    event.target !== button) {
    menu.style.display = 'none';
    button.textContent = '☰';
  }
});
