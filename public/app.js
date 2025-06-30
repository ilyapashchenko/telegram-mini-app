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
      document.getElementById('username').textContent = result.user.firstName;
      document.getElementById('avatar').src = result.user.photoUrl;

      const serviceList = document.getElementById('serviceList');
      serviceList.innerHTML = '';

      if (result.places.length > 0) {
        result.places.forEach(place => {
          const div = document.createElement('div');
          div.className = 'service-item';
          div.textContent = place.place_name;
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
