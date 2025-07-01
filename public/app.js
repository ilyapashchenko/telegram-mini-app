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
                result.places.forEach(place => {
                    const div = document.createElement('div');
                    div.className = 'service-item';

                    // Создание названия места
                    const title = document.createElement('div');
                    title.textContent = place.place_name;

                    // Создание кнопки "Записаться"
                    const button = document.createElement('button');
                    button.textContent = 'Записаться';
                    button.className = 'book-button';
                    button.onclick = () => {
                        alert(`Вы хотите записаться в: ${place.place_name} (ID: ${place.place_id})`);
                        // Здесь можно сделать POST-запрос на backend для записи
                    };

                    // Добавляем в div
                    div.appendChild(title);
                    div.appendChild(button);

                    // Добавляем div в список
                    serviceList.appendChild(div);
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
    document.getElementById('idInputModal').style.display = 'block';
}

function submitId() {
    const id = document.getElementById('serviceIdInput').value;
    closeModal();
    alert('Вы ввели ID: ' + id + '. Здесь будет логика добавления.');
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

function showAgreement() {
  closeMenu();
  document.getElementById('agreementModal').style.display = 'block';
  document.getElementById('menuButton').textContent = '×';
}

function closeAgreement() {
  document.getElementById('agreementModal').style.display = 'none';
  document.getElementById('menuButton').textContent = '☰';
}

function showLicense() {
  alert('Здесь будет текст лицензионного соглашения.');
  toggleMenu();
}

function showSupport() {
  alert('Здесь будет информация о поддержке.');
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
document.addEventListener('click', function(event) {
  const menu = document.getElementById('dropdownMenu');
  const button = document.getElementById('menuButton');
  if (menu.style.display === 'block' &&
      !menu.contains(event.target) &&
      event.target !== button) {
    menu.style.display = 'none';
    button.textContent = '☰';
  }
});
