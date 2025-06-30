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
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// Примерные обработчики кнопок
function showAgreement() {
  closeMenu();
  alert('Здесь будет текст пользовательского соглашения.');
}

function showLicense() {
  closeMenu();
  alert('Здесь будет текст лицензионного соглашения.');
}

function showSupport() {
  closeMenu();
  alert('Здесь будет информация о поддержке.');
}

function closeMenu() {
  document.getElementById('dropdownMenu').style.display = 'none';
}

// Автоматически скрывать меню, если клик вне его
document.addEventListener('click', function(event) {
  const menu = document.getElementById('dropdownMenu');
  const button = document.querySelector('.menu-btn');
  if (menu && !menu.contains(event.target) && !button.contains(event.target)) {
    menu.style.display = 'none';
  }
});
