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
  console.log('closeModal called');
  document.getElementById('overlay').style.display = 'none';
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
  closeModal();
  alert('Сканер QR пока не реализован.');
}

function addByID() {
  console.log('addByID called');
  console.log('overlay display =', document.getElementById('overlay').style.display);


  document.getElementById('addModal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  const idModal = document.getElementById('idInputModal');
  idModal.style.display = 'block';

  const input = document.getElementById('serviceIdInput');
  console.log('Before setup: input.disabled =', input.disabled);
  input.removeAttribute('disabled'); // <-- это важно
  input.value = '';        // очистить поле
  input.disabled = false;  // включить, если было отключено
  input.focus();           // поставить фокус
  console.log('After setup: input.disabled =', input.disabled);
}


async function submitId() {
  console.log('submitId called');
  const idInput = document.getElementById('serviceIdInput');
  const id = idInput.value.trim();

  console.log('Initial: input.disabled =', idInput.disabled);

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

    console.log('Response received:', result);

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
      console.log('Error case: input.disabled =', idInput.disabled);
    }
  } catch (error) {
    console.error('Ошибка при добавлении места:', error);
    closeModal();
    console.error('Ошибка при добавлении места:', error);
    alert('Произошла ошибка');
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
