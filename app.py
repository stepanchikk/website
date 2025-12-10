from flask import Flask, render_template, jsonify, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# --- НАЛАШТУВАННЯ ---
# Пароль для адмінки
ADMIN_PASSWORD = "123"


# Функція для підключення до бази даних
def get_db_connection():
    conn = sqlite3.connect('portfolio.db')
    # Цей рядок дозволяє звертатися до колонок по імені (наприклад, row['title'])
    conn.row_factory = sqlite3.Row
    return conn


# --- ГОЛОВНІ МАРШРУТИ ---

# 1. Головна сторінка сайту
@app.route('/')
def index():
    return render_template('index.html')


# 2. API: Віддає список проєктів у форматі JSON (для JavaScript)
@app.route('/api/projects')
def get_projects():
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects').fetchall()
    conn.close()

    # Перетворюємо дані з БД у список словників
    projects_list = []
    for project in projects:
        projects_list.append({
            'id': project['id'],
            'title': project['title'],
            'description': project['description'],
            'category': project['category'],
            'image_icon': project['image_icon'],
            'image_class': project['image_class'],
            'modal_text': project['modal_text']
        })

    return jsonify(projects_list)


# --- ФУНКЦІОНАЛ АДМІНІСТРАТОРА ---

# 3. Сторінка додавання нового проєкту
@app.route('/admin')
def admin():
    return render_template('admin.html')


# 4. Логіка додавання проєкту (сюди відправляє дані форма з admin.html)
@app.route('/add_project', methods=['POST'])
def add_project():
    # Перевірка пароля
    user_password = request.form['password']
    if user_password != ADMIN_PASSWORD:
        return "<h1 style='color:red; text-align:center; margin-top:50px;'>Невірний пароль! <br><a href='/admin'>Спробувати ще раз</a></h1>"

    # Отримуємо дані з форми
    title = request.form['title']
    description = request.form['description']
    category = request.form['category']
    image_icon = request.form['image_icon']
    image_class = request.form['image_class']
    modal_text = request.form['modal_text']

    # Записуємо в БД
    conn = get_db_connection()
    conn.execute('''
                 INSERT INTO projects (title, description, category, image_icon, image_class, modal_text)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ''', (title, description, category, image_icon, image_class, modal_text))
    conn.commit()
    conn.close()

    return redirect(url_for('index'))


# --- ФУНКЦІОНАЛ ПОВІДОМЛЕНЬ (КОНТАКТИ) ---

# 5. Прийом повідомлення з головної сторінки
@app.route('/send_message', methods=['POST'])
def send_message():
    name = request.form['name']
    email = request.form['email']
    message = request.form['message']

    conn = get_db_connection()
    # Записуємо повідомлення в таблицю messages
    conn.execute('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
                 (name, email, message))
    conn.commit()
    conn.close()

    # Повертаємо просту сторінку подяки
    return """
    <div style="text-align:center; padding-top:100px; font-family:sans-serif;">
        <h1 style="color: #2ecc71;">Повідомлення успішно надіслано!</h1>
        <p>Дякуємо, ми зв'яжемося з вами найближчим часом.</p>
        <a href="/" style="color:blue; font-size: 1.2rem;">Повернутися на сайт</a>
    </div>
    """


# 6. Сторінка перегляду повідомлень (для Адміна)
@app.route('/admin/messages')
def view_messages():
    # Отримуємо параметр сортування з URL (наприклад ?sort=old)
    sort_order = request.args.get('sort', 'new')

    conn = get_db_connection()

    if sort_order == 'old':
        # Сортування: старі зверху
        messages = conn.execute('SELECT * FROM messages ORDER BY created_at ASC').fetchall()
    else:
        # Сортування: нові зверху (за замовчуванням)
        messages = conn.execute('SELECT * FROM messages ORDER BY created_at DESC').fetchall()

    conn.close()

    return render_template('messages.html', messages=messages)


# --- ЗАПУСК СЕРВЕРА ---
if __name__ == '__main__':
    app.run(debug=True)