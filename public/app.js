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

          const button = document.createElement('button');
          button.textContent = 'Записаться';
          button.className = 'book-button';
          button.onclick = () => {
            showNotification(`Вы хотите записаться в: ${place.place_name} (ID: ${place.place_id})`);
          };

          div.appendChild(title);
          div.appendChild(button);
          serviceList.appendChild(div);

          // Добавляем разделитель, кроме последнего элемента
          if (index < result.places.length - 1) {
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
  overlay.style.display = 'block'; // 🟢 включаем overlay

  document.getElementById('addModal').style.display = 'block';
}


function closeModal() {
  console.log('closeModal called');
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'none'; // возвращаем нормальную логику

  document.getElementById('addModal').style.display = 'none';
  document.getElementById('idInputModal').style.display = 'none';

  const input = document.getElementById('serviceIdInput');
  if (input) {
    console.log('Before reset in closeModal: input.disabled =', input.disabled);
    input.disabled = false;
    input.value = '';
    console.log('After reset in closeModal: input.disabled =', input.disabled);
  }
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

  const isOpen = menu.style.display === 'block';

  if (isOpen) {
    menu.style.display = 'none';
    button.textContent = '☰'; // Гамбургер
  } else {
    menu.style.display = 'block';
    button.textContent = '×'; // Крестик
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
