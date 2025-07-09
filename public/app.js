document.addEventListener('DOMContentLoaded', async () => {
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

let currentBookingPlaceId = null;
let selectedMaster = null;
let selectedServices = [];


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

// Функции показа и закрытия выбора услуг
function openChooseServiceModal(placeId) {
  fetch('/getServicesByPlace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const serviceList = document.getElementById('serviceList');
        serviceList.innerHTML = '';
        selectedServices = [];

        data.services.forEach(service => {
          const label = document.createElement('label');
          label.style.display = 'block';
          label.style.marginBottom = '8px';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = service.service_id;

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

function closeChooseServiceModal() {
  document.getElementById('chooseServiceModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

// кнопка продолжить после выбора услуг
function submitSelectedServices() {
  if (selectedServices.length === 0) {
    showNotification('Выберите хотя бы одну услугу');
    return;
  }

  closeChooseServiceModal();

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  console.log('Выбран мастер:', selectedMaster.name);
  console.log('Услуги:', selectedServices.map(s => s.name));
  console.log('Общая длительность:', totalDuration, 'минут');

  // дальше вызовем функцию показа календаря
  openChooseDateModal(); // сделаем позже
}



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
