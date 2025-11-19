# DeutschLearner Backend/Frontend

## Backend (Django + DRF + JWT)

### Требования
- Python 3.12+
- PostgreSQL (опционально, иначе SQLite)

### Установка
```powershell
cd d_learner_back
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Конфигурация окружения
Файл `.env` пример:
```
SECRET_KEY=replace-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
LANGUAGE_CODE=de
TIME_ZONE=Europe/Berlin
LOG_LEVEL=INFO
CORS_ALLOWED_ORIGINS=http://localhost:5173
# DATABASE_URL=postgres://user:password@localhost:5432/deutschlearner
```

### Миграции и запуск
```powershell
python manage.py migrate
python manage.py runserver
```

### Маршруты
- Регистрация: POST /learning/user/registration/
- JWT токен: POST /learning/token/ {username,password}
- Обновление токена: POST /learning/token/refresh/ {refresh}
- Health: GET /core/health/
- XML парсер: POST /core/xml/parse/ { xml: "<root>...</root>" }

### Тесты
```powershell
pytest -q
```

## Frontend (Vite + React)
```powershell
cd d_learner_front
npm install
npm run dev
```

### Перспектива улучшений
- Добавить swagger (drf-spectacular)
- Разделить prod/dev логи
- Добавить XSD валидацию XML

