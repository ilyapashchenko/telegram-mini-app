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
            alert(`Вы хотите записаться в: ${place.place_name} (ID: ${place.place_id})`);
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
      alert('Ошибка аутентификации');
    }
  } catch (error) {
    console.error('Ошибка при загрузке:', error);
  }
});

// Модалки:
function openModal() {
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('addModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('addModal').style.display = 'none';
  document.getElementById('idInputModal').style.display = 'none';
}

function addByQR() {
  closeModal();
  alert('Сканер QR пока не реализован.');
}

function addByID() {
  document.getElementById('addModal').style.display = 'none';
  const idModal = document.getElementById('idInputModal');
  idModal.style.display = 'block';

  const input = document.getElementById('serviceIdInput');
  input.value = '';        // очистить поле
  input.disabled = false;  // включить, если было отключено
  input.focus();           // поставить фокус
}


async function submitId() {
  const idInput = document.getElementById('serviceIdInput');
  const id = idInput.value.trim();

  if (!id) {
    alert('Пожалуйста, введите ID');
    return;
  }

  if (!/^\d+$/.test(id)) {
    alert('ID должен содержать только цифры.');
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

    closeModal(); // закрываем сразу после получения результата

    if (result.success) {
      alert('Сервис успешно добавлен!');
      location.reload(); // перезагрузка страницы для обновления списка
    } else {
      alert('Ошибка: ' + result.error);
      // В случае ошибки поле не заблокировано, т.к. не менялось disabled
      // Можно добавить сброс значения, если нужно
      idInput.value = '';
      idInput.disabled = false;
    }
  } catch (error) {
    closeModal();
    console.error('Ошибка при добавлении места:', error);
    alert('Произошла ошибка');
    idInput.value = '';
    idInput.disabled = false;
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
