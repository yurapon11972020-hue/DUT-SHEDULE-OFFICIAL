const app = document.getElementById('app');

let state = { user: null, board: null, columns: [], tasks: [], message: '', error: '', dragTaskId: null, filters: { taskQuery: '', status: 'all' }, supportOpen: false, supportThread: null, supportLoading: false, supportError: '', supportUnread: 0, supportLastSeenAdminMessageId: '' };
let supportPollTimer = null;

const defaultSystem = {
  language: 'ru',
  dateFormat: 'ru',
  timeFormat: '24h',
  firstDay: 'monday',
  autosave: 'on',
  notifications: 'off',
  deadlineReminder: 'day',
  confirmDelete: 'on',
  startPage: 'dashboard',
  sound: 'off',
  reducedMotion: 'off'
};

const plans = [
  { id: 'free', title: 'Базовый', price: '0 ₽', description: 'Для старта и простой личной доски.', features: ['3 стандартные колонки', 'Создание и перенос задач', 'Редактирование и удаление', '1 личная доска'] },
  { id: 'pro', title: 'Продвинутый', price: '129 ₽ / мес', description: 'Для дедлайнов, времени и контроля задач.', features: ['Дата и время задач', 'Автоцвет по дедлайну', 'До 2 дополнительных колонок', 'Приоритеты по срокам'], highlight: true },
  { id: 'max', title: 'Максимум', price: '219 ₽ / мес', description: 'Для полной свободы и кастомизации.', features: ['Неограниченные колонки', 'Свои цвета колонок', 'Цветовые метки задач', 'Все функции Pro'] }
];

const defaultDesign = {
  theme: 'pastel',
  accent: '#2563eb',
  background: 'soft',
  font: 'system',
  textSize: 'normal',
  density: 'comfortable',
  radius: 'rounded',
  shadows: 'soft',
  surface: 'glass',
  borders: 'soft',
  buttonStyle: 'solid',
  inputStyle: 'default',
  taskStyle: 'clean',
  taskSize: 'medium',
  columnStyle: 'glass',
  columnHeader: 'classic',
  boardWidth: 'wide',
  boardGap: 'normal',
  columnHeight: 'normal',
  hoverEffect: 'lift',
  animations: 'normal',
  dragAnimation: 'lift',
  headerStyle: 'glass',
  controlSize: 'normal',
  cardTone: 'standard',
  contrast: 'normal',
  glassPower: 'medium',
  accentMode: 'normal',
  columnColorMode: 'soft'
};

const designLabels = {
  theme: { pastel: 'DUT мягкая', light: 'Светлая', dark: 'Тёмная' },
  background: { soft: 'Мягкие пятна', plain: 'Чистый фон', gradient: 'Градиент', grid: 'Сетка', mesh: 'Живой фон', noise: 'Текстура' },
  font: { system: 'Системный', modern: 'Современный', strict: 'Строгий', serif: 'Серьёзный', mono: 'Технический' },
  textSize: { small: 'Меньше', normal: 'Обычный', large: 'Крупнее' },
  density: { compact: 'Компактно', comfortable: 'Удобно', spacious: 'Просторно' },
  radius: { sharp: 'Строже', rounded: 'Скруглённо', pill: 'Очень мягко' },
  shadows: { none: 'Без теней', soft: 'Мягкие', strong: 'Глубокие' },
  surface: { glass: 'Стекло', liquid: 'Жидкое стекло', solid: 'Плотные блоки', clean: 'Чистые блоки' },
  borders: { none: 'Без контуров', soft: 'Мягкие контуры', strong: 'Чёткие контуры' },
  buttonStyle: { solid: 'Залитые', soft: 'Мягкие', outline: 'Контурные', pill: 'Капсулы' },
  inputStyle: { default: 'Классические', soft: 'Мягкие', underline: 'Подчёркнутые' },
  taskStyle: { clean: 'Чистые карточки', outlined: 'Контурные', filled: 'Залитые', minimal: 'Минимализм' },
  taskSize: { small: 'Маленькие', medium: 'Средние', large: 'Крупные' },
  columnStyle: { glass: 'Стекло', solid: 'Плотные', minimal: 'Минимализм', bordered: 'Контурные' },
  columnHeader: { classic: 'Обычный', badge: 'Бейдж', underline: 'Линия снизу' },
  boardWidth: { normal: 'Обычная', wide: 'Широкая', full: 'На всю ширину' },
  boardGap: { tight: 'Плотно', normal: 'Нормально', wide: 'Широко' },
  columnHeight: { compact: 'Ниже', normal: 'Обычная', tall: 'Выше' },
  hoverEffect: { none: 'Без эффекта', lift: 'Подъём', glow: 'Свечение' },
  animations: { none: 'Без анимаций', normal: 'Стандартно', smooth: 'Плавно' },
  dragAnimation: { lift: 'Подъём', ghost: 'Призрак', snap: 'Мягкий перенос' },
  headerStyle: { glass: 'Стеклянная', solid: 'Плотная', minimal: 'Минимальная' },
  controlSize: { compact: 'Компактные', normal: 'Обычные', large: 'Крупные' },
  cardTone: { standard: 'Обычный', contrast: 'Контрастный', deep: 'Глубокий' },
  contrast: { soft: 'Мягкий', normal: 'Обычный', high: 'Высокий' },
  glassPower: { low: 'Лёгкое стекло', medium: 'Среднее стекло', high: 'Сильное стекло' },
  accentMode: { calm: 'Спокойный', normal: 'Обычный', bright: 'Яркий' },
  columnColorMode: { soft: 'Мягкие цвета', visible: 'Заметные цвета', off: 'Без цветов' }
};

const translations = {
  en: {
    'Профиль': 'Profile', 'Войти': 'Log in', 'Начать бесплатно': 'Start free', 'Создать аккаунт': 'Create account',
    'Открыть доску': 'Open board', 'Настройки': 'Settings', 'Тарифы': 'Plans', 'Рабочая доска': 'Task board',
    'Моя доска': 'My board', '+ Колонка': '+ Column', '+ Добавить задачу': '+ Add task', 'Изменить': 'Edit', 'Удалить': 'Delete',
    'Регистрация': 'Sign up', 'Вход': 'Log in', 'Ник / имя': 'Name', 'Пароль': 'Password', 'Email': 'Email',
    'Дизайн': 'Design', 'Система': 'System', 'Сохранить дизайн': 'Save design', 'Сбросить дизайн': 'Reset design',
    'Базовый': 'Basic', 'Продвинутый': 'Pro', 'Максимум': 'Max', 'Популярный': 'Popular', 'Текущий тариф': 'Current plan', 'Выбрать': 'Choose',
    'DUT мягкая': 'DUT soft', 'Светлая': 'Light', 'Тёмная': 'Dark', 'Мягкие пятна': 'Soft spots', 'Чистый фон': 'Plain background', 'Градиент': 'Gradient', 'Сетка': 'Grid', 'Живой фон': 'Live mesh', 'Текстура': 'Texture',
    'Системный': 'System', 'Современный': 'Modern', 'Строгий': 'Strict', 'Серьёзный': 'Serif', 'Технический': 'Technical', 'Меньше': 'Smaller', 'Обычный': 'Normal', 'Крупнее': 'Larger',
    'Компактно': 'Compact', 'Удобно': 'Comfortable', 'Просторно': 'Spacious', 'Строже': 'Sharper', 'Скруглённо': 'Rounded', 'Очень мягко': 'Very soft',
    'Без теней': 'No shadows', 'Мягкие': 'Soft', 'Глубокие': 'Deep', 'Стекло': 'Glass', 'Liquid Glass': 'Liquid Glass', 'Плотные блоки': 'Solid blocks', 'Чистые блоки': 'Clean blocks',
    'Без контуров': 'No borders', 'Мягкие контуры': 'Soft borders', 'Чёткие контуры': 'Strong borders', 'Залитые': 'Filled', 'Контурные': 'Outlined', 'Капсулы': 'Pills',
    'Классические': 'Classic', 'Подчёркнутые': 'Underlined', 'Чистые карточки': 'Clean cards', 'Залитые': 'Filled', 'Минимализм': 'Minimal',
    'Маленькие': 'Small', 'Средние': 'Medium', 'Крупные': 'Large', 'Плотные': 'Solid', 'Бейдж': 'Badge', 'Линия снизу': 'Underline',
    'Обычная': 'Normal', 'Широкая': 'Wide', 'На всю ширину': 'Full width', 'Плотно': 'Tight', 'Нормально': 'Normal', 'Широко': 'Wide', 'Ниже': 'Lower', 'Выше': 'Taller',
    'Без эффекта': 'No effect', 'Подъём': 'Lift', 'Свечение': 'Glow', 'Без анимаций': 'No animations', 'Стандартно': 'Standard', 'Плавно': 'Smooth',
    'Стеклянная': 'Glass', 'Плотная': 'Solid', 'Минимальная': 'Minimal', 'Компактные': 'Compact', 'Крупные': 'Large', 'Контрастный': 'Contrast', 'Глубокий': 'Deep', 'Высокий': 'High',
    'Жидкое стекло': 'Liquid Glass', 'Лёгкое стекло': 'Light glass', 'Среднее стекло': 'Medium glass', 'Сильное стекло': 'Strong glass', 'Спокойный': 'Calm', 'Яркий': 'Bright', 'Мягкие цвета': 'Soft colors', 'Заметные цвета': 'Visible colors', 'Без цветов': 'No colors',
    'Доска задач, которая выглядит серьёзно и работает просто.': 'A task board that looks professional and stays simple.',
    'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'DUT helps you organize tasks by columns, track deadlines, and unlock advanced features through a subscription.',
    'Пример доски': 'Board example', 'ЗАДАЧИ': 'TO DO', 'В процессе': 'In progress', 'Выполнено': 'Done', 'Лендинг DUT': 'DUT landing',
    'Создай аккаунт DUT и получи базовую доску бесплатно.': 'Create a DUT account and get a basic board for free.', 'Войди, чтобы открыть свою доску DUT.': 'Log in to open your DUT board.',
    'Твой ник': 'Your name', 'Минимум 6 символов': 'At least 6 characters', 'Уже есть аккаунт?': 'Already have an account?', 'Нет аккаунта?': 'No account?', 'Зарегистрироваться': 'Sign up',
    'Привет, {name}. Двигай задачи между колонками и следи за сроками.': 'Hi, {name}. Move tasks between columns and watch the deadlines.',
    'Новые колонки доступны с тарифа Pro.': 'New columns are available from the Pro plan.', 'На тарифе Pro можно создать только 2 дополнительные колонки. Для безлимита нужен тариф Max.': 'The Pro plan allows only 2 additional columns. Use Max for unlimited columns.',
    'Редактировать колонку': 'Edit column', 'Удалить колонку': 'Delete column', 'Старт': 'Start', 'Дедлайн': 'Deadline', 'Просрочено': 'Overdue',
    'Изменить задачу': 'Edit task', 'Новая задача': 'New task', 'Название': 'Title', 'Описание': 'Description', 'Дата и время старта': 'Start date and time', 'Дата и время дедлайна': 'Deadline date and time',
    'Дедлайны, время и автоцвет задач доступны с тарифа Pro.': 'Deadlines, time and automatic task colors are available from Pro.', 'Цветовая метка задачи': 'Task color label', 'Метка': 'Label', 'Отмена': 'Cancel', 'Сохранить': 'Save',
    'Новая колонка': 'New column', 'Изменить колонку': 'Edit column', 'Название колонки': 'Column title', 'Цвет колонки': 'Column color', 'Свои цвета колонок доступны на тарифе Max.': 'Custom column colors are available on Max.',
    'Удалить задачу?': 'Delete the task?', 'Удалить колонку вместе с задачами?': 'Delete the column with its tasks?',
    'Дальше': 'Next', 'Управление аккаунтом': 'Account management', 'ТАРИФ': 'PLAN', 'НАСТРОЙКИ': 'SETTINGS', 'Открыть тарифы →': 'Open plans →', 'Открыть настройки →': 'Open settings →',
    'Посмотреть Free, Pro, Max и изменить уровень доступа.': 'View Free, Pro and Max and change your access level.', 'Изменить данные профиля и настроить внешний вид сайта.': 'Edit profile data and adjust the site appearance.',
    'Ник': 'Name', 'Почта': 'Email', 'Аккаунт создан': 'Account created', 'Возраст аккаунта': 'Account age', 'Всего задач': 'Total tasks', 'Колонок на доске': 'Board columns', 'дн.': 'days',
    'Подписка': 'Subscription', 'Выбери уровень доступа': 'Choose an access level', 'Текущий': 'Current', 'Для старта и простой личной доски.': 'For getting started and a simple personal board.',
    'Для дедлайнов, времени и контроля задач.': 'For deadlines, time tracking and task control.', 'Для полной свободы и кастомизации.': 'For full freedom and customization.',
    '3 стандартные колонки': '3 standard columns', 'Создание и перенос задач': 'Create and move tasks', 'Редактирование и удаление': 'Edit and delete', '1 личная доска': '1 personal board',
    'Дата и время задач': 'Task date and time', 'Автоцвет по дедлайну': 'Auto color by deadline', 'До 2 дополнительных колонок': 'Up to 2 extra columns', 'Приоритеты по срокам': 'Deadline priorities',
    'Неограниченные колонки': 'Unlimited columns', 'Свои цвета колонок': 'Custom column colors', 'Цветовые метки задач': 'Task color labels', 'Все функции Pro': 'All Pro features',
    'Профиль': 'Profile', 'Имя, почта, аккаунт': 'Name, email, account', 'Пресеты, тема, элементы': 'Presets, theme, elements', 'Язык, формат времени, поведение': 'Language, time format, behavior',
    'Данные': 'Data', 'Настройка профиля': 'Profile settings', 'Сохранить данные': 'Save data', 'Информация': 'Information', 'Аккаунт': 'Account', 'ID аккаунта': 'Account ID', 'Создан': 'Created', 'Последнее обновление': 'Last update',
    'Управление сессией': 'Session management', 'Выход удалит текущую сессию на этом устройстве. Данные аккаунта сохранятся.': 'Logout removes the current session on this device. Account data stays saved.', 'Выйти из аккаунта': 'Log out',
    'Пресеты': 'Presets', 'Готовые стили': 'Ready-made styles', 'Нажми пресет — настройки применятся сразу. Потом можно вручную докрутить детали.': 'Click a preset — settings apply instantly. You can fine-tune them afterwards.',
    'Основа сайта': 'Site base', 'Тема, фон, шрифт, контраст': 'Theme, background, font, contrast', 'Карточки и блоки': 'Cards and blocks', 'Материал, тени, контуры, скругление': 'Material, shadows, borders, radius',
    'Кнопки и поля': 'Buttons and fields', 'Формы, hover, анимации, размеры': 'Forms, hover, animations, sizes', 'Доска и задачи': 'Board and tasks', 'Колонки, задачи, ширина и высота': 'Columns, tasks, width and height',
    'Тема сайта': 'Site theme', 'Основной визуальный режим интерфейса': 'Main visual interface mode', 'Акцентный цвет': 'Accent color', 'Цвет кнопок, активных вкладок и подсветки.': 'Color of buttons, active tabs and highlights.',
    'Фон сайта': 'Site background', 'Чистый фон, градиент, сетка или живой фон': 'Plain background, gradient, grid or live mesh', 'Шрифт': 'Font', 'Системный, строгий, технический или более мягкий': 'System, strict, technical or softer',
    'Размер текста': 'Text size', 'Масштаб текста по всему сайту': 'Text scale across the site', 'Контраст интерфейса': 'Interface contrast', 'Насколько сильными будут текст и границы': 'How strong text and borders will be',
    'Плотность интерфейса': 'Interface density', 'Сколько воздуха между элементами': 'Spacing between elements', 'Скругление элементов': 'Element radius', 'Строгие углы, скругление или мягкие капсулы': 'Sharp corners, radius or soft pills',
    'Материал карточек': 'Card material', 'Стекло, жидкое стекло, плотные блоки или чистые панели': 'Glass, liquid glass, solid blocks or clean panels', 'Сила стекла': 'Glass strength', 'Насколько заметен стеклянный эффект': 'How visible the glass effect is',
    'Контуры': 'Borders', 'Без контуров, мягкие или чёткие границы': 'No borders, soft or strong borders', 'Тени': 'Shadows', 'Глубина карточек и панелей': 'Depth of cards and panels', 'Тон карточек': 'Card tone', 'Обычный, контрастный или глубокий вид': 'Normal, contrast or deep look',
    'Стиль кнопок': 'Button style', 'Залитые, мягкие, контурные или капсулы': 'Filled, soft, outlined or pills', 'Сила акцента': 'Accent strength', 'Спокойный, обычный или яркий цветовой акцент': 'Calm, normal or bright accent',
    'Стиль полей': 'Field style', 'Внешний вид input, textarea и select': 'Appearance of inputs, textareas and selects', 'Hover-эффект': 'Hover effect', 'Поведение карточек при наведении': 'Card behavior on hover',
    'Анимации': 'Animations', 'Скорость переходов и hover': 'Speed of transitions and hover', 'Размер кнопок и полей': 'Control size', 'Компактные, обычные или крупные контролы': 'Compact, normal or large controls',
    'Ширина рабочей зоны': 'Workspace width', 'Обычная, широкая или вся ширина': 'Normal, wide or full width', 'Расстояние колонок': 'Column gap', 'Плотно, нормально или широко': 'Tight, normal or wide',
    'Высота колонок': 'Column height', 'Ниже, обычная или высокая доска': 'Lower, normal or taller board', 'Стиль колонок': 'Column style', 'Стекло, плотные панели, контур или минимализм': 'Glass, solid panels, outline or minimalism',
    'Цвет колонок': 'Column color', 'Мягкие цвета, заметные цвета или отключить': 'Soft colors, visible colors or off', 'Заголовки колонок': 'Column headers', 'Обычные, бейджи или линия снизу': 'Classic, badges or underline',
    'Стиль задач': 'Task style', 'Чистые, контурные, залитые или минимализм': 'Clean, outlined, filled or minimal', 'Размер задач': 'Task size', 'Меньше, средние или крупные': 'Smaller, medium or larger',
    'Live preview': 'Live preview', 'Проверка изменений': 'Change preview', 'Скрыть': 'Hide', 'Показать': 'Show', 'Кнопка': 'Button', 'Пример поля': 'Sample field', 'Пример select': 'Sample select', 'Карточка': 'Card', 'Панель': 'Panel', 'Тег': 'Tag', 'Кнопки': 'Buttons', 'Поле': 'Field', 'Карточка задачи': 'Task card', 'Готово': 'Done',
    'Проверка изменений закреплена справа на больших экранах и переносится вниз на маленьких. Меняй настройки — результат обновляется сразу.': 'The change preview is pinned on the right on large screens and moves below on small screens. Change settings — the result updates instantly.',
    'Случайный стиль': 'Random style', 'Язык': 'Language', 'Перевод и формат': 'Translation and format', 'Язык интерфейса': 'Interface language', 'Основной язык сайта. Палитра меток задач тоже меняется под выбранный язык.': 'Main site language. Task label palettes also change according to the selected language.',
    'Формат даты': 'Date format', 'Как показывать даты в задачах и профиле': 'How dates are shown in tasks and profile', 'Формат времени': 'Time format', '24-часовой или 12-часовой формат': '24-hour or 12-hour format', 'Первый день недели': 'First day of week', 'Для будущего календаря и дедлайнов': 'For future calendar and deadlines',
    'Поведение': 'Behavior', 'Работа сервиса': 'Service behavior', 'Автосохранение': 'Autosave', 'Автоматически сохранять изменения': 'Automatically save changes', 'Подтверждение удаления': 'Delete confirmation', 'Защита от случайного удаления задач и колонок': 'Protection from accidental task and column deletion', 'Стартовая страница': 'Start page', 'Куда отправлять после входа': 'Where to go after login', 'Меньше анимаций': 'Reduced motion', 'Полезно для слабых устройств и спокойного интерфейса': 'Useful for slower devices and a calmer interface',
    'Уведомления': 'Notifications', 'Напоминания': 'Reminders', 'Тип уведомлений': 'Notification type', 'Пока подготовка под браузерные уведомления': 'Preparation for browser notifications', 'Напоминать о дедлайне': 'Deadline reminder', 'За сколько времени предупреждать о сроке': 'How early to warn about a deadline', 'Звуки интерфейса': 'Interface sounds', 'Будущие мягкие звуки для действий': 'Future soft action sounds', 'Пример системного уведомления': 'System notification example', 'Задача «Дизайн DUT» скоро истекает.': 'Task “DUT design” is due soon.', 'Сохранить системные настройки': 'Save system settings', 'Данные профиля обновлены.': 'Profile data updated.', 'Дизайн сброшен к базовому виду.': 'Design reset to the base style.', 'Дизайн сайта сохранён.': 'Site design saved.', 'Системные настройки сохранены.': 'System settings saved.', 'Тариф изменён на {plan}.': 'Plan changed to {plan}.',
    'Готовая палитра под язык': 'Language-based palette', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': 'The palette changes automatically based on the interface language. Manual color selection is still available.', 'Свой цвет': 'Custom color',
    'Русская палитра': 'Russian palette', 'Английская палитра': 'English palette', 'Нидерландская палитра': 'Dutch palette', 'Арабская палитра': 'Arabic palette', 'Испанская палитра': 'Spanish palette', 'Китайская палитра': 'Chinese palette', 'Французская палитра': 'French palette',
    'Лазурный': 'Azure', 'Белый': 'White', 'Алый': 'Scarlet', 'Берёзовый': 'Birch', 'Северная ночь': 'Northern night', 'Королевский синий': 'Royal blue', 'Изумрудный': 'Emerald', 'Вишнёвый': 'Cherry', 'Лавандовый': 'Lavender', 'Графит': 'Graphite',
    'Оранжевый': 'Orange', 'Тюльпан': 'Tulip', 'Морская волна': 'Sea green', 'Зелёный': 'Green', 'Золото': 'Gold', 'Красный': 'Red', 'Чёрный': 'Black', 'Бирюза': 'Turquoise', 'Солнечный': 'Sunny', 'Олива': 'Olive', 'Маджента': 'Magenta', 'Небесный': 'Sky blue',
    'Императорский красный': 'Imperial red', 'Нефритовый': 'Jade', 'Синий фарфор': 'Porcelain blue', 'Розовый': 'Pink', 'Французский синий': 'French blue', 'Кремовый': 'Cream', 'Бордо': 'Bordeaux', 'Шампань': 'Champagne'
  },
  nl: {
    'Профиль': 'Profiel', 'Войти': 'Inloggen', 'Начать бесплатно': 'Gratis starten', 'Создать аккаунт': 'Account maken', 'Открыть доску': 'Bord openen', 'Настройки': 'Instellingen', 'Тарифы': 'Abonnementen', 'Рабочая доска': 'Takenbord',
    'Моя доска': 'Mijn bord', '+ Колонка': '+ Kolom', '+ Добавить задачу': '+ Taak toevoegen', 'Изменить': 'Bewerken', 'Удалить': 'Verwijderen', 'Регистрация': 'Registratie', 'Вход': 'Inloggen', 'Ник / имя': 'Naam', 'Пароль': 'Wachtwoord', 'Email': 'Email',
    'Дизайн': 'Design', 'Система': 'Systeem', 'Сохранить дизайн': 'Design opslaan', 'Сбросить дизайн': 'Design resetten', 'Базовый': 'Basis', 'Продвинутый': 'Pro', 'Максимум': 'Max', 'Популярный': 'Populair', 'Текущий тариф': 'Huidig abonnement', 'Выбрать': 'Kiezen',
    'DUT мягкая': 'DUT zacht', 'Светлая': 'Licht', 'Тёмная': 'Donker', 'Мягкие пятна': 'Zachte vlekken', 'Чистый фон': 'Schone achtergrond', 'Градиент': 'Verloop', 'Сетка': 'Raster', 'Живой фон': 'Levend mesh', 'Текстура': 'Textuur',
    'Доска задач, которая выглядит серьёзно и работает просто.': 'Een takenbord dat professioneel oogt en eenvoudig werkt.', 'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'DUT helpt taken in kolommen te organiseren, deadlines te volgen en via abonnement extra functies te openen.',
    'Пример доски': 'Bordvoorbeeld', 'ЗАДАЧИ': 'TAKEN', 'В процессе': 'Bezig', 'Выполнено': 'Klaar', 'Лендинг DUT': 'DUT landing', 'Создай аккаунт DUT и получи базовую доску бесплатно.': 'Maak een DUT-account en krijg gratis een basisbord.', 'Войди, чтобы открыть свою доску DUT.': 'Log in om je DUT-bord te openen.',
    'Твой ник': 'Je naam', 'Минимум 6 символов': 'Minimaal 6 tekens', 'Уже есть аккаунт?': 'Al een account?', 'Нет аккаунта?': 'Geen account?', 'Зарегистрироваться': 'Registreren', 'Привет, {name}. Двигай задачи между колонками и следи за сроками.': 'Hoi, {name}. Verplaats taken tussen kolommen en bewaak deadlines.',
    'Редактировать колонку': 'Kolom bewerken', 'Удалить колонку': 'Kolom verwijderen', 'Старт': 'Start', 'Дедлайн': 'Deadline', 'Просрочено': 'Te laat', 'Изменить задачу': 'Taak bewerken', 'Новая задача': 'Nieuwe taak', 'Название': 'Titel', 'Описание': 'Beschrijving', 'Дата и время старта': 'Startdatum en tijd', 'Дата и время дедлайна': 'Deadline datum en tijd',
    'Цветовая метка задачи': 'Kleurlabel taak', 'Метка': 'Label', 'Отмена': 'Annuleren', 'Сохранить': 'Opslaan', 'Новая колонка': 'Nieuwe kolom', 'Изменить колонку': 'Kolom bewerken', 'Название колонки': 'Kolomtitel', 'Цвет колонки': 'Kolomkleur',
    'Дальше': 'Verder', 'Управление аккаунтом': 'Accountbeheer', 'ТАРИФ': 'ABONNEMENT', 'НАСТРОЙКИ': 'INSTELLINGEN', 'Открыть тарифы →': 'Abonnementen openen →', 'Открыть настройки →': 'Instellingen openen →', 'Ник': 'Naam', 'Почта': 'Email', 'Аккаунт создан': 'Account aangemaakt', 'Всего задач': 'Totaal taken', 'Колонок на доске': 'Kolommen',
    'Подписка': 'Abonnement', 'Выбери уровень доступа': 'Kies toegangsniveau', 'Текущий': 'Huidig', 'Пресеты': 'Presets', 'Готовые стили': 'Kant-en-klare stijlen', 'Основа сайта': 'Basis van de site', 'Карточки и блоки': 'Kaarten en blokken', 'Кнопки и поля': 'Knoppen en velden', 'Доска и задачи': 'Bord en taken',
    'Акцентный цвет': 'Accentkleur', 'Фон сайта': 'Achtergrond', 'Шрифт': 'Lettertype', 'Размер текста': 'Tekstgrootte', 'Контраст интерфейса': 'Interfacecontrast', 'Проверка изменений': 'Wijzigingen controleren', 'Скрыть': 'Verbergen', 'Показать': 'Tonen', 'Кнопка': 'Knop', 'Пример поля': 'Voorbeeldveld', 'Карточка': 'Kaart', 'Панель': 'Paneel', 'Тег': 'Tag', 'Кнопки': 'Knoppen', 'Поле': 'Veld', 'Карточка задачи': 'Taakkaart', 'Готово': 'Klaar', 'Случайный стиль': 'Willekeurige stijl',
    'Язык': 'Taal', 'Перевод и формат': 'Vertaling en formaat', 'Язык интерфейса': 'Interfacetaal', 'Формат даты': 'Datumformaat', 'Формат времени': 'Tijdformaat', 'Первый день недели': 'Eerste dag van de week', 'Поведение': 'Gedrag', 'Работа сервиса': 'Servicegedrag', 'Автосохранение': 'Automatisch opslaan', 'Подтверждение удаления': 'Verwijderen bevestigen', 'Стартовая страница': 'Startpagina', 'Меньше анимаций': 'Minder animaties', 'Уведомления': 'Meldingen', 'Напоминания': 'Herinneringen', 'Тип уведомлений': 'Type melding', 'Напоминать о дедлайне': 'Deadline herinnering', 'Звуки интерфейса': 'Interfacegeluiden', 'Сохранить системные настройки': 'Systeeminstellingen opslaan',
    'Данные профиля обновлены.': 'Profielgegevens bijgewerkt.', 'Дизайн сброшен к базовому виду.': 'Design teruggezet naar basis.', 'Дизайн сайта сохранён.': 'Sitedesign opgeslagen.', 'Системные настройки сохранены.': 'Systeeminstellingen opgeslagen.', 'Тариф изменён на {plan}.': 'Abonnement gewijzigd naar {plan}.',
    'Стекло': 'Glas', 'Liquid Glass': 'Liquid Glass', 'Плотные блоки': 'Dichte blokken', 'Чистые блоки': 'Schone blokken', 'Лёгкое стекло': 'Licht glas', 'Среднее стекло': 'Middelglas', 'Сильное стекло': 'Sterk glas',
    'Готовая палитра под язык': 'Palet per taal', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': 'Het palet wisselt automatisch met de interfacetaal. Handmatig een kleur kiezen blijft mogelijk.', 'Свой цвет': 'Eigen kleur', 'Нидерландская палитра': 'Nederlands palet', 'Оранжевый': 'Oranje', 'Королевский синий': 'Koningsblauw', 'Тюльпан': 'Tulp', 'Морская волна': 'Zeegroen', 'Кремовый': 'Creme'
  },
  ar: {
    'Профиль': 'الملف الشخصي', 'Войти': 'تسجيل الدخول', 'Начать бесплатно': 'ابدأ مجانًا', 'Создать аккаунт': 'إنشاء حساب', 'Открыть доску': 'فتح اللوحة', 'Настройки': 'الإعدادات', 'Тарифы': 'الباقات', 'Рабочая доска': 'لوحة المهام', 'Моя доска': 'لوحتي', '+ Колонка': '+ عمود', '+ Добавить задачу': '+ إضافة مهمة', 'Изменить': 'تعديل', 'Удалить': 'حذف', 'Регистрация': 'تسجيل', 'Вход': 'دخول', 'Ник / имя': 'الاسم', 'Пароль': 'كلمة المرور', 'Email': 'البريد الإلكتروني', 'Дизайн': 'التصميم', 'Система': 'النظام', 'Сохранить дизайн': 'حفظ التصميم', 'Сбросить дизайн': 'إعادة ضبط التصميم',
    'Базовый': 'أساسي', 'Продвинутый': 'احترافي', 'Максимум': 'الأقصى', 'Популярный': 'الأكثر شيوعًا', 'Текущий тариф': 'الباقة الحالية', 'Выбрать': 'اختيار',
    'Доска задач, которая выглядит серьёзно и работает просто.': 'لوحة مهام تبدو احترافية وتبقى سهلة.', 'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'يساعدك DUT على تنظيم المهام في أعمدة ومتابعة المواعيد وفتح الميزات المتقدمة بالاشتراك.', 'Пример доски': 'مثال لوحة', 'ЗАДАЧИ': 'المهام', 'В процессе': 'قيد التنفيذ', 'Выполнено': 'تم', 'Лендинг DUT': 'صفحة DUT',
    'Создай аккаунт DUT и получи базовую доску бесплатно.': 'أنشئ حساب DUT واحصل على لوحة أساسية مجانًا.', 'Войди, чтобы открыть свою доску DUT.': 'سجّل الدخول لفتح لوحة DUT الخاصة بك.', 'Твой ник': 'اسمك', 'Минимум 6 символов': '6 أحرف على الأقل', 'Уже есть аккаунт?': 'لديك حساب؟', 'Нет аккаунта?': 'ليس لديك حساب؟', 'Зарегистрироваться': 'التسجيل',
    'Привет, {name}. Двигай задачи между колонками и следи за сроками.': 'مرحبًا {name}. انقل المهام بين الأعمدة وتابع المواعيد.', 'Редактировать колонку': 'تعديل العمود', 'Удалить колонку': 'حذف العمود', 'Старт': 'البداية', 'Дедлайн': 'الموعد النهائي', 'Просрочено': 'متأخر', 'Изменить задачу': 'تعديل المهمة', 'Новая задача': 'مهمة جديدة', 'Название': 'العنوان', 'Описание': 'الوصف', 'Дата и время старта': 'تاريخ ووقت البداية', 'Дата и время дедлайна': 'تاريخ ووقت الموعد النهائي', 'Цветовая метка задачи': 'وسم لون المهمة', 'Метка': 'وسم', 'Отмена': 'إلغاء', 'Сохранить': 'حفظ', 'Новая колонка': 'عمود جديد', 'Изменить колонку': 'تعديل العمود', 'Название колонки': 'عنوان العمود', 'Цвет колонки': 'لون العمود',
    'Дальше': 'التالي', 'Управление аккаунтом': 'إدارة الحساب', 'ТАРИФ': 'الباقة', 'НАСТРОЙКИ': 'الإعدادات', 'Открыть тарифы →': 'فتح الباقات →', 'Открыть настройки →': 'فتح الإعدادات →', 'Ник': 'الاسم', 'Почта': 'البريد', 'Аккаунт создан': 'تم إنشاء الحساب', 'Всего задач': 'إجمالي المهام', 'Колонок на доске': 'أعمدة اللوحة', 'Подписка': 'الاشتراك', 'Выбери уровень доступа': 'اختر مستوى الوصول', 'Текущий': 'الحالي',
    'Профиль': 'الملف الشخصي', 'Имя, почта, аккаунт': 'الاسم والبريد والحساب', 'Пресеты, тема, элементы': 'أنماط وموضوع وعناصر', 'Язык, формат времени, поведение': 'اللغة والوقت والسلوك', 'Данные': 'البيانات', 'Настройка профиля': 'إعدادات الملف الشخصي', 'Сохранить данные': 'حفظ البيانات', 'Информация': 'معلومات', 'Аккаунт': 'الحساب', 'Выйти из аккаунта': 'تسجيل الخروج',
    'Пресеты': 'أنماط جاهزة', 'Готовые стили': 'أنماط جاهزة', 'Основа сайта': 'أساس الموقع', 'Карточки и блоки': 'البطاقات والكتل', 'Кнопки и поля': 'الأزرار والحقول', 'Доска и задачи': 'اللوحة والمهام', 'Акцентный цвет': 'لون التمييز', 'Фон сайта': 'خلفية الموقع', 'Шрифт': 'الخط', 'Размер текста': 'حجم النص', 'Контраст интерфейса': 'تباين الواجهة', 'Проверка изменений': 'معاينة التغييرات', 'Скрыть': 'إخفاء', 'Показать': 'إظهار', 'Кнопка': 'زر', 'Пример поля': 'حقل مثال', 'Карточка': 'بطاقة', 'Панель': 'لوحة', 'Тег': 'وسم', 'Кнопки': 'أزرار', 'Поле': 'حقل', 'Карточка задачи': 'بطاقة مهمة', 'Готово': 'تم', 'Случайный стиль': 'نمط عشوائي',
    'Язык': 'اللغة', 'Перевод и формат': 'الترجمة والتنسيق', 'Язык интерфейса': 'لغة الواجهة', 'Формат даты': 'تنسيق التاريخ', 'Формат времени': 'تنسيق الوقت', 'Первый день недели': 'أول يوم في الأسبوع', 'Поведение': 'السلوك', 'Работа сервиса': 'عمل الخدمة', 'Автосохранение': 'الحفظ التلقائي', 'Подтверждение удаления': 'تأكيد الحذف', 'Стартовая страница': 'صفحة البداية', 'Меньше анимаций': 'حركة أقل', 'Уведомления': 'الإشعارات', 'Напоминания': 'التذكيرات', 'Тип уведомлений': 'نوع الإشعارات', 'Напоминать о дедлайне': 'تذكير بالموعد', 'Звуки интерфейса': 'أصوات الواجهة', 'Сохранить системные настройки': 'حفظ إعدادات النظام', 'Данные профиля обновлены.': 'تم تحديث بيانات الملف الشخصي.', 'Дизайн сброшен к базовому виду.': 'تمت إعادة التصميم إلى النمط الأساسي.', 'Дизайн сайта сохранён.': 'تم حفظ تصميم الموقع.', 'Системные настройки сохранены.': 'تم حفظ إعدادات النظام.', 'Тариф изменён на {plan}.': 'تم تغيير الباقة إلى {plan}.',
    'Готовая палитра под язык': 'لوحة ألوان حسب اللغة', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': 'تتغير اللوحة تلقائيًا حسب لغة الواجهة. يبقى اختيار اللون يدويًا متاحًا.', 'Свой цвет': 'لون مخصص', 'Арабская палитра': 'لوحة عربية', 'Зелёный': 'أخضر', 'Золото': 'ذهبي', 'Красный': 'أحمر', 'Чёрный': 'أسود', 'Бирюза': 'فيروزي', 'Белый': 'أبيض'
  },
  es: {
    'Профиль': 'Perfil', 'Войти': 'Iniciar sesión', 'Начать бесплатно': 'Empezar gratis', 'Создать аккаунт': 'Crear cuenta', 'Открыть доску': 'Abrir tablero', 'Настройки': 'Ajustes', 'Тарифы': 'Planes', 'Рабочая доска': 'Tablero de tareas', 'Моя доска': 'Mi tablero', '+ Колонка': '+ Columna', '+ Добавить задачу': '+ Añadir tarea', 'Изменить': 'Editar', 'Удалить': 'Eliminar', 'Регистрация': 'Registro', 'Вход': 'Acceso', 'Ник / имя': 'Nombre', 'Пароль': 'Contraseña', 'Email': 'Email', 'Дизайн': 'Diseño', 'Система': 'Sistema', 'Сохранить дизайн': 'Guardar diseño', 'Сбросить дизайн': 'Restablecer diseño',
    'Базовый': 'Básico', 'Продвинутый': 'Pro', 'Максимум': 'Máximo', 'Популярный': 'Popular', 'Текущий тариф': 'Plan actual', 'Выбрать': 'Elegir', 'Доска задач, которая выглядит серьёзно и работает просто.': 'Un tablero de tareas profesional y fácil de usar.', 'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'DUT ayuda a organizar tareas por columnas, controlar fechas límite y desbloquear funciones avanzadas con suscripción.', 'Пример доски': 'Ejemplo de tablero', 'ЗАДАЧИ': 'TAREAS', 'В процессе': 'En proceso', 'Выполнено': 'Hecho', 'Лендинг DUT': 'Landing DUT',
    'Создай аккаунт DUT и получи базовую доску бесплатно.': 'Crea una cuenta DUT y recibe un tablero básico gratis.', 'Войди, чтобы открыть свою доску DUT.': 'Inicia sesión para abrir tu tablero DUT.', 'Твой ник': 'Tu nombre', 'Минимум 6 символов': 'Mínimo 6 caracteres', 'Уже есть аккаунт?': '¿Ya tienes cuenta?', 'Нет аккаунта?': '¿No tienes cuenta?', 'Зарегистрироваться': 'Registrarse', 'Привет, {name}. Двигай задачи между колонками и следи за сроками.': 'Hola, {name}. Mueve tareas entre columnas y controla los plazos.',
    'Редактировать колонку': 'Editar columna', 'Удалить колонку': 'Eliminar columna', 'Старт': 'Inicio', 'Дедлайн': 'Fecha límite', 'Просрочено': 'Vencido', 'Изменить задачу': 'Editar tarea', 'Новая задача': 'Nueva tarea', 'Название': 'Título', 'Описание': 'Descripción', 'Дата и время старта': 'Fecha y hora de inicio', 'Дата и время дедлайна': 'Fecha y hora límite', 'Цветовая метка задачи': 'Etiqueta de color', 'Метка': 'Etiqueta', 'Отмена': 'Cancelar', 'Сохранить': 'Guardar', 'Новая колонка': 'Nueva columna', 'Изменить колонку': 'Editar columna', 'Название колонки': 'Título de columna', 'Цвет колонки': 'Color de columna',
    'Дальше': 'Siguiente', 'Управление аккаунтом': 'Gestión de cuenta', 'ТАРИФ': 'PLAN', 'НАСТРОЙКИ': 'AJUSTES', 'Открыть тарифы →': 'Abrir planes →', 'Открыть настройки →': 'Abrir ajustes →', 'Ник': 'Nombre', 'Почта': 'Correo', 'Аккаунт создан': 'Cuenta creada', 'Всего задач': 'Total de tareas', 'Колонок на доске': 'Columnas', 'Подписка': 'Suscripción', 'Выбери уровень доступа': 'Elige nivel de acceso', 'Текущий': 'Actual',
    'Пресеты': 'Preajustes', 'Готовые стили': 'Estilos listos', 'Основа сайта': 'Base del sitio', 'Карточки и блоки': 'Tarjetas y bloques', 'Кнопки и поля': 'Botones y campos', 'Доска и задачи': 'Tablero y tareas', 'Акцентный цвет': 'Color de acento', 'Фон сайта': 'Fondo del sitio', 'Шрифт': 'Fuente', 'Размер текста': 'Tamaño de texto', 'Контраст интерфейса': 'Contraste de interfaz', 'Проверка изменений': 'Vista de cambios', 'Скрыть': 'Ocultar', 'Показать': 'Mostrar', 'Кнопка': 'Botón', 'Пример поля': 'Campo de ejemplo', 'Карточка': 'Tarjeta', 'Панель': 'Panel', 'Тег': 'Etiqueta', 'Кнопки': 'Botones', 'Поле': 'Campo', 'Карточка задачи': 'Tarjeta de tarea', 'Готово': 'Listo', 'Случайный стиль': 'Estilo aleatorio',
    'Язык': 'Idioma', 'Перевод и формат': 'Traducción y formato', 'Язык интерфейса': 'Idioma de interfaz', 'Формат даты': 'Formato de fecha', 'Формат времени': 'Formato de hora', 'Первый день недели': 'Primer día de la semana', 'Поведение': 'Comportamiento', 'Работа сервиса': 'Funcionamiento', 'Автосохранение': 'Autoguardado', 'Подтверждение удаления': 'Confirmar eliminación', 'Стартовая страница': 'Página inicial', 'Меньше анимаций': 'Menos animaciones', 'Уведомления': 'Notificaciones', 'Напоминания': 'Recordatorios', 'Тип уведомлений': 'Tipo de notificación', 'Напоминать о дедлайне': 'Recordar fecha límite', 'Звуки интерфейса': 'Sonidos de interfaz', 'Сохранить системные настройки': 'Guardar ajustes del sistema', 'Данные профиля обновлены.': 'Datos del perfil actualizados.', 'Дизайн сброшен к базовому виду.': 'Diseño restablecido al estilo base.', 'Дизайн сайта сохранён.': 'Diseño del sitio guardado.', 'Системные настройки сохранены.': 'Ajustes del sistema guardados.', 'Тариф изменён на {plan}.': 'Plan cambiado a {plan}.',
    'Готовая палитра под язык': 'Paleta según idioma', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': 'La paleta cambia automáticamente según el idioma de la interfaz. También puedes elegir un color manualmente.', 'Свой цвет': 'Color propio', 'Испанская палитра': 'Paleta española', 'Красный': 'Rojo', 'Золото': 'Oro', 'Солнечный': 'Soleado', 'Олива': 'Oliva', 'Бирюза': 'Turquesa', 'Маджента': 'Magenta'
  },
  zh: {
    'Профиль': '个人资料', 'Войти': '登录', 'Начать бесплатно': '免费开始', 'Создать аккаунт': '创建账户', 'Открыть доску': '打开看板', 'Настройки': '设置', 'Тарифы': '套餐', 'Рабочая доска': '任务看板', 'Моя доска': '我的看板', '+ Колонка': '+ 列', '+ Добавить задачу': '+ 添加任务', 'Изменить': '编辑', 'Удалить': '删除', 'Регистрация': '注册', 'Вход': '登录', 'Ник / имя': '姓名', 'Пароль': '密码', 'Email': '邮箱', 'Дизайн': '设计', 'Система': '系统', 'Сохранить дизайн': '保存设计', 'Сбросить дизайн': '重置设计',
    'Базовый': '基础版', 'Продвинутый': '专业版', 'Максимум': '旗舰版', 'Популярный': '热门', 'Текущий тариф': '当前套餐', 'Выбрать': '选择', 'Доска задач, которая выглядит серьёзно и работает просто.': '专业而简单的任务看板。', 'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'DUT 帮你按列组织任务、跟踪截止日期，并通过订阅解锁高级功能。', 'Пример доски': '看板示例', 'ЗАДАЧИ': '待办', 'В процессе': '进行中', 'Выполнено': '已完成', 'Лендинг DUT': 'DUT 落地页',
    'Создай аккаунт DUT и получи базовую доску бесплатно.': '创建 DUT 账户，免费获得基础看板。', 'Войди, чтобы открыть свою доску DUT.': '登录以打开你的 DUT 看板。', 'Твой ник': '你的名字', 'Минимум 6 символов': '至少 6 个字符', 'Уже есть аккаунт?': '已有账户？', 'Нет аккаунта?': '没有账户？', 'Зарегистрироваться': '注册', 'Привет, {name}. Двигай задачи между колонками и следи за сроками.': '你好，{name}。在列之间移动任务并关注期限。',
    'Редактировать колонку': '编辑列', 'Удалить колонку': '删除列', 'Старт': '开始', 'Дедлайн': '截止', 'Просрочено': '逾期', 'Изменить задачу': '编辑任务', 'Новая задача': '新任务', 'Название': '标题', 'Описание': '描述', 'Дата и время старта': '开始日期和时间', 'Дата и время дедлайна': '截止日期和时间', 'Цветовая метка задачи': '任务颜色标签', 'Метка': '标签', 'Отмена': '取消', 'Сохранить': '保存', 'Новая колонка': '新列', 'Изменить колонку': '编辑列', 'Название колонки': '列标题', 'Цвет колонки': '列颜色',
    'Дальше': '下一步', 'Управление аккаунтом': '账户管理', 'ТАРИФ': '套餐', 'НАСТРОЙКИ': '设置', 'Открыть тарифы →': '打开套餐 →', 'Открыть настройки →': '打开设置 →', 'Ник': '姓名', 'Почта': '邮箱', 'Аккаунт создан': '账户创建于', 'Всего задач': '任务总数', 'Колонок на доске': '看板列数', 'Подписка': '订阅', 'Выбери уровень доступа': '选择访问级别', 'Текущий': '当前',
    'Пресеты': '预设', 'Готовые стили': '现成样式', 'Основа сайта': '网站基础', 'Карточки и блоки': '卡片和区块', 'Кнопки и поля': '按钮和输入框', 'Доска и задачи': '看板和任务', 'Акцентный цвет': '强调色', 'Фон сайта': '网站背景', 'Шрифт': '字体', 'Размер текста': '文字大小', 'Контраст интерфейса': '界面对比度', 'Проверка изменений': '变更预览', 'Скрыть': '隐藏', 'Показать': '显示', 'Кнопка': '按钮', 'Пример поля': '示例输入框', 'Карточка': '卡片', 'Панель': '面板', 'Тег': '标签', 'Кнопки': '按钮', 'Поле': '字段', 'Карточка задачи': '任务卡片', 'Готово': '完成', 'Случайный стиль': '随机样式',
    'Язык': '语言', 'Перевод и формат': '翻译和格式', 'Язык интерфейса': '界面语言', 'Формат даты': '日期格式', 'Формат времени': '时间格式', 'Первый день недели': '每周第一天', 'Поведение': '行为', 'Работа сервиса': '服务行为', 'Автосохранение': '自动保存', 'Подтверждение удаления': '删除确认', 'Стартовая страница': '起始页面', 'Меньше анимаций': '减少动画', 'Уведомления': '通知', 'Напоминания': '提醒', 'Тип уведомлений': '通知类型', 'Напоминать о дедлайне': '截止提醒', 'Звуки интерфейса': '界面声音', 'Сохранить системные настройки': '保存系统设置', 'Данные профиля обновлены.': '个人资料已更新。', 'Дизайн сброшен к базовому виду.': '设计已重置为基础样式。', 'Дизайн сайта сохранён.': '网站设计已保存。', 'Системные настройки сохранены.': '系统设置已保存。', 'Тариф изменён на {plan}.': '套餐已更改为 {plan}。',
    'Готовая палитра под язык': '按语言的调色板', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': '调色板会根据界面语言自动变化，也可以手动选择颜色。', 'Свой цвет': '自定义颜色', 'Китайская палитра': '中文调色板', 'Императорский красный': '帝王红', 'Золото': '金色', 'Нефритовый': '玉色', 'Синий фарфор': '青花蓝', 'Розовый': '粉色', 'Чёрный': '黑色'
  },
  fr: {
    'Профиль': 'Profil', 'Войти': 'Se connecter', 'Начать бесплатно': 'Commencer gratuitement', 'Создать аккаунт': 'Créer un compte', 'Открыть доску': 'Ouvrir le tableau', 'Настройки': 'Paramètres', 'Тарифы': 'Offres', 'Рабочая доска': 'Tableau des tâches', 'Моя доска': 'Mon tableau', '+ Колонка': '+ Colonne', '+ Добавить задачу': '+ Ajouter une tâche', 'Изменить': 'Modifier', 'Удалить': 'Supprimer', 'Регистрация': 'Inscription', 'Вход': 'Connexion', 'Ник / имя': 'Nom', 'Пароль': 'Mot de passe', 'Email': 'Email', 'Дизайн': 'Design', 'Система': 'Système', 'Сохранить дизайн': 'Enregistrer le design', 'Сбросить дизайн': 'Réinitialiser le design',
    'Базовый': 'Basique', 'Продвинутый': 'Pro', 'Максимум': 'Maximum', 'Популярный': 'Populaire', 'Текущий тариф': 'Offre actuelle', 'Выбрать': 'Choisir', 'Доска задач, которая выглядит серьёзно и работает просто.': 'Un tableau de tâches professionnel et simple.', 'DUT помогает разложить задачи по колонкам, следить за дедлайнами и постепенно открывать продвинутые функции через подписку.': 'DUT aide à organiser les tâches en colonnes, suivre les échéances et débloquer des fonctions avancées par abonnement.', 'Пример доски': 'Exemple de tableau', 'ЗАДАЧИ': 'À faire', 'В процессе': 'En cours', 'Выполнено': 'Terminé', 'Лендинг DUT': 'Landing DUT',
    'Создай аккаунт DUT и получи базовую доску бесплатно.': 'Crée un compte DUT et obtiens un tableau de base gratuit.', 'Войди, чтобы открыть свою доску DUT.': 'Connecte-toi pour ouvrir ton tableau DUT.', 'Твой ник': 'Ton nom', 'Минимум 6 символов': 'Minimum 6 caractères', 'Уже есть аккаунт?': 'Déjà un compte ?', 'Нет аккаунта?': 'Pas de compte ?', 'Зарегистрироваться': "S'inscrire", 'Привет, {name}. Двигай задачи между колонками и следи за сроками.': 'Bonjour, {name}. Déplace les tâches entre les colonnes et suis les échéances.',
    'Редактировать колонку': 'Modifier la colonne', 'Удалить колонку': 'Supprimer la colonne', 'Старт': 'Début', 'Дедлайн': 'Échéance', 'Просрочено': 'En retard', 'Изменить задачу': 'Modifier la tâche', 'Новая задача': 'Nouvelle tâche', 'Название': 'Titre', 'Описание': 'Description', 'Дата и время старта': 'Date et heure de début', 'Дата и время дедлайна': "Date et heure d'échéance", 'Цветовая метка задачи': 'Étiquette couleur', 'Метка': 'Étiquette', 'Отмена': 'Annuler', 'Сохранить': 'Enregistrer', 'Новая колонка': 'Nouvelle colonne', 'Изменить колонку': 'Modifier la colonne', 'Название колонки': 'Titre de colonne', 'Цвет колонки': 'Couleur de colonne',
    'Дальше': 'Suite', 'Управление аккаунтом': 'Gestion du compte', 'ТАРИФ': 'OFFRE', 'НАСТРОЙКИ': 'PARAMÈTRES', 'Открыть тарифы →': 'Ouvrir les offres →', 'Открыть настройки →': 'Ouvrir les paramètres →', 'Ник': 'Nom', 'Почта': 'Email', 'Аккаунт создан': 'Compte créé', 'Всего задач': 'Total des tâches', 'Колонок на доске': 'Colonnes', 'Подписка': 'Abonnement', 'Выбери уровень доступа': 'Choisis le niveau d’accès', 'Текущий': 'Actuel',
    'Пресеты': 'Préréglages', 'Готовые стили': 'Styles prêts', 'Основа сайта': 'Base du site', 'Карточки и блоки': 'Cartes et blocs', 'Кнопки и поля': 'Boutons et champs', 'Доска и задачи': 'Tableau et tâches', 'Акцентный цвет': "Couleur d'accent", 'Фон сайта': 'Fond du site', 'Шрифт': 'Police', 'Размер текста': 'Taille du texte', 'Контраст интерфейса': 'Contraste de l’interface', 'Проверка изменений': 'Aperçu des changements', 'Скрыть': 'Masquer', 'Показать': 'Afficher', 'Кнопка': 'Bouton', 'Пример поля': 'Champ exemple', 'Карточка': 'Carte', 'Панель': 'Panneau', 'Тег': 'Tag', 'Кнопки': 'Boutons', 'Поле': 'Champ', 'Карточка задачи': 'Carte de tâche', 'Готово': 'Terminé', 'Случайный стиль': 'Style aléatoire',
    'Язык': 'Langue', 'Перевод и формат': 'Traduction et format', 'Язык интерфейса': 'Langue de l’interface', 'Формат даты': 'Format de date', 'Формат времени': 'Format horaire', 'Первый день недели': 'Premier jour de la semaine', 'Поведение': 'Comportement', 'Работа сервиса': 'Fonctionnement du service', 'Автосохранение': 'Enregistrement auto', 'Подтверждение удаления': 'Confirmation de suppression', 'Стартовая страница': 'Page de démarrage', 'Меньше анимаций': 'Moins d’animations', 'Уведомления': 'Notifications', 'Напоминания': 'Rappels', 'Тип уведомлений': 'Type de notification', 'Напоминать о дедлайне': 'Rappel d’échéance', 'Звуки интерфейса': 'Sons de l’interface', 'Сохранить системные настройки': 'Enregistrer les paramètres système', 'Данные профиля обновлены.': 'Données du profil mises à jour.', 'Дизайн сброшен к базовому виду.': 'Design réinitialisé au style de base.', 'Дизайн сайта сохранён.': 'Design du site enregistré.', 'Системные настройки сохранены.': 'Paramètres système enregistrés.', 'Тариф изменён на {plan}.': 'Offre changée en {plan}.',
    'Готовая палитра под язык': 'Palette selon la langue', 'Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.': 'La palette change automatiquement selon la langue de l’interface. Le choix manuel reste disponible.', 'Свой цвет': 'Couleur personnalisée', 'Французская палитра': 'Palette française', 'Французский синий': 'Bleu français', 'Белый': 'Blanc', 'Красный': 'Rouge', 'Лавандовый': 'Lavande', 'Бордо': 'Bordeaux', 'Шампань': 'Champagne'
  }
};


const v21TranslationPatch = {
  en: {'Жидкое стекло': 'Liquid glass', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': 'Premium iPhone-style liquid glass with lens highlights, depth and soft transparency.'},
  nl: {'Жидкое стекло': 'Vloeibaar glas', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': 'Premium iPhone-stijl: vloeibaar glas, lensglans, diepte en zachte transparantie.'},
  ar: {'Жидкое стекло': 'زجاج سائل', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': 'أسلوب فاخر يشبه iPhone: زجاج سائل ولمعان عدسة وعمق وشفافية ناعمة.'},
  es: {'Жидкое стекло': 'Vidrio líquido', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': 'Estilo premium tipo iPhone: vidrio líquido, brillos de lente, profundidad y transparencia suave.'},
  zh: {'Жидкое стекло': '液态玻璃', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': '类似 iPhone 的高级液态玻璃风格：镜头高光、层次和柔和透明感。'},
  fr: {'Жидкое стекло': 'Verre liquide', 'Liquid Glass iPhone': 'Liquid Glass iPhone', 'Жидкое стекло с мягкими бликами и глубиной.': 'Style premium façon iPhone : verre liquide, reflets de lentille, profondeur et transparence douce.'}
};
Object.entries(v21TranslationPatch).forEach(([language, labels]) => {
  translations[language] = { ...(translations[language] || {}), ...labels };
});


const v22TranslationPatch = {
  en: {
    'Главная': 'Home', 'Качество UX': 'UX quality', 'Помощь': 'Help', 'Контакты': 'Contacts', 'К содержанию': 'Skip to content', 'Основная навигация': 'Primary navigation', 'Конфиденциальность': 'Privacy', 'Правила сервиса': 'Service rules', 'Карта сайта': 'Sitemap',
    'Коммерческий SaaS для задач': 'Commercial task SaaS', 'DUT — сервис управления задачами с понятной подписочной моделью.': 'DUT is a task service with a clear subscription model.', 'Собери задачи в понятную систему, а не в хаос заметок.': 'Turn scattered notes into a clear task system.', 'Пользователь быстро понимает предложение, регистрируется, создаёт задачи и видит ценность платных тарифов без лишних действий.': 'Users understand the offer, sign up, create tasks and see paid-plan value without unnecessary steps.', 'Попробовать бесплатно': 'Try for free', 'Смотреть тарифы': 'View plans', 'Открыть рабочую доску': 'Open workspace', 'Целевое действие': 'Target action', 'регистрация и переход на тариф': 'registration and plan upgrade', '3 клика': '3 clicks', 'до важных разделов': 'to key sections', 'прозрачная монетизация': 'transparent monetization',
    'Почему интерфейс выглядит как настоящий продукт': 'Why the interface feels like a real product', 'Структура, доверие, адаптивность и понятные состояния заложены прямо в интерфейс.': 'Structure, trust, responsiveness and clear states are built into the interface.', 'Быстрый старт': 'Fast start', 'Регистрация занимает минимум действий, а после входа пользователь сразу попадает к доске.': 'Sign-up takes minimal effort and users go straight to the board.', 'Коммерческий путь': 'Commercial journey', 'Путь ведёт от главного экрана к регистрации, доске задач и тарифам Pro/Max.': 'The journey leads from the landing page to sign-up, the board and Pro/Max plans.', 'Контроль ошибок': 'Error control', 'Формы проверяют данные, а система показывает понятные сообщения и пустые состояния.': 'Forms validate data and the system shows clear messages and empty states.', 'Адаптивный UI': 'Adaptive UI', 'Макеты читаются на desktop, tablet и mobile без потери ключевых действий.': 'Layouts stay readable on desktop, tablet and mobile without hiding key actions.',
    'Как пользователь достигает цели': 'How the user reaches the goal', 'Путь сделан линейным там, где нужна конверсия, и иерархическим там, где нужна навигация.': 'The path is linear for conversion and hierarchical for navigation.', 'Понимает ценность': 'Understands value', 'На главной странице видит пользу, тарифы и доверительные элементы.': 'On the landing page users see value, plans and trust elements.', 'Создаёт аккаунт': 'Creates account', 'Заполняет короткую форму и получает базовую доску бесплатно.': 'Fills in a short form and gets a basic board for free.', 'Работает с задачами': 'Works with tasks', 'Создаёт карточки, двигает их по колонкам и видит статусы сроков.': 'Creates cards, moves them across columns and sees deadline states.', 'Переходит на тариф': 'Upgrades plan', 'Платные функции показаны как естественное расширение сценария.': 'Paid features are shown as a natural extension of the workflow.',
    'Доверие к сервису': 'Trust signals', 'Что должно быть на коммерческом сайте, чтобы к нему не придрались.': 'What a commercial site needs to look complete.', 'Приватность данных': 'Data privacy', 'Пароль хранится в виде хэша, сессия защищена cookie-токеном.': 'Passwords are hashed and sessions use a cookie token.', 'Понятная поддержка': 'Clear support', 'Есть страница помощи, контакты и объяснение ограничений тарифов.': 'There is a help page, contacts and plan-limit explanations.', 'Единая дизайн-система': 'Unified design system', 'Кнопки, карточки, формы, состояния и отступы работают по одним правилам.': 'Buttons, cards, forms, states and spacing follow the same rules.', 'Можно ли пользоваться бесплатно?': 'Can I use it for free?', 'Да. Free-тариф даёт базовую доску и стандартные колонки.': 'Yes. The Free plan provides a basic board and standard columns.', 'Зачем нужен Pro?': 'Why Pro?', 'Pro открывает дедлайны, время и дополнительные колонки для контроля задач.': 'Pro unlocks deadlines, time fields and extra columns for better control.', 'Зачем нужен Max?': 'Why Max?', 'Max добавляет неограниченные колонки и цветовые метки задач, включая палитры по языку.': 'Max adds unlimited columns and task color labels, including language-based palettes.', 'Готов начать?': 'Ready to start?', 'Создай аккаунт и проверь полный путь: главная → регистрация → доска → тариф.': 'Create an account and test the full path: landing → sign-up → board → plan.',
    'Поиск задач': 'Task search', 'Найти по названию или описанию': 'Search by title or description', 'Фильтр': 'Filter', 'Все задачи': 'All tasks', 'Просроченные': 'Overdue', 'С дедлайном': 'With deadline', 'С меткой': 'With label', 'Выполненные': 'Done', 'Применить': 'Apply', 'Сбросить': 'Reset', 'Всего': 'Total', 'Найдено': 'Found', 'Готово': 'Done', 'Скоро/просрочено': 'Due/overdue', 'Здесь пока нет задач': 'No tasks here yet', 'Создай первую задачу или перенеси карточку из другой колонки.': 'Create the first task or move a card from another column.', 'По текущему фильтру задач нет': 'No tasks match the current filter', 'Измени поиск или сбрось фильтр, чтобы увидеть карточки.': 'Change search or reset the filter to see cards.', 'Дата старта не может быть позже дедлайна.': 'Start date cannot be later than the deadline.',
    'Публичная версия тарифов': 'Public plan overview', 'Перейти к регистрации': 'Continue to sign up', 'Центр помощи DUT': 'DUT help center', 'Короткие ответы для пользователя и проверяющего.': 'Short answers for users and reviewers.', 'Как создать задачу?': 'How do I create a task?', 'Открой доску и нажми кнопку добавления в нужной колонке. На Pro можно добавить сроки, на Max — цветовую метку.': 'Open the board and add a task in the needed column. Pro adds dates, Max adds color labels.', 'Как проверить тарифы?': 'How do I test plans?', 'Открой страницу тарифов в профиле или публичную страницу тарифов. Выбор тарифа сразу меняет доступные функции.': 'Open plans in the profile or public plans page. Choosing a plan immediately changes available features.', 'Как сменить язык?': 'How do I change language?', 'Открой настройки системы, выбери язык и сохрани. Интерфейс и палитры задач обновятся сразу.': 'Open system settings, choose a language and save. UI and task palettes update immediately.', 'Что делать при ошибке?': 'What if an error happens?', 'Сообщение показывается человеческим языком. Пользователь может исправить данные или вернуться на предыдущий шаг.': 'Messages are human-readable. The user can fix data or go back.',
    'Связаться с поддержкой': 'Contact support', 'Форма демонстрационная: она показывает сценарий обращения и сохраняет заявку на backend.': 'Demo form: it shows the support request flow.', 'Ваше имя': 'Your name', 'Тема обращения': 'Subject', 'Сообщение': 'Message', 'Отправить обращение': 'Send request', 'Обращение сохранено на сервере. В рабочем продукте оно ушло бы в поддержку.': 'Request saved on the server. In a real product it would go to support.', 'Я согласен на обработку обращения': 'I agree to processing this request.', 'Я принимаю правила сервиса и политику конфиденциальности': 'I accept the service rules and privacy policy.', 'Политика конфиденциальности': 'Privacy policy', 'Правила использования': 'Terms of service', 'Страница не найдена': 'Page not found', 'Такого раздела нет или ссылка устарела.': 'This section does not exist or the link is outdated.', 'Вернуться на главную': 'Back to home',
    'Качество проекта': 'Project quality', 'Методика проектирования': 'Design methodology', 'Эта страница показывает, что сайт собран не как набор экранов, а как коммерческий веб-продукт с UX/UI-логикой.': 'This page shows that the site is built as a commercial web product with UX/UI logic.', 'Информационная архитектура': 'Information architecture', 'Гибридная структура: лендинг ведёт линейно к регистрации, личный кабинет устроен иерархически, а настройки и тарифы связаны сетевыми переходами.': 'Hybrid structure: landing is linear, the account is hierarchical, and settings/plans are connected.', 'Графический дизайн UI': 'Graphic UI design', 'Сетка, визуальная иерархия, единые карточки, читабельные шрифты и управляемые акцентные цвета.': 'Grid, visual hierarchy, consistent cards, readable fonts and controlled accent colors.', 'Юзабилити-тестирование': 'Usability testing', 'Для проверки предусмотрены тестовые задания, метрики времени, ошибок, отклонений и повторная проверка после исправлений.': 'Testing includes tasks, time, errors, deviations and retesting after fixes.'
  },
  nl: {'Главная':'Home','Качество UX':'UX-kwaliteit','Помощь':'Hulp','Контакты':'Contact','Конфиденциальность':'Privacy','Правила сервиса':'Servicevoorwaarden','Поиск задач':'Taken zoeken','Фильтр':'Filter','Все задачи':'Alle taken','Просроченные':'Te laat','С дедлайном':'Met deadline','С меткой':'Met label','Выполненные':'Klaar','Применить':'Toepassen','Сбросить':'Resetten'},
  ar: {'Главная':'الرئيسية','Качество UX':'جودة UX','Помощь':'المساعدة','Контакты':'التواصل','Конфиденциальность':'الخصوصية','Правила сервиса':'قواعد الخدمة','Поиск задач':'بحث المهام','Фильтр':'تصفية','Все задачи':'كل المهام','Просроченные':'متأخرة','С дедлайном':'بموعد نهائي','С меткой':'بوسم','Выполненные':'منجزة','Применить':'تطبيق','Сбросить':'إعادة'},
  es: {'Главная':'Inicio','Качество UX':'Calidad UX','Помощь':'Ayuda','Контакты':'Contactos','Конфиденциальность':'Privacidad','Правила сервиса':'Reglas del servicio','Поиск задач':'Buscar tareas','Фильтр':'Filtro','Все задачи':'Todas','Просроченные':'Vencidas','С дедлайном':'Con fecha límite','С меткой':'Con etiqueta','Выполненные':'Completadas','Применить':'Aplicar','Сбросить':'Restablecer'},
  zh: {'Главная':'首页','Качество UX':'UX 质量','Помощь':'帮助','Контакты':'联系','Конфиденциальность':'隐私','Правила сервиса':'服务规则','Поиск задач':'搜索任务','Фильтр':'筛选','Все задачи':'全部任务','Просроченные':'逾期','С дедлайном':'有截止日期','С меткой':'有标签','Выполненные':'已完成','Применить':'应用','Сбросить':'重置'},
  fr: {'Главная':'Accueil','Качество UX':'Qualité UX','Помощь':'Aide','Контакты':'Contacts','Конфиденциальность':'Confidentialité','Правила сервиса':'Règles du service','Поиск задач':'Rechercher','Фильтр':'Filtre','Все задачи':'Toutes','Просроченные':'En retard','С дедлайном':'Avec échéance','С меткой':'Avec étiquette','Выполненные':'Terminées','Применить':'Appliquer','Сбросить':'Réinitialiser'}
};
Object.entries(v22TranslationPatch).forEach(([language, labels]) => {
  translations[language] = { ...(translations[language] || {}), ...labels };
});


const v26TranslationPatch = {

  en: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': 'Organize tasks, projects and study work in one workspace',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'DUT helps you create a workspace quickly, organize tasks into columns and enable advanced features only when you truly need them.',

    'Тарифы под разные задачи': 'Plans for different tasks',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': 'Start free and add advanced features only when you need them.',

    'Жидкое стекло с мягкими бликами и глубиной.': 'Liquid glass with soft highlights and depth.'

  },

  nl: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': 'Organiseer taken, projecten en studie in één werkruimte',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'DUT helpt je snel een werkbord te maken, taken in kolommen te ordenen en extra functies pas te gebruiken wanneer je ze nodig hebt.',

    'Тарифы под разные задачи': 'Abonnementen voor verschillende taken',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': 'Begin gratis en voeg geavanceerde functies alleen toe wanneer dat nodig is.',

    'Жидкое стекло с мягкими бликами и глубиной.': 'Vloeibaar glas met zachte highlights en diepte.'

  },

  ar: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': 'نظّم المهام والمشاريع والدراسة في مساحة واحدة',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'يساعدك DUT على إنشاء لوحة عمل بسرعة، وترتيب المهام في أعمدة، وتفعيل الميزات المتقدمة فقط عند الحاجة إليها.',

    'Тарифы под разные задачи': 'خطط تناسب مهام مختلفة',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': 'ابدأ مجانًا وأضف الميزات المتقدمة عند الحاجة فقط.',

    'Жидкое стекло с мягкими бликами и глубиной.': 'زجاج سائل بلمسات ضوء ناعمة وعمق.'

  },

  es: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': 'Organiza tareas, proyectos y estudios en un solo espacio',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'DUT te ayuda a crear un tablero rápidamente, ordenar tareas por columnas y activar funciones avanzadas solo cuando realmente las necesitas.',

    'Тарифы под разные задачи': 'Planes para distintas tareas',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': 'Empieza gratis y añade funciones avanzadas solo cuando las necesites.',

    'Жидкое стекло с мягкими бликами и глубиной.': 'Cristal líquido con brillos suaves y profundidad.'

  },

  zh: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': '在一个工作区管理任务、项目和学习事项',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'DUT 可帮助你快速创建工作看板，将任务按列整理，并只在真正需要时启用高级功能。',

    'Тарифы под разные задачи': '适合不同任务的套餐',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': '免费开始，仅在需要时添加高级功能。',

    'Жидкое стекло с мягкими бликами и глубиной.': '带柔和高光与层次感的液态玻璃。'

  },

  fr: {

    'Организуй задачи, проекты и учебные дела в одном пространстве': 'Organise les tâches, projets et études dans un seul espace',

    'DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.': 'DUT aide à créer rapidement un tableau, à organiser les tâches en colonnes et à activer les fonctions avancées seulement quand elles sont utiles.',

    'Тарифы под разные задачи': 'Des offres pour différents besoins',

    'Начни бесплатно, а расширенные возможности подключай только при необходимости.': 'Commence gratuitement et ajoute les fonctions avancées uniquement si nécessaire.',

    'Жидкое стекло с мягкими бликами и глубиной.': 'Verre liquide avec reflets doux et profondeur.'

  }

};

Object.entries(v26TranslationPatch).forEach(([language, labels]) => {

  translations[language] = { ...(translations[language] || {}), ...labels };

});


function tr(value, replacements = {}) {
  const lang = currentSystem().language;
  let result = lang === 'ru' ? value : (translations[lang]?.[value] || translations.en?.[value] || value);
  Object.entries(replacements || {}).forEach(([key, replacement]) => {
    result = result.replaceAll(`{${key}}`, String(replacement));
  });
  return result;
}

function trOptionMap(options = {}) {
  return Object.fromEntries(Object.entries(options).map(([key, label]) => [key, tr(label)]));
}


const systemLabels = {
  language: { en: 'English', nl: 'Nederlands', ar: 'العربية', es: 'Español', zh: '中文', ru: 'Русский', fr: 'Français' },
  dateFormat: { ru: '27.04.2026', iso: '2026-04-27', us: '04/27/2026' },
  timeFormat: { '24h': '24 часа', '12h': '12 часов' },
  firstDay: { monday: 'Понедельник', sunday: 'Воскресенье' },
  autosave: { on: 'Включено', off: 'Выключено' },
  notifications: { off: 'Выключены', browser: 'Браузерные уведомления' },
  deadlineReminder: { none: 'Не напоминать', hour: 'За 1 час', day: 'За 1 день', week: 'За неделю' },
  confirmDelete: { on: 'Спрашивать подтверждение', off: 'Удалять сразу' },
  startPage: { dashboard: 'Открывать доску', profile: 'Открывать профиль' },
  sound: { off: 'Без звуков', soft: 'Мягкие звуки' },
  reducedMotion: { off: 'Обычные анимации', on: 'Минимум анимаций' }
};

const designPresets = [
  { id: 'dut', title: 'DUT базовый', description: 'Мягкая светлая тема для проекта.', settings: { theme: 'pastel', accent: '#2563eb', background: 'soft', surface: 'glass', buttonStyle: 'solid', inputStyle: 'default', columnStyle: 'glass', taskStyle: 'clean', headerStyle: 'glass', shadows: 'soft', radius: 'rounded', density: 'comfortable', font: 'system', cardTone: 'standard', contrast: 'normal', glassPower: 'medium', accentMode: 'normal', columnColorMode: 'soft' } },
  { id: 'night', title: 'Night Focus', description: 'Тёмный режим для работы вечером.', settings: { theme: 'dark', accent: '#60a5fa', background: 'mesh', surface: 'solid', buttonStyle: 'solid', inputStyle: 'soft', columnStyle: 'solid', taskStyle: 'filled', headerStyle: 'minimal', shadows: 'soft', radius: 'rounded', density: 'comfortable', font: 'modern', cardTone: 'deep', contrast: 'high', glassPower: 'low', accentMode: 'bright', columnColorMode: 'off' } },
  { id: 'clean', title: 'Clean Business', description: 'Строго, чисто, без лишнего шума.', settings: { theme: 'light', accent: '#111827', background: 'plain', surface: 'clean', buttonStyle: 'outline', inputStyle: 'default', columnStyle: 'bordered', taskStyle: 'outlined', headerStyle: 'minimal', shadows: 'none', radius: 'sharp', density: 'compact', font: 'strict', cardTone: 'contrast', contrast: 'high', glassPower: 'low', accentMode: 'calm', columnColorMode: 'off' } },
  { id: 'aqua', title: 'Aqua Glass', description: 'Стекло, голубой акцент и лёгкий фон.', settings: { theme: 'pastel', accent: '#06b6d4', background: 'gradient', surface: 'glass', buttonStyle: 'soft', inputStyle: 'soft', columnStyle: 'glass', taskStyle: 'clean', headerStyle: 'glass', shadows: 'soft', radius: 'pill', density: 'spacious', font: 'modern', cardTone: 'standard', contrast: 'soft', glassPower: 'high', accentMode: 'normal', columnColorMode: 'soft' } },
  { id: 'liquid', title: 'Liquid Glass iPhone', description: 'Жидкое стекло с мягкими бликами и глубиной.', settings: { theme: 'pastel', accent: '#0a84ff', background: 'mesh', surface: 'liquid', buttonStyle: 'pill', inputStyle: 'soft', columnStyle: 'glass', taskStyle: 'clean', headerStyle: 'glass', shadows: 'strong', radius: 'pill', density: 'comfortable', font: 'system', cardTone: 'standard', contrast: 'normal', glassPower: 'high', accentMode: 'bright', columnColorMode: 'visible', hoverEffect: 'glow', animations: 'smooth', boardGap: 'wide', taskSize: 'medium' } },
  { id: 'dev', title: 'Dev Compact', description: 'Компактная техническая тема для плотной работы.', settings: { theme: 'dark', accent: '#10b981', background: 'grid', surface: 'solid', buttonStyle: 'pill', inputStyle: 'underline', columnStyle: 'minimal', taskStyle: 'minimal', headerStyle: 'minimal', shadows: 'none', radius: 'sharp', density: 'compact', font: 'mono', cardTone: 'deep', contrast: 'high', glassPower: 'low', accentMode: 'bright', columnColorMode: 'off' } }
];


const taskColorPalettes = {
  ru: {
    title: 'Русская палитра',
    country: 'Россия / СНГ',
    colors: [
      { name: 'Лазурный', value: '#2563eb' },
      { name: 'Белый', value: '#f8fafc' },
      { name: 'Алый', value: '#dc2626' },
      { name: 'Берёзовый', value: '#22c55e' },
      { name: 'Северная ночь', value: '#0f172a' }
    ]
  },
  en: {
    title: 'Английская палитра',
    country: 'USA / UK',
    colors: [
      { name: 'Королевский синий', value: '#2563eb' },
      { name: 'Изумрудный', value: '#059669' },
      { name: 'Вишнёвый', value: '#be123c' },
      { name: 'Лавандовый', value: '#7c3aed' },
      { name: 'Графит', value: '#1f2937' }
    ]
  },
  nl: {
    title: 'Нидерландская палитра',
    country: 'Nederland',
    colors: [
      { name: 'Оранжевый', value: '#f97316' },
      { name: 'Королевский синий', value: '#2563eb' },
      { name: 'Тюльпан', value: '#e11d48' },
      { name: 'Морская волна', value: '#0f766e' },
      { name: 'Кремовый', value: '#fff7ed' }
    ]
  },
  ar: {
    title: 'Арабская палитра',
    country: 'MENA',
    colors: [
      { name: 'Зелёный', value: '#15803d' },
      { name: 'Золото', value: '#d97706' },
      { name: 'Красный', value: '#dc2626' },
      { name: 'Чёрный', value: '#111827' },
      { name: 'Бирюза', value: '#0891b2' }
    ]
  },
  es: {
    title: 'Испанская палитра',
    country: 'España / LATAM',
    colors: [
      { name: 'Красный', value: '#c1121f' },
      { name: 'Золото', value: '#f59e0b' },
      { name: 'Солнечный', value: '#f97316' },
      { name: 'Олива', value: '#65a30d' },
      { name: 'Маджента', value: '#db2777' }
    ]
  },
  zh: {
    title: 'Китайская палитра',
    country: '中国',
    colors: [
      { name: 'Императорский красный', value: '#dc2626' },
      { name: 'Золото', value: '#f59e0b' },
      { name: 'Нефритовый', value: '#16a34a' },
      { name: 'Синий фарфор', value: '#2563eb' },
      { name: 'Розовый', value: '#ec4899' }
    ]
  },
  fr: {
    title: 'Французская палитра',
    country: 'France',
    colors: [
      { name: 'Французский синий', value: '#1d4ed8' },
      { name: 'Белый', value: '#f8fafc' },
      { name: 'Красный', value: '#e11d48' },
      { name: 'Лавандовый', value: '#8b5cf6' },
      { name: 'Бордо', value: '#7f1d1d' }
    ]
  }
};

function currentTaskPalette() {
  return taskColorPalettes[currentSystem().language] || taskColorPalettes.ru;
}

function renderTaskPalette(selectedColor = '#6366f1') {
  const palette = currentTaskPalette();
  return `
    <div class="task-palette-panel">
      <div class="task-palette-head">
        <div>
          <strong>${escapeHtml(tr('Готовая палитра под язык'))}</strong>
          <span>${escapeHtml(tr(palette.title))} · ${escapeHtml(palette.country)}</span>
        </div>
        <span class="palette-language-badge">${escapeHtml((systemLabels.language[currentSystem().language] || currentSystem().language))}</span>
      </div>
      <div class="task-color-grid">
        ${palette.colors.map((color) => `
          <button type="button" class="task-color-preset ${String(selectedColor).toLowerCase() === color.value.toLowerCase() ? 'active' : ''}" data-color="${escapeHtml(color.value)}" style="--task-preset:${escapeHtml(color.value)}" title="${escapeHtml(tr(color.name))}">
            <span></span><b>${escapeHtml(tr(color.name))}</b>
          </button>
        `).join('')}
      </div>
      <p class="task-palette-note">${escapeHtml(tr('Палитра меняется автоматически в зависимости от языка интерфейса. Ручной выбор цвета тоже остаётся доступным.'))}</p>
    </div>
  `;
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeDesign(settings = {}) {
  return { ...defaultDesign, ...(settings || {}) };
}

function getStoredDesign() {
  try {
    return normalizeDesign(JSON.parse(localStorage.getItem('dut_design') || '{}'));
  } catch {
    return { ...defaultDesign };
  }
}

function normalizeSystem(settings = {}) {
  const merged = { ...defaultSystem, ...(settings || {}) };
  const allowedLanguages = ['en', 'nl', 'ar', 'es', 'zh', 'ru', 'fr'];
  if (!allowedLanguages.includes(merged.language)) merged.language = 'ru';
  return merged;
}

function getStoredSystem() {
  try { return normalizeSystem(JSON.parse(localStorage.getItem('dut_system') || '{}')); }
  catch { return { ...defaultSystem }; }
}


function isMobileLikeDevice() {
  return window.matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
}

function setMobilePerformanceFlags() {
  const root = document.documentElement;
  const mobileLike = isMobileLikeDevice();
  root.setAttribute('data-mobile-performance', mobileLike ? 'on' : 'off');
  root.setAttribute('data-coarse-pointer', window.matchMedia('(pointer: coarse)').matches ? 'on' : 'off');
}

function isMobileRendering() {
  return document.documentElement.dataset.mobilePerformance === 'on' || isMobileLikeDevice();
}

function applySystemSettings(settings = {}) {
  const system = normalizeSystem(settings);
  const root = document.documentElement;
  Object.entries(system).forEach(([key, value]) => {
    const dataKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    root.setAttribute(`data-${dataKey}`, String(value));
  });
  root.setAttribute('lang', system.language);
  root.setAttribute('dir', system.language === 'ar' ? 'rtl' : 'ltr');
  root.setAttribute('data-dir', system.language === 'ar' ? 'rtl' : 'ltr');
  setMobilePerformanceFlags();
  try { localStorage.setItem('dut_system', JSON.stringify(system)); } catch {}
}

function currentSystem() {
  return normalizeSystem(state.user?.systemSettings || getStoredSystem());
}

function getContrastColor(hex) {
  const fallback = '#ffffff';
  const value = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return fallback;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? '#0f172a' : '#ffffff';
}

function hexToRgb(hex) {
  const value = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return '37, 99, 235';
  return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`;
}

function getAccentLuminance(hex) {
  const value = String(hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return .35;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function getReadableAccent(hex, theme) {
  const luminance = getAccentLuminance(hex);
  if (theme === 'dark' && luminance < .28) return '#ffffff';
  if (theme !== 'dark' && luminance > .72) return '#0f172a';
  return hex;
}

function applyVisualSettings(settings = {}) {
  const design = normalizeDesign(settings);
  const root = document.documentElement;
  const datasetKeys = ['theme','background','font','textSize','density','radius','shadows','surface','borders','buttonStyle','inputStyle','taskStyle','taskSize','columnStyle','columnHeader','boardWidth','boardGap','columnHeight','hoverEffect','animations','dragAnimation','headerStyle','controlSize','cardTone','contrast','glassPower','accentMode','columnColorMode'];
  datasetKeys.forEach((key) => {
    const dataKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    root.setAttribute(`data-${dataKey}`, String(design[key] ?? ''));
  });
  const accent = design.accent || defaultDesign.accent;
  const rgb = hexToRgb(accent);
  root.style.setProperty('--primary', accent);
  root.style.setProperty('--primary-rgb', rgb);
  root.style.setProperty('--primary-soft', `rgba(${rgb}, .12)`);
  root.style.setProperty('--primary-contrast', getContrastColor(accent));
  root.style.setProperty('--primary-readable', getReadableAccent(accent, design.theme));
  setMobilePerformanceFlags();
  try { localStorage.setItem('dut_design', JSON.stringify(design)); } catch {}
}

function currentDesign() {
  return normalizeDesign(state.user?.designSettings || getStoredDesign());
}

function navigate(path) {
  history.pushState({}, '', path);
  renderRoute();
}

function openSidebar() {
  document.body.classList.add('sidebar-open');
  const sidebar = document.getElementById('siteSidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const toggle = document.querySelector('[data-sidebar-open]');
  if (sidebar) sidebar.setAttribute('aria-hidden', 'false');
  if (overlay) overlay.hidden = false;
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const sidebar = document.getElementById('siteSidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const toggle = document.querySelector('[data-sidebar-open]');
  if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
  if (overlay) overlay.hidden = true;
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}


const liquidGlassSelector = [
  '.topbar', '.hero-card', '.hero-preview', '.auth-card', '.profile-card', '.price-card',
  '.profile-main-card', '.profile-next-section', '.column', '.task-card', '.modal',
  '.settings-section', '.tariffs-headline', '.design-bottom-bar', '.live-preview',
  '.preview-sample-card', '.preset-card', '.mini-column', '.mini-task', '.profile-button',
  '.preview-column', '.preview-task', '.task-palette-panel', '.task-color-preset',
  '.task-color-meta', '.task-color-swatch', '.add-task-zone', '.icon-btn', '.site-footer', '.nav-link', '.chat-sidebar', '.support-chat-panel', '.support-chat-toggle', '.sidebar-toggle', '.sidebar-note', '.feature-card', '.process-step', '.faq-card', '.landing-cta', '.board-toolbar', '.empty-state', '.info-page', '.contact-card', '.legal-card', '.method-card', '.sitemap-card'
].join(',');

let liquidPointerFrame = 0;
let liquidPointerEvent = null;

function updateLiquidGlassPointer(event) {
  const root = document.documentElement;
  if (root.dataset.surface !== 'liquid' || root.dataset.animations === 'none' || root.dataset.reducedMotion === 'on') return;
  if (root.dataset.mobilePerformance === 'on' || event.pointerType !== 'mouse') return;
  liquidPointerEvent = event;
  if (liquidPointerFrame) return;
  liquidPointerFrame = window.requestAnimationFrame(() => {
    liquidPointerFrame = 0;
    const currentEvent = liquidPointerEvent;
    if (!currentEvent) return;
    const panel = currentEvent.target.closest?.(liquidGlassSelector);
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((currentEvent.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((currentEvent.clientY - rect.top) / rect.height) * 100));
    panel.style.setProperty('--glass-x', `${x.toFixed(2)}%`);
    panel.style.setProperty('--glass-y', `${y.toFixed(2)}%`);
  });
}

function resetLiquidGlassPointer(event) {
  const panel = event.target.closest?.(liquidGlassSelector);
  if (!panel || (event.relatedTarget && panel.contains(event.relatedTarget))) return;
  panel.style.removeProperty('--glass-x');
  panel.style.removeProperty('--glass-y');
}

document.addEventListener('pointermove', updateLiquidGlassPointer, { passive: true });
document.addEventListener('pointerout', resetLiquidGlassPointer, { passive: true });
window.addEventListener('resize', () => setMobilePerformanceFlags(), { passive: true });
window.addEventListener('orientationchange', () => setTimeout(setMobilePerformanceFlags, 80), { passive: true });

window.addEventListener('popstate', renderRoute);

document.addEventListener('click', (event) => {
  const openTrigger = event.target.closest('[data-sidebar-open]');
  if (openTrigger) {
    event.preventDefault();
    openSidebar();
    return;
  }

  const closeTrigger = event.target.closest('[data-sidebar-close]');
  if (closeTrigger) {
    event.preventDefault();
    closeSidebar();
    return;
  }

  const supportToggle = event.target.closest('[data-support-toggle]');
  if (supportToggle) {
    event.preventDefault();
    toggleSupportChat();
    return;
  }

  const link = event.target.closest('[data-link]');
  if (!link) return;
  event.preventDefault();
  closeSidebar();
  navigate(link.getAttribute('href'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSidebar();
});

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('#supportForm');
  if (!form) return;
  event.preventDefault();
  const formData = new FormData(form);
  const topic = String(formData.get('topic') || 'Вопрос администратору').trim();
  const message = String(formData.get('message') || '').trim();
  if (!message) {
    state.supportError = 'Введите сообщение';
    updateSupportWidget();
    return;
  }
  state.supportLoading = true;
  state.supportError = '';
  updateSupportWidget();
  try {
    const data = await api('/api/support/thread', { method: 'POST', body: JSON.stringify({ topic, message }) });
    state.supportThread = data.thread || null;
    state.supportLoading = false;
    state.supportOpen = true;
    markSupportRead();
    updateSupportWidget();
    scrollSupportToBottom();
    startSupportPolling();
    form.reset();
  } catch (error) {
    state.supportLoading = false;
    state.supportError = error.message;
    updateSupportWidget();
  }
});

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

async function loadMe() {
  const data = await api('/api/me');
  state.user = data.user;
  applyVisualSettings(state.user?.designSettings || getStoredDesign());
  applySystemSettings(state.user?.systemSettings || getStoredSystem());
  if (state.user) startSupportPolling(); else stopSupportPolling();
  return data.user;
}

async function loadBoard() {
  const data = await api('/api/board');
  state.user = data.user;
  applyVisualSettings(state.user?.designSettings || getStoredDesign());
  applySystemSettings(state.user?.systemSettings || getStoredSystem());
  if (state.user) startSupportPolling(); else stopSupportPolling();
  state.board = data.board;
  state.columns = data.columns;
  state.tasks = data.tasks;
  return data;
}

function dutLogo(className = '') {
  return '<img class="dut-logo ' + className + '" src="/dut-logo-light.png" alt="DUT" decoding="async" draggable="false" />';
}

function brand() {
  return `<a href="${state.user ? '/dashboard' : '/'}" data-link class="brand">${dutLogo('brand-logo')}<span>DUT</span></a>`;
}

function planLabel(planId) {
  const plan = plans.find((item) => item.id === planId);
  return plan ? tr(plan.title) : tr('Базовый');
}

const localizedPlanPrices = {
  ru: { free: '0 ₽', pro: '129 ₽ / мес', max: '219 ₽ / мес' },
  en: { free: '$0', pro: '$1.49 / mo', max: '$2.49 / mo' },
  nl: { free: '€0', pro: '€1,49 / maand', max: '€2,49 / maand' },
  ar: { free: '0 د.إ', pro: '6 د.إ / شهر', max: '10 د.إ / شهر' },
  es: { free: '0 €', pro: '1,49 € / mes', max: '2,49 € / mes' },
  zh: { free: '¥0', pro: '¥12 / 月', max: '¥20 / 月' },
  fr: { free: '0 €', pro: '1,49 € / mois', max: '2,49 € / mois' }
};

function planPrice(planId) {
  const lang = currentSystem().language;
  const fallback = plans.find((item) => item.id === planId)?.price || '';
  return localizedPlanPrices[lang]?.[planId] || localizedPlanPrices.en?.[planId] || fallback;
}

function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const system = currentSystem();
  if (system.dateFormat === 'iso') {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return options.dateOnly ? `${yyyy}-${mm}-${dd}` : `${yyyy}-${mm}-${dd}, ${hh}:${min}`;
  }
  const localeMap = { en: 'en-US', nl: 'nl-NL', ar: 'ar-SA', es: 'es-ES', zh: 'zh-CN', ru: 'ru-RU', fr: 'fr-FR' };
  const locale = system.dateFormat === 'us' ? 'en-US' : (localeMap[system.language] || 'ru-RU');
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: options.dateOnly ? undefined : '2-digit',
    minute: options.dateOnly ? undefined : '2-digit',
    hour12: system.timeFormat === '12h'
  }).format(date);
}

function navLink(href, label) {
  const targetPath = new URL(href, window.location.origin).pathname;
  const path = window.location.pathname;
  const active = targetPath === '/' ? path === '/' : path === targetPath || path.startsWith(`${targetPath}/`);
  return `<a href="${escapeHtml(href)}" data-link class="nav-link ${active ? 'active' : ''}">${escapeHtml(tr(label))}</a>`;
}

function renderTopNav() {
  if (state.user) {
    return `
      ${navLink('/profile/tariffs', 'Тарифы')}
      ${navLink('/profile/settings?tab=system', 'Настройки')}
      ${navLink('/help', 'Помощь')}
      <a href="/profile" data-link class="profile-button"><span class="profile-avatar">${escapeHtml((state.user.name || 'D').slice(0, 1).toUpperCase())}</span><span>${escapeHtml(tr('Профиль'))}</span></a>
    `;
  }
  return `
    ${navLink('/', 'Главная')}
    ${navLink('/pricing', 'Тарифы')}
    ${navLink('/help', 'Помощь')}
    ${navLink('/contact', 'Контакты')}
    <a href="/login" data-link class="btn secondary">${escapeHtml(tr('Войти'))}</a>
    <a href="/register" data-link class="btn">${escapeHtml(tr('Начать бесплатно'))}</a>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer" aria-label="${escapeHtml(tr('Основная навигация'))}">
      <div class="footer-brand">
        ${brand()}
      </div>
      <nav class="footer-links" aria-label="${escapeHtml(tr('Основная навигация'))}">
        <a href="/pricing" data-link>${escapeHtml(tr('Тарифы'))}</a>
        <a href="/privacy" data-link>${escapeHtml(tr('Конфиденциальность'))}</a>
        <a href="/terms" data-link>${escapeHtml(tr('Правила сервиса'))}</a>
        <a href="/sitemap" data-link>${escapeHtml(tr('Карта сайта'))}</a>
      </nav>
    </footer>
  `;
}

function breadcrumbs(items = []) {
  const all = [{ href: '/', label: 'Главная' }, ...items];
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${all.map((item, index) => index < all.length - 1 ? `<a href="${item.href}" data-link>${escapeHtml(tr(item.label))}</a><span>/</span>` : `<b>${escapeHtml(tr(item.label))}</b>`).join('')}</nav>`;
}

function renderSidePanel() {
  const userInitial = state.user ? escapeHtml((state.user.name || 'D').slice(0, 1).toUpperCase()) : '';
  const sideNote = state.user
    ? `${escapeHtml(tr('Быстрый доступ к доске, тарифам и настройкам.'))}`
    : `${escapeHtml(tr('Быстрый доступ к страницам проекта.'))}`;
  return `
    <div class="sidebar-overlay" data-sidebar-close hidden></div>
    <aside class="chat-sidebar" id="siteSidebar" aria-label="${escapeHtml(tr('Боковое меню'))}" aria-hidden="true">
      <div class="sidebar-head">
        ${brand()}
        <button class="sidebar-close" type="button" data-sidebar-close aria-label="${escapeHtml(tr('Закрыть меню'))}">×</button>
      </div>
      <div class="sidebar-user">
        ${state.user ? `<span class="profile-avatar">${userInitial}</span><div><b>${escapeHtml(state.user.name || 'DUT')}</b><small>${escapeHtml(tr('Личный кабинет'))}</small></div>` : `<div><b>${escapeHtml(tr('DUT'))}</b><small>${escapeHtml(tr('Коммерческий веб-сервис задач'))}</small></div>`}
      </div>
      <nav class="sidebar-nav" aria-label="${escapeHtml(tr('Основная навигация'))}">
        ${renderTopNav()}
      </nav>
      <div class="sidebar-note">
        <b>${escapeHtml(tr('Навигация'))}</b>
        <span>${sideNote}</span>
      </div>
    </aside>
  `;
}


function supportThreadMessages() {
  const messages = state.supportThread?.messages || [];
  if (!messages.length) {
    return `<div class="support-empty">${escapeHtml(tr('Здесь появится переписка с администратором. Напиши первый вопрос — он сохранится в админке.'))}</div>`;
  }
  return messages.map((message) => {
    const isAdmin = message.from === 'admin';
    return `<div class="support-message ${isAdmin ? 'admin' : 'user'}">
      <b>${escapeHtml(isAdmin ? tr('Администратор') : tr('Вы'))}</b>
      <p>${escapeHtml(message.text || '')}</p>
      <time>${escapeHtml(formatDate(message.createdAt))}</time>
    </div>`;
  }).join('');
}

function latestAdminMessageId(thread = state.supportThread) {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  const admins = messages.filter((message) => message.from === 'admin');
  return admins.length ? admins[admins.length - 1].id : '';
}

function computeSupportUnread(thread = state.supportThread) {
  const messages = Array.isArray(thread?.messages) ? thread.messages : [];
  if (!messages.length) return 0;
  const seen = state.supportLastSeenAdminMessageId || localStorage.getItem('dut_support_seen_admin_msg') || '';
  const adminMessages = messages.filter((message) => message.from === 'admin');
  if (!seen) return adminMessages.length;
  const index = adminMessages.findIndex((message) => message.id === seen);
  return index < 0 ? adminMessages.length : Math.max(0, adminMessages.length - index - 1);
}

function markSupportRead() {
  const latest = latestAdminMessageId();
  if (!latest) return;
  state.supportLastSeenAdminMessageId = latest;
  state.supportUnread = 0;
  try { localStorage.setItem('dut_support_seen_admin_msg', latest); } catch {}
}

function renderSupportWidgetContent() {
  if (!state.user) return '';
  const thread = state.supportThread;
  const unread = state.supportUnread || 0;
  const statusText = thread?.status === 'answered' ? tr('Есть ответ администратора') : thread?.status === 'closed' ? tr('Обращение закрыто') : tr('Поддержка онлайн');
  return `
    <div class="support-chat ${state.supportOpen ? 'open' : ''}" aria-live="polite">
      ${state.supportOpen ? `<section class="support-chat-panel" role="dialog" aria-label="${escapeHtml(tr('Чат с администратором'))}">
        <header class="support-chat-head">
          <div><strong>${escapeHtml(tr('Чат с администратором'))}</strong><small>${escapeHtml(statusText)}</small></div>
        </header>
        <div class="support-chat-body" id="supportChatBody">
          ${state.supportLoading ? `<div class="support-empty">${escapeHtml(tr('Загрузка...'))}</div>` : supportThreadMessages()}
        </div>
        ${state.supportError ? `<div class="support-error">${escapeHtml(state.supportError)}</div>` : ''}
        <form class="support-chat-form" id="supportForm">
          <input class="input" name="topic" value="${escapeHtml(thread?.topic || tr('Вопрос администратору'))}" placeholder="${escapeHtml(tr('Тема'))}" />
          <textarea class="textarea" name="message" rows="3" placeholder="${escapeHtml(tr('Напишите сообщение администратору'))}" required></textarea>
          <button class="btn" type="submit" ${state.supportLoading ? 'disabled' : ''}>${escapeHtml(tr('Отправить'))}</button>
        </form>
      </section>` : ''}
      <button class="support-chat-toggle" type="button" data-support-toggle aria-expanded="${state.supportOpen ? 'true' : 'false'}">
        <span>${state.supportOpen ? '×' : '?'}</span><b>${escapeHtml(tr('Поддержка'))}</b>${unread ? `<em>${unread > 9 ? '9+' : unread}</em>` : ''}
      </button>
    </div>`;
}

function updateSupportWidget() {
  const mount = document.getElementById('supportWidgetMount');
  if (mount) mount.innerHTML = renderSupportWidgetContent();
}

async function refreshSupportThread(options = {}) {
  if (!state.user) return;
  const silent = Boolean(options.silent);
  if (!silent) {
    state.supportLoading = true;
    state.supportError = '';
    updateSupportWidget();
  }
  try {
    const data = await api('/api/support/thread');
    state.supportThread = data.thread || null;
    state.supportUnread = state.supportOpen ? 0 : computeSupportUnread(state.supportThread);
    if (state.supportOpen) markSupportRead();
  } catch (error) {
    if (!silent) state.supportError = error.message;
  } finally {
    state.supportLoading = false;
    updateSupportWidget();
    scrollSupportToBottom();
  }
}

function scrollSupportToBottom() {
  requestAnimationFrame(() => {
    const body = document.getElementById('supportChatBody');
    if (body) body.scrollTop = body.scrollHeight;
  });
}

function stopSupportPolling() {
  if (supportPollTimer) clearInterval(supportPollTimer);
  supportPollTimer = null;
}

function startSupportPolling() {
  stopSupportPolling();
  if (!state.user) return;
  supportPollTimer = setInterval(() => {
    if (!document.hidden && state.user) refreshSupportThread({ silent: true });
  }, state.supportOpen ? 4500 : 9000);
}

async function toggleSupportChat() {
  if (!state.user) { navigate('/login'); return; }
  state.supportOpen = !state.supportOpen;
  if (state.supportOpen) markSupportRead();
  updateSupportWidget();
  startSupportPolling();
  if (state.supportOpen && !state.supportThread) await refreshSupportThread();
  else if (state.supportOpen) { markSupportRead(); updateSupportWidget(); scrollSupportToBottom(); }
}

async function openSupportChat() {
  if (!state.user) { navigate('/login'); return; }
  if (!state.supportOpen) await toggleSupportChat();
}

function layout(content, options = {}) {
  return `
    <a class="skip-link" href="#content">${escapeHtml(tr('К содержанию'))}</a>
    ${renderSidePanel()}
    <main class="page-shell" id="content" tabindex="-1">
      <header class="topbar">
        <button class="sidebar-toggle" type="button" data-sidebar-open aria-controls="siteSidebar" aria-expanded="false" aria-label="${escapeHtml(tr('Открыть меню'))}">
          <span></span><span></span><span></span>
        </button>
        ${brand()}
        <span class="topbar-fill" aria-hidden="true"></span>
      </header>
      ${options.breadcrumbs || ''}
      ${content}
      ${renderFooter()}
    </main>
    <div id="supportWidgetMount">${renderSupportWidgetContent()}</div>
  `;
}

function featureCard(icon, title, description) {
  return `<article class="feature-card"><span class="feature-icon" aria-hidden="true">${icon}</span><h3>${escapeHtml(tr(title))}</h3><p>${escapeHtml(tr(description))}</p></article>`;
}

function processStep(number, title, description) {
  return `<article class="process-step"><span>${number}</span><h3>${escapeHtml(tr(title))}</h3><p>${escapeHtml(tr(description))}</p></article>`;
}

function faqCard(question, answer) {
  return `<details class="faq-card"><summary>${escapeHtml(tr(question))}</summary><p>${escapeHtml(tr(answer))}</p></details>`;
}


function renderHome() {

  app.innerHTML = layout(`

    <section class="hero product-hero">

      <div class="hero-card">

        <h1>${escapeHtml(tr('Организуй задачи, проекты и учебные дела в одном пространстве'))}</h1>

        <p>${escapeHtml(tr('DUT помогает быстро создать рабочую доску, разложить задачи по колонкам и подключить расширенные функции только тогда, когда они действительно нужны.'))}</p>

        <div class="hero-actions">

          ${state.user ? `<a href="/dashboard" data-link class="button">${escapeHtml(tr('Открыть рабочую доску'))}</a><a href="/profile/tariffs" data-link class="button secondary">${escapeHtml(tr('Смотреть тарифы'))}</a>` : `<a href="/register" data-link class="button">${escapeHtml(tr('Попробовать бесплатно'))}</a><a href="/pricing" data-link class="button secondary">${escapeHtml(tr('Смотреть тарифы'))}</a>`}

        </div>

      </div>

      <div class="hero-preview">

        <div class="hero-logo-big">${dutLogo('hero-mark')}</div>

        <div class="mini-board" aria-label="${escapeHtml(tr('Пример доски'))}">

          <div class="mini-column"><strong>${escapeHtml(tr('ЗАДАЧИ'))}</strong><div class="mini-task">${escapeHtml(tr('Лендинг DUT'))}</div><div class="mini-task">${escapeHtml(tr('Профиль'))}</div></div>

          <div class="mini-column"><strong>${escapeHtml(tr('В процессе'))}</strong><div class="mini-task">${escapeHtml(tr('Дизайн'))}</div></div>

          <div class="mini-column"><strong>${escapeHtml(tr('Выполнено'))}</strong><div class="mini-task">${escapeHtml(tr('Вход'))}</div></div>

        </div>

      </div>

    </section>



    <section class="landing-section pricing-preview-section">

      <div class="section-heading">

        <h2>${escapeHtml(tr('Тарифы под разные задачи'))}</h2>

        <p>${escapeHtml(tr('Начни бесплатно, а расширенные возможности подключай только при необходимости.'))}</p>

      </div>

      <div class="price-grid home-price-grid">${plans.map(planCard).join('')}</div>

    </section>

  `);

  document.querySelectorAll('.choose-plan').forEach((button) => {

    button.addEventListener('click', () => navigate(state.user ? '/profile/tariffs' : '/register'));

  });

}

function renderAuth(mode) {
  const isRegister = mode === 'register';
  app.innerHTML = `
    <main class="auth-page">
      <form class="auth-card" id="authForm">
        <div class="auth-brand">${dutLogo('auth-logo')}<strong>DUT</strong></div>
        <h1>${isRegister ? tr('Регистрация') : tr('Вход')}</h1>
        <p>${isRegister ? escapeHtml(tr('Создай аккаунт DUT и получи базовую доску бесплатно.')) : escapeHtml(tr('Войди, чтобы открыть свою доску DUT.'))}</p>
        <div id="authMessage"></div>
        ${isRegister ? `<div class="form-group"><label>${tr('Ник / имя')}</label><input class="input" name="name" placeholder="${escapeHtml(tr('Твой ник'))}" required /></div>` : ''}
        <div class="form-group"><label>${tr('Email')}</label><input class="input" type="email" name="email" placeholder="name@example.com" required /></div>
        <div class="form-group"><label>${tr('Пароль')}</label><input class="input" type="password" name="password" placeholder="${escapeHtml(tr('Минимум 6 символов'))}" minlength="6" required /></div>
        ${isRegister ? `<label class="checkbox-line auth-consent"><input type="checkbox" name="termsAccepted" required /><span>${escapeHtml(tr('Я принимаю правила сервиса и политику конфиденциальности'))} <a href="/terms" data-link>${escapeHtml(tr('Правила сервиса'))}</a> · <a href="/privacy" data-link>${escapeHtml(tr('Политика конфиденциальности'))}</a></span></label>` : ''}
        <button class="btn" type="submit" style="width:100%">${isRegister ? tr('Создать аккаунт') : tr('Войти')}</button>
        <p class="auth-switch">${isRegister ? tr('Уже есть аккаунт?') : tr('Нет аккаунта?')} <a href="${isRegister ? '/login' : '/register'}" data-link>${isRegister ? tr('Войти') : tr('Зарегистрироваться')}</a></p>
      </form>
    </main>
  `;

  document.getElementById('authForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const message = document.getElementById('authMessage');
    message.innerHTML = '';
    try {
      const data = await api(isRegister ? '/api/register' : '/api/login', { method: 'POST', body: JSON.stringify(payload) });
      state.user = data.user;
      applyVisualSettings(state.user?.designSettings || defaultDesign);
      applySystemSettings(state.user?.systemSettings || defaultSystem);
      navigate(currentSystem().startPage === 'profile' ? '/profile' : '/dashboard');
    } catch (error) {
      message.innerHTML = `<div class="error inline-message">${escapeHtml(error.message)}</div>`;
    }
  });
}

function deadlineStatus(task) {
  if (!task.dueAt) return task.manualColor ? 'manual' : '';
  const now = new Date();
  const end = new Date(task.dueAt);
  if (Number.isNaN(end.getTime())) return task.manualColor ? 'manual' : '';
  if (now > end) return 'black';
  const start = task.startAt ? new Date(task.startAt) : new Date(task.createdAt);
  const safeStart = Number.isNaN(start.getTime()) ? new Date(task.createdAt) : start;
  const total = Math.max(end.getTime() - safeStart.getTime(), 1);
  const left = end.getTime() - now.getTime();
  const percentLeft = left / total;
  if (percentLeft <= 0.15) return 'red';
  if (percentLeft <= 0.5) return 'yellow';
  return 'green';
}

function isDoneTask(task) {
  const column = state.columns.find((item) => item.id === task.columnId);
  return /выполн|готов|done/i.test(column?.title || '');
}

function taskMatchesFilters(task) {
  const filters = state.filters || { taskQuery: '', status: 'all' };
  const query = String(filters.taskQuery || '').trim().toLowerCase();
  if (query && !`${task.title || ''} ${task.description || ''}`.toLowerCase().includes(query)) return false;
  const status = filters.status || 'all';
  if (status === 'overdue') return deadlineStatus(task) === 'black';
  if (status === 'deadline') return Boolean(task.dueAt);
  if (status === 'manual') return Boolean(task.manualColor);
  if (status === 'done') return isDoneTask(task);
  return true;
}

function tasksForColumn(columnId) {
  return state.tasks.filter((task) => task.columnId === columnId && taskMatchesFilters(task));
}

function boardStats() {
  const total = state.tasks.length;
  const found = state.tasks.filter(taskMatchesFilters).length;
  const done = state.tasks.filter(isDoneTask).length;
  const urgent = state.tasks.filter((task) => ['black', 'red'].includes(deadlineStatus(task))).length;
  return { total, found, done, urgent };
}

async function renderDashboard() {
  try { await loadBoard(); } catch { navigate('/login'); return; }
  const plan = state.user?.plan || 'free';
  const customColumnsCount = state.columns.filter((column) => !column.isDefault).length;
  const filters = state.filters || { taskQuery: '', status: 'all' };
  const notice = state.message ? `<div class="notice" role="status">${escapeHtml(state.message)}</div>` : '';
  const error = state.error ? `<div class="error" role="alert">${escapeHtml(state.error)}</div>` : '';

  app.innerHTML = layout(`
    <section class="dashboard">
      <div class="dashboard-head">
        <div>
          <h1>${escapeHtml(state.board?.title === 'Моя доска' ? tr('Моя доска') : (state.board?.title || tr('Моя доска')))}</h1>
          <p class="muted">${tr('Привет, {name}. Двигай задачи между колонками и следи за сроками.', { name: escapeHtml(state.user.name) })}</p>
        </div>
        <div class="nav">
          <span class="plan-pill">${escapeHtml(planLabel(plan))}</span>
          <button class="btn" id="newColumnBtn" type="button">${escapeHtml(tr('+ Колонка'))}</button>
        </div>
      </div>
      ${error}${notice}
      <form class="board-toolbar" id="boardFilterForm" role="search">
        <label><span>${escapeHtml(tr('Поиск задач'))}</span><input class="input" name="taskQuery" value="${escapeHtml(filters.taskQuery || '')}" placeholder="${escapeHtml(tr('Найти по названию или описанию'))}" /></label>
        <label><span>${escapeHtml(tr('Фильтр'))}</span><select class="input" name="taskStatus">
          <option value="all" ${filters.status === 'all' ? 'selected' : ''}>${escapeHtml(tr('Все задачи'))}</option>
          <option value="overdue" ${filters.status === 'overdue' ? 'selected' : ''}>${escapeHtml(tr('Просроченные'))}</option>
          <option value="deadline" ${filters.status === 'deadline' ? 'selected' : ''}>${escapeHtml(tr('С дедлайном'))}</option>
          <option value="manual" ${filters.status === 'manual' ? 'selected' : ''}>${escapeHtml(tr('С меткой'))}</option>
          <option value="done" ${filters.status === 'done' ? 'selected' : ''}>${escapeHtml(tr('Выполненные'))}</option>
        </select></label>
        <div class="toolbar-actions"><button class="btn secondary" type="submit">${escapeHtml(tr('Применить'))}</button><button class="btn secondary" id="resetBoardFilters" type="button">${escapeHtml(tr('Сбросить'))}</button></div>
      </form>
      <div class="board" aria-label="${escapeHtml(tr('Моя доска'))}">
        ${state.columns.map((column) => renderColumn(column)).join('')}
      </div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/dashboard', label: 'Моя доска' }]) });
  state.message = '';
  state.error = '';
  bindBoardEvents(plan, customColumnsCount);
}


function displayColumnTitle(column) {
  return column?.isDefault ? tr(column.title) : column.title;
}

function renderColumn(column) {
  const tasks = tasksForColumn(column.id);
  const allColumnTasks = state.tasks.filter((task) => task.columnId === column.id);
  const emptyTitle = allColumnTasks.length ? 'По текущему фильтру задач нет' : 'Здесь пока нет задач';
  const emptyText = allColumnTasks.length ? 'Измени поиск или сбрось фильтр, чтобы увидеть карточки.' : 'Создай первую задачу или перенеси карточку из другой колонки.';
  return `
    <section class="column" data-column-id="${escapeHtml(column.id)}" style="--column-color:${escapeHtml(column.color || '#ffffff')}">
      <div class="column-head">
        <span class="column-title">${escapeHtml(displayColumnTitle(column))}</span>
        <div class="column-tools">
          <span class="task-counter">${tasks.length}/${allColumnTasks.length}</span>
          <button class="icon-btn edit-column" type="button" data-column-id="${escapeHtml(column.id)}" title="${escapeHtml(tr('Редактировать колонку'))}" aria-label="${escapeHtml(tr('Редактировать колонку'))}">✎</button>
          ${column.isDefault ? '' : `<button class="icon-btn delete-column" type="button" data-column-id="${escapeHtml(column.id)}" title="${escapeHtml(tr('Удалить колонку'))}" aria-label="${escapeHtml(tr('Удалить колонку'))}">×</button>`}
        </div>
      </div>
      <div class="task-list">
        ${tasks.length ? tasks.map(renderTask).join('') : `<div class="empty-state"><strong>${escapeHtml(tr(emptyTitle))}</strong><p>${escapeHtml(tr(emptyText))}</p></div>`}
        <button class="add-task-zone new-task" type="button" data-column-id="${escapeHtml(column.id)}">${escapeHtml(tr('+ Добавить задачу'))}</button>
      </div>
    </section>
  `;
}


function renderTaskMoveControls(task) {
  const index = state.columns.findIndex((column) => column.id === task.columnId);
  if (index < 0 || state.columns.length < 2) return '';
  const previous = state.columns[index - 1];
  const next = state.columns[index + 1];
  const buttons = [];
  if (previous) buttons.push(`<button class="btn tiny secondary move-task" type="button" data-task-id="${escapeHtml(task.id)}" data-column-id="${escapeHtml(previous.id)}">← ${escapeHtml(tr('Назад'))}</button>`);
  if (next) buttons.push(`<button class="btn tiny secondary move-task" type="button" data-task-id="${escapeHtml(task.id)}" data-column-id="${escapeHtml(next.id)}">${escapeHtml(tr('Дальше'))} →</button>`);
  return buttons.length ? `<div class="task-mobile-move" aria-label="${escapeHtml(tr('Перемещение задачи'))}">${buttons.join('')}</div>` : '';
}


function renderTask(task) {
  const status = deadlineStatus(task);
  const cls = `${status ? `task-card deadline-${status}` : 'task-card'}${task.manualColor ? ' has-manual-color' : ''}`;
  const manualStyle = task.manualColor ? `style="--manual-color:${escapeHtml(task.manualColor)}"` : '';
  const draggable = isMobileRendering() ? 'false' : 'true';
  return `
    <article class="${cls}" ${manualStyle} draggable="${draggable}" data-task-id="${escapeHtml(task.id)}">
      <h3>${escapeHtml(task.title)}</h3>
      ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
      <div class="task-meta">
        ${task.startAt ? `<span class="meta-chip">${escapeHtml(tr('Старт'))}: ${escapeHtml(formatDate(task.startAt))}</span>` : ''}
        ${task.dueAt ? `<span class="meta-chip">${escapeHtml(tr('Дедлайн'))}: ${escapeHtml(formatDate(task.dueAt))}</span>` : ''}
        ${status === 'black' ? `<span class="meta-chip">${escapeHtml(tr('Просрочено'))}</span>` : ''}
        ${task.manualColor ? `<span class="meta-chip manual-color-chip">${escapeHtml(tr('Метка'))}</span>` : ''}
      </div>
      ${renderTaskMoveControls(task)}
      <div class="card-actions">
        <button class="btn tiny secondary edit-task" type="button" data-task-id="${escapeHtml(task.id)}">${tr('Изменить')}</button>
        <button class="btn tiny danger delete-task" type="button" data-task-id="${escapeHtml(task.id)}">${tr('Удалить')}</button>
      </div>
    </article>
  `;
}

function bindBoardEvents(plan, customColumnsCount) {
  document.getElementById('boardFilterForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.filters = { taskQuery: String(data.taskQuery || ''), status: String(data.taskStatus || 'all') };
    await renderDashboard();
  });
  document.getElementById('resetBoardFilters')?.addEventListener('click', async () => {
    state.filters = { taskQuery: '', status: 'all' };
    await renderDashboard();
  });
  document.getElementById('newColumnBtn')?.addEventListener('click', () => {
    if (plan === 'free') {
      state.message = tr('Новые колонки доступны с тарифа Pro.');
      renderDashboard();
      return;
    }
    if (plan === 'pro' && customColumnsCount >= 2) {
      state.message = tr('На тарифе Pro можно создать только 2 дополнительные колонки. Для безлимита нужен тариф Max.');
      renderDashboard();
      return;
    }
    openColumnModal();
  });

  document.querySelectorAll('.new-task').forEach((button) => button.addEventListener('click', () => openTaskModal({ columnId: button.dataset.columnId })));
  document.querySelectorAll('.edit-task').forEach((button) => button.addEventListener('click', () => openTaskModal(state.tasks.find((task) => task.id === button.dataset.taskId))));
  document.querySelectorAll('.delete-task').forEach((button) => button.addEventListener('click', () => deleteTask(button.dataset.taskId)));
  document.querySelectorAll('.move-task').forEach((button) => button.addEventListener('click', () => saveTaskMove(button.dataset.taskId, button.dataset.columnId)));
  document.querySelectorAll('.edit-column').forEach((button) => button.addEventListener('click', () => openColumnModal(state.columns.find((column) => column.id === button.dataset.columnId))));
  document.querySelectorAll('.delete-column').forEach((button) => button.addEventListener('click', () => deleteColumn(button.dataset.columnId)));

  if (!isMobileRendering()) {
    document.querySelectorAll('.task-card[draggable="true"]').forEach((card) => {
      card.addEventListener('dragstart', () => {
        state.dragTaskId = card.dataset.taskId;
        card.classList.add('is-dragging');
        document.body.classList.add('task-drag-active');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        document.body.classList.remove('task-drag-active');
        document.querySelectorAll('.column.drop-active').forEach((item) => item.classList.remove('drop-active'));
        state.dragTaskId = null;
      });
    });
  }
  document.querySelectorAll('.column').forEach((column) => {
    if (!isMobileRendering()) {
      column.addEventListener('dragover', (event) => { event.preventDefault(); column.classList.add('drop-active'); });
      column.addEventListener('dragleave', (event) => { if (!column.contains(event.relatedTarget)) column.classList.remove('drop-active'); });
      column.addEventListener('drop', async () => {
        column.classList.remove('drop-active');
        if (!state.dragTaskId) return;
        const id = state.dragTaskId;
        state.dragTaskId = null;
        await saveTaskMove(id, column.dataset.columnId);
      });
    }
    column.querySelector('.task-list')?.addEventListener('dblclick', (event) => {
      if (event.target.closest('.task-card') || event.target.closest('button')) return;
      openTaskModal({ columnId: column.dataset.columnId });
    });
  });
}

function openTaskModal(task = {}) {
  const plan = state.user?.plan || 'free';
  const canUseDeadlines = plan === 'pro' || plan === 'max';
  const canUseCustomColors = plan === 'max';
  const isEdit = Boolean(task.id);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop task-modal-backdrop';
  modal.innerHTML = `
    <form class="modal task-modal" id="taskForm">
      <h2>${isEdit ? tr('Изменить задачу') : tr('Новая задача')}</h2>
      <div class="modal-scroll-body">
        <div id="taskFormMessage"></div>
        <div class="form-group"><label>${escapeHtml(tr('Название'))}</label><input class="input" name="title" value="${escapeHtml(task.title || '')}" required /></div>
        ${isEdit ? `<div class="form-group mobile-friendly-column"><label>${escapeHtml(tr('Колонка'))}</label><select class="input" name="columnId">${state.columns.map((column) => `<option value="${escapeHtml(column.id)}" ${column.id === task.columnId ? 'selected' : ''}>${escapeHtml(displayColumnTitle(column))}</option>`).join('')}</select></div>` : ''}
        <div class="form-group"><label>${escapeHtml(tr('Описание'))}</label><textarea class="textarea" name="description">${escapeHtml(task.description || '')}</textarea></div>
        ${canUseDeadlines ? `
          <div class="form-two">
            <div class="form-group"><label>${escapeHtml(tr('Дата и время старта'))}</label><input class="input" type="datetime-local" name="startAt" value="${escapeHtml(task.startAt || '')}" /></div>
            <div class="form-group"><label>${escapeHtml(tr('Дата и время дедлайна'))}</label><input class="input" type="datetime-local" name="dueAt" value="${escapeHtml(task.dueAt || '')}" /></div>
          </div>
        ` : `<div class="notice inline-message">${escapeHtml(tr('Дедлайны, время и автоцвет задач доступны с тарифа Pro.'))}</div>`}
        ${canUseCustomColors ? `<div class="form-group task-color-control"><label>${escapeHtml(tr('Цветовая метка задачи'))}</label><div class="manual-color-row"><input class="input manual-color-input" type="color" name="manualColor" value="${escapeHtml(task.manualColor || '#6366f1')}" /><span class="manual-color-value" id="manualColorValue">${escapeHtml(task.manualColor || '#6366f1')}</span></div>${renderTaskPalette(task.manualColor || '#6366f1')}</div>` : ''}
      </div>
      <div class="modal-actions"><button class="btn secondary" type="button" id="cancelModal">${tr('Отмена')}</button><button class="btn" type="submit">${tr('Сохранить')}</button></div>
    </form>
  `;
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  const closeModal = () => {
    modal.remove();
    document.body.classList.remove('modal-open');
  };
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  requestAnimationFrame(() => {
    const sheet = modal.querySelector('.modal-scroll-body') || modal.querySelector('.modal');
    if (sheet) sheet.scrollTop = 0;
  });

  const manualColorInput = modal.querySelector('input[name="manualColor"]');
  const manualColorValue = modal.querySelector('#manualColorValue');
  const syncManualColorPreview = () => {
    if (!manualColorInput) return;
    const value = manualColorInput.value || '#6366f1';
    if (manualColorValue) manualColorValue.textContent = value.toUpperCase();
    modal.querySelectorAll('.task-color-preset').forEach((button) => {
      button.classList.toggle('active', String(button.dataset.color).toLowerCase() === String(value).toLowerCase());
    });
  };
  manualColorInput?.addEventListener('input', syncManualColorPreview);
  modal.querySelectorAll('.task-color-preset').forEach((button) => {
    button.addEventListener('click', () => {
      if (!manualColorInput || !button.dataset.color) return;
      manualColorInput.value = button.dataset.color;
      syncManualColorPreview();
    });
  });
  syncManualColorPreview();

  document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    payload.columnId = isEdit ? String(payload.columnId || task.columnId) : task.columnId;
    const message = document.getElementById('taskFormMessage');
    if (payload.startAt && payload.dueAt && new Date(payload.startAt) > new Date(payload.dueAt)) {
      if (message) message.innerHTML = `<div class="error inline-message" role="alert">${escapeHtml(tr('Дата старта не может быть позже дедлайна.'))}</div>`;
      return;
    }
    try {
      await api(isEdit ? `/api/tasks/${encodeURIComponent(task.id)}` : '/api/tasks', { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      closeModal();
      await renderDashboard();
    } catch (error) {
      state.error = error.message;
      closeModal();
      await renderDashboard();
    }
  });
}

function openColumnModal(column = {}) {
  const plan = state.user?.plan || 'free';
  const canUseCustomColors = plan === 'max';
  const isEdit = Boolean(column.id);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop column-modal-backdrop';
  modal.innerHTML = `
    <form class="modal column-modal" id="columnForm">
      <h2>${isEdit ? tr('Изменить колонку') : tr('Новая колонка')}</h2>
      <div class="modal-scroll-body">
        <div class="form-group"><label>${escapeHtml(tr('Название колонки'))}</label><input class="input" name="title" value="${escapeHtml(column.title || '')}" required /></div>
        ${canUseCustomColors ? `<div class="form-group"><label>${escapeHtml(tr('Цвет колонки'))}</label><input class="input" type="color" name="color" value="${escapeHtml(column.color || '#ffffff')}" /></div>` : `<div class="notice inline-message">${escapeHtml(tr('Свои цвета колонок доступны на тарифе Max.'))}</div>`}
      </div>
      <div class="modal-actions"><button class="btn secondary" type="button" id="cancelModal">${tr('Отмена')}</button><button class="btn" type="submit">${tr('Сохранить')}</button></div>
    </form>
  `;
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  const closeModal = () => {
    modal.remove();
    document.body.classList.remove('modal-open');
  };
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.getElementById('cancelModal').addEventListener('click', closeModal);
  requestAnimationFrame(() => {
    const sheet = modal.querySelector('.modal-scroll-body') || modal.querySelector('.modal');
    if (sheet) sheet.scrollTop = 0;
  });
  document.getElementById('columnForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api(isEdit ? `/api/columns/${encodeURIComponent(column.id)}` : '/api/columns', { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      closeModal();
      await renderDashboard();
    } catch (error) {
      state.error = error.message;
      closeModal();
      await renderDashboard();
    }
  });
}

async function deleteTask(taskId) {
  if (currentSystem().confirmDelete !== 'off' && !confirm(tr('Удалить задачу?'))) return;
  try { await api(`/api/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' }); await renderDashboard(); }
  catch (error) { state.error = error.message; await renderDashboard(); }
}

async function saveTaskMove(taskId, columnId) {
  const task = state.tasks.find((item) => item.id === taskId);
  const previousColumnId = task?.columnId;
  if (task && previousColumnId === columnId) return;
  if (task) task.columnId = columnId;

  const card = document.querySelector(`.task-card[data-task-id="${cssEscape(taskId)}"]`);
  const targetColumn = document.querySelector(`.column[data-column-id="${cssEscape(columnId)}"] .task-list`);
  const addButton = targetColumn?.querySelector('.add-task-zone');
  if (card && targetColumn) {
    card.classList.remove('is-dragging');
    card.classList.add('just-moved');
    targetColumn.insertBefore(card, addButton || null);
    setTimeout(() => card.classList.remove('just-moved'), 520);
  }
  document.body.classList.remove('task-drag-active');
  document.querySelectorAll('.column.drop-active').forEach((item) => item.classList.remove('drop-active'));

  try {
    await api(`/api/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify({ columnId }) });
  } catch (error) {
    if (task) task.columnId = previousColumnId;
    state.error = error.message;
    await renderDashboard();
  }
}

async function deleteColumn(columnId) {
  if (currentSystem().confirmDelete !== 'off' && !confirm(tr('Удалить колонку вместе с задачами?'))) return;
  try { await api(`/api/columns/${encodeURIComponent(columnId)}`, { method: 'DELETE' }); await renderDashboard(); }
  catch (error) { state.error = error.message; await renderDashboard(); }
}

async function ensureProfileUser() {
  try { await loadMe(); } catch { navigate('/login'); return null; }
  if (!state.user) { navigate('/login'); return null; }
  return state.user;
}

async function getProfileStats() {
  try { await loadBoard(); } catch {}
  const total = state.tasks.length;
  const doneColumnIds = state.columns.filter((column) => /выполн|готов|done/i.test(column.title)).map((column) => column.id);
  const done = state.tasks.filter((task) => doneColumnIds.includes(task.columnId)).length;
  const overdue = state.tasks.filter((task) => deadlineStatus(task) === 'black').length;
  return { total, done, overdue, columns: state.columns.length };
}

function statusMessages() {
  return `${state.error ? `<div class="error profile-message">${escapeHtml(state.error)}</div>` : ''}${state.message ? `<div class="success profile-message">${escapeHtml(state.message)}</div>` : ''}`;
}

function profileLayout(title, description, body, actions = '') {
  const descriptionHtml = description ? `<p class="muted">${escapeHtml(tr(description))}</p>` : '';
  return layout(`
    <section class="profile-page">
      <div class="profile-hero">
        <div class="profile-title no-mark">
          <div>
            <span class="eyebrow">DUT account</span>
            <h1>${escapeHtml(tr(title))}</h1>
            ${descriptionHtml}
          </div>
        </div>
        <div class="nav">${actions}<a href="/dashboard" data-link class="btn secondary">${tr('Открыть доску')}</a></div>
      </div>
      ${body}
    </section>
  `);
}

async function renderProfile() {
  const user = await ensureProfileUser();
  if (!user) return;
  const createdAt = user.createdAt ? formatDate(user.createdAt) : '—';
  const accountAge = user.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / 86400000)) : 1;

  app.innerHTML = profileLayout(
    'Профиль',
    '',
    `
      ${statusMessages()}
      <article class="profile-main-card">
        <div class="profile-main-top">
          <div class="big-avatar">${escapeHtml((user.name || 'D').slice(0, 1).toUpperCase())}</div>
          <div>
            <h2>${escapeHtml(user.name)}</h2>
            <p>${escapeHtml(user.email)}</p>
          </div>
          <span class="plan-pill">${escapeHtml(planLabel(user.plan))}</span>
        </div>
        <div class="profile-info-grid">
          <div><span>${escapeHtml(tr('Ник'))}</span><strong>${escapeHtml(user.name)}</strong></div>
          <div><span>${escapeHtml(tr('Почта'))}</span><strong>${escapeHtml(user.email)}</strong></div>
          <div><span>${escapeHtml(tr('Аккаунт создан'))}</span><strong>${escapeHtml(createdAt)}</strong></div>
          <div><span>${escapeHtml(tr('Возраст аккаунта'))}</span><strong>${accountAge} ${escapeHtml(tr('дн.'))}</strong></div>
        </div>
      </article>

      <section class="profile-next-section">
        <span class="eyebrow">${escapeHtml(tr('Дальше'))}</span>
        <h2>${escapeHtml(tr('Управление аккаунтом'))}</h2>
        
        <div class="profile-action-grid">
          <a href="/profile/tariffs" data-link class="profile-action-card">
            <span>€</span>
            <h3>${escapeHtml(tr('ТАРИФ'))}</h3>
            <p>${escapeHtml(tr('Посмотреть Free, Pro, Max и изменить уровень доступа.'))}</p>
            <strong>${escapeHtml(tr('Открыть тарифы →'))}</strong>
          </a>
          <a href="/profile/settings?tab=profile" data-link class="profile-action-card">
            <span>⚙</span>
            <h3>${escapeHtml(tr('НАСТРОЙКИ'))}</h3>
            <p>${escapeHtml(tr('Изменить данные профиля и настроить внешний вид сайта.'))}</p>
            <strong>${escapeHtml(tr('Открыть настройки →'))}</strong>
          </a>
        </div>
      </section>
    `
  );
  state.message = '';
  state.error = '';
}

function planCard(plan) {
  return `
    <article class="price-card ${plan.highlight ? 'highlight' : ''}">
      <div>
        <div class="plan-card-head"><h2>${escapeHtml(tr(plan.title))}</h2>${plan.highlight ? `<span class="mini-badge">${escapeHtml(tr('Популярный'))}</span>` : ''}</div>
        <p class="muted">${escapeHtml(tr(plan.description))}</p>
      </div>
      <div class="price">${escapeHtml(planPrice(plan.id))}</div>
      <ul class="feature-list">${plan.features.map((feature) => `<li>${escapeHtml(tr(feature))}</li>`).join('')}</ul>
      <button class="btn choose-plan" data-plan="${escapeHtml(plan.id)}">${state.user?.plan === plan.id ? tr('Текущий тариф') : tr('Выбрать')}</button>
    </article>
  `;
}

async function renderProfileTariffs() {
  const user = await ensureProfileUser();
  if (!user) return;
  app.innerHTML = profileLayout(
    'Тарифы',
    '',
    `
      ${statusMessages()}
      <div class="tariffs-headline">
        <div><span class="eyebrow">${escapeHtml(tr('Подписка'))}</span><h2>${escapeHtml(tr('Выбери уровень доступа'))}</h2></div>
      </div>
      <div class="price-grid">${plans.map(planCard).join('')}</div>
    `
  );
  state.message = '';
  state.error = '';
  document.querySelectorAll('.choose-plan').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const data = await api('/api/change-plan', { method: 'POST', body: JSON.stringify({ plan: button.dataset.plan }) });
        state.user = data.user;
        state.message = tr('Тариф изменён на {plan}.', { plan: planLabel(button.dataset.plan) });
        renderProfileTariffs();
      } catch (error) {
        state.error = error.message;
        renderProfileTariffs();
      }
    });
  });
}

function settingsTabs(active) {
  return `
    <div class="settings-tabs">
      <a href="/profile/settings?tab=profile" data-link class="settings-tab ${active === 'profile' ? 'active' : ''}">
        <strong>${escapeHtml(tr('Профиль'))}</strong><span>${escapeHtml(tr('Имя, почта, аккаунт'))}</span>
      </a>
      <a href="/profile/settings?tab=design" data-link class="settings-tab ${active === 'design' ? 'active' : ''}">
        <strong>${escapeHtml(tr('Дизайн'))}</strong><span>${escapeHtml(tr('Пресеты, тема, элементы'))}</span>
      </a>
      <a href="/profile/settings?tab=system" data-link class="settings-tab ${active === 'system' ? 'active' : ''}">
        <strong>${escapeHtml(tr('Система'))}</strong><span>${escapeHtml(tr('Язык, формат времени, поведение'))}</span>
      </a>
    </div>
  `;
}

async function renderProfileSettings() {
  const user = await ensureProfileUser();
  if (!user) return;
  const requestedTab = new URLSearchParams(window.location.search).get('tab');
  const tab = requestedTab === 'design' || requestedTab === 'system' ? requestedTab : 'profile';
  app.innerHTML = profileLayout(
    'Настройки',
    '',
    `
      ${statusMessages()}
      ${settingsTabs(tab)}
      ${tab === 'design' ? renderDesignSettings(user) : tab === 'system' ? renderSystemSettings(user) : renderAccountSettings(user)}
    `
  );
  state.message = '';
  state.error = '';
  if (tab === 'design') bindDesignSettings();
  else if (tab === 'system') bindSystemSettings();
  else bindAccountSettings();
}

function renderAccountSettings(user) {
  return `
    <div class="settings-grid account-settings-grid">
      <article class="profile-card">
        <span class="eyebrow">${escapeHtml(tr('Данные'))}</span>
        <h2>${escapeHtml(tr('Настройка профиля'))}</h2>
        <form id="profileForm" class="form-stack">
          <div class="form-group"><label>${tr('Ник / имя')}</label><input class="input" name="name" value="${escapeHtml(user.name)}" required /></div>
          <div class="form-group"><label>${tr('Email')}</label><input class="input" type="email" name="email" value="${escapeHtml(user.email)}" required /></div>
          <button class="btn" type="submit">${escapeHtml(tr('Сохранить данные'))}</button>
        </form>
      </article>
      <article class="profile-card">
        <span class="eyebrow">${escapeHtml(tr('Информация'))}</span>
        <h2>${escapeHtml(tr('Аккаунт'))}</h2>
        <div class="profile-info-list">
          <div><span>${escapeHtml(tr('ID аккаунта'))}</span><strong>${escapeHtml(user.id.slice(0, 16))}...</strong></div>
          <div><span>${escapeHtml(tr('Создан'))}</span><strong>${escapeHtml(formatDate(user.createdAt))}</strong></div>
          <div><span>${escapeHtml(tr('Тарифы'))}</span><strong>${escapeHtml(planLabel(user.plan))}</strong></div>
          <div><span>${escapeHtml(tr('Последнее обновление'))}</span><strong>${escapeHtml(user.updatedAt ? formatDate(user.updatedAt) : '—')}</strong></div>
        </div>
      </article>
      <article class="profile-card danger-zone">
        <span class="eyebrow">${escapeHtml(tr('Вход'))}</span>
        <h2>${escapeHtml(tr('Управление сессией'))}</h2>
        <p class="muted">${escapeHtml(tr('Выход удалит текущую сессию на этом устройстве. Данные аккаунта сохранятся.'))}</p>
        <button class="btn danger" id="logoutBtn">${escapeHtml(tr('Выйти из аккаунта'))}</button>
      </article>
    </div>
  `;
}

function selectField(name, title, options, value, description) {
  return `
    <label class="design-control" data-control="${escapeHtml(name)}">
      <span><strong>${escapeHtml(tr(title))}</strong><small>${escapeHtml(tr(description))}</small></span>
      <select class="input" name="${escapeHtml(name)}">
        ${Object.entries(options).map(([key, label]) => `<option value="${escapeHtml(key)}" ${value === key ? 'selected' : ''}>${escapeHtml(tr(label))}</option>`).join('')}
      </select>
    </label>
  `;
}

function settingsSection(title, description, content, open = true) {
  return `
    <details class="settings-section" ${open ? 'open' : ''}>
      <summary><span><strong>${escapeHtml(tr(title))}</strong><small>${escapeHtml(tr(description))}</small></span><b>⌄</b></summary>
      <div class="settings-section-body">${content}</div>
    </details>
  `;
}

function readCurrentDesignWith(overrides = {}) {
  return normalizeDesign({ ...readDesignForm(), ...overrides });
}

function renderDesignSettings(user) {
  const design = normalizeDesign(user.designSettings);
  const presetCards = designPresets.map((preset) => `
    <button type="button" class="preset-card" data-preset="${escapeHtml(preset.id)}">
      <strong>${escapeHtml(tr(preset.title))}</strong>
      <span>${escapeHtml(tr(preset.description))}</span>
    </button>
  `).join('');

  const mobileCompact = isMobileRendering();
  const mobileBaseControls = `
    <div class="theme-picks compact-picks">
      ${['pastel','light','dark'].map((theme) => `
        <label class="theme-pick ${design.theme === theme ? 'selected' : ''}">
          <input type="radio" name="theme" value="${theme}" ${design.theme === theme ? 'checked' : ''} />
          <span class="theme-preview ${theme}"></span>
          <strong>${escapeHtml(tr(designLabels.theme[theme]))}</strong>
        </label>
      `).join('')}
    </div>
    <label class="design-control color-control" data-control="accent">
      <span><strong>${escapeHtml(tr('Акцентный цвет'))}</strong><small>${escapeHtml(tr('Цвет кнопок и активных элементов.'))}</small></span>
      <input class="input" type="color" name="accent" value="${escapeHtml(design.accent)}" />
    </label>
    <div class="accent-presets" aria-label="${escapeHtml(tr('Быстрый выбор цвета'))}">
      ${['#2563eb','#7c3aed','#06b6d4','#10b981','#f97316','#ef4444'].map((color) => `<button type="button" class="accent-preset" data-accent="${color}" style="--preset:${color}" title="${color}"></button>`).join('')}
    </div>
    ${selectField('background', 'Фон сайта', designLabels.background, design.background, 'Только базовый фон на телефоне')}
  `;

  const baseControls = `
    <div class="theme-picks compact-picks">
      ${['pastel','light','dark'].map((theme) => `
        <label class="theme-pick ${design.theme === theme ? 'selected' : ''}">
          <input type="radio" name="theme" value="${theme}" ${design.theme === theme ? 'checked' : ''} />
          <span class="theme-preview ${theme}"></span>
          <strong>${escapeHtml(tr(designLabels.theme[theme]))}</strong>
        </label>
      `).join('')}
    </div>
    <label class="design-control color-control">
      <span><strong>${escapeHtml(tr('Акцентный цвет'))}</strong><small>${escapeHtml(tr('Цвет кнопок, активных вкладок и подсветки.'))}</small></span>
      <input class="input" type="color" name="accent" value="${escapeHtml(design.accent)}" />
    </label>
    <div class="accent-presets" aria-label="${escapeHtml(tr('Быстрый выбор цвета'))}">
      ${['#2563eb','#7c3aed','#06b6d4','#10b981','#f97316','#ef4444','#ffffff','#111827'].map((color) => `<button type="button" class="accent-preset" data-accent="${color}" style="--preset:${color}" title="${color}"></button>`).join('')}
    </div>
    ${selectField('background', 'Фон сайта', designLabels.background, design.background, 'Чистый фон, градиент, сетка или живой фон')}
    ${selectField('font', 'Шрифт', designLabels.font, design.font, 'Системный, строгий, технический или более мягкий')}
    ${selectField('textSize', 'Размер текста', designLabels.textSize, design.textSize, 'Масштаб текста по всему сайту')}
    ${selectField('contrast', 'Контраст интерфейса', designLabels.contrast, design.contrast, 'Насколько сильными будут текст и границы')}
  `;

  const componentControls = `
    ${selectField('density', 'Плотность интерфейса', designLabels.density, design.density, 'Сколько воздуха между элементами')}
    ${selectField('radius', 'Скругление элементов', designLabels.radius, design.radius, 'Строгие углы, скругление или мягкие капсулы')}
    ${selectField('surface', 'Материал карточек', designLabels.surface, design.surface, 'Стекло, жидкое стекло, плотные блоки или чистые панели')}
    ${selectField('glassPower', 'Сила стекла', designLabels.glassPower, design.glassPower, 'Насколько заметен стеклянный эффект')}
    ${selectField('borders', 'Контуры', designLabels.borders, design.borders, 'Без контуров, мягкие или чёткие границы')}
    ${selectField('shadows', 'Тени', designLabels.shadows, design.shadows, 'Глубина карточек и панелей')}
    ${selectField('cardTone', 'Тон карточек', designLabels.cardTone, design.cardTone, 'Обычный, контрастный или глубокий вид')}
  `;

  const controlsControls = `
    ${selectField('buttonStyle', 'Стиль кнопок', designLabels.buttonStyle, design.buttonStyle, 'Залитые, мягкие, контурные или капсулы')}
    ${selectField('accentMode', 'Сила акцента', designLabels.accentMode, design.accentMode, 'Спокойный, обычный или яркий цветовой акцент')}
    ${selectField('inputStyle', 'Стиль полей', designLabels.inputStyle, design.inputStyle, 'Внешний вид input, textarea и select')}
    ${selectField('hoverEffect', 'Hover-эффект', designLabels.hoverEffect, design.hoverEffect, 'Поведение карточек при наведении')}
    ${selectField('animations', 'Анимации', designLabels.animations, design.animations, 'Скорость переходов и hover')}
    ${selectField('controlSize', 'Размер кнопок и полей', designLabels.controlSize, design.controlSize, 'Компактные, обычные или крупные контролы')}
  `;

  const boardControls = `
    ${selectField('boardWidth', 'Ширина рабочей зоны', designLabels.boardWidth, design.boardWidth, 'Обычная, широкая или вся ширина')}
    ${selectField('boardGap', 'Расстояние колонок', designLabels.boardGap, design.boardGap, 'Плотно, нормально или широко')}
    ${selectField('columnHeight', 'Высота колонок', designLabels.columnHeight, design.columnHeight, 'Ниже, обычная или высокая доска')}
    ${selectField('columnStyle', 'Стиль колонок', designLabels.columnStyle, design.columnStyle, 'Стекло, плотные панели, контур или минимализм')}
    ${selectField('columnColorMode', 'Цвет колонок', designLabels.columnColorMode, design.columnColorMode, 'Мягкие цвета, заметные цвета или отключить')}
    ${selectField('columnHeader', 'Заголовки колонок', designLabels.columnHeader, design.columnHeader, 'Обычные, бейджи или линия снизу')}
    ${selectField('taskStyle', 'Стиль задач', designLabels.taskStyle, design.taskStyle, 'Чистые, контурные, залитые или минимализм')}
    ${selectField('taskSize', 'Размер задач', designLabels.taskSize, design.taskSize, 'Меньше, средние или крупные')}
    ${selectField('dragAnimation', 'Анимация перетаскивания', designLabels.dragAnimation, design.dragAnimation, 'Подъём, призрак или мягкий перенос')}
  `;

  const previewPanel = `
    <aside class="profile-card design-preview-side" id="designPreviewSide">
      <div class="preview-side-head">
        <div><span class="eyebrow">${escapeHtml(tr('Live preview'))}</span><h2>${escapeHtml(tr('Проверка изменений'))}</h2></div>
        <button type="button" class="btn tiny secondary" id="togglePreviewBtn">${escapeHtml(tr('Скрыть'))}</button>
      </div>
      <div class="live-preview">
        <div class="preview-top"><span>DUT</span><button type="button" class="preview-button">${escapeHtml(tr('Кнопка'))}</button></div>
        <div class="preview-form-row"><input class="input" value="${escapeHtml(tr('Пример поля'))}" readonly /><select class="input"><option>${escapeHtml(tr('Пример select'))}</option></select></div>
        <div class="preview-sample-controls">
          <div class="preview-sample-card"><small>${escapeHtml(tr('Карточка'))}</small><div class="preview-pill-row"><span class="preview-mini-pill">${escapeHtml(tr('Панель'))}</span><span class="preview-mini-pill">${escapeHtml(tr('Тег'))}</span></div></div>
          <div class="preview-sample-card"><small>${escapeHtml(tr('Кнопки'))}</small><button type="button" class="btn tiny">Action</button> <button type="button" class="btn tiny secondary">Cancel</button></div>
          <div class="preview-sample-card"><small>${escapeHtml(tr('Поле'))}</small><input class="input" value="${escapeHtml(tr('Пример поля'))}" readonly /></div>
        </div>
        <div class="preview-board-wrap">
          <div class="preview-board">
            <div class="preview-column"><strong>${escapeHtml(tr('ЗАДАЧИ'))}</strong><div class="preview-task">${escapeHtml(tr('Карточка задачи'))}</div><div class="preview-task deadline">${escapeHtml(tr('Дедлайн'))}</div></div>
            <div class="preview-column"><strong>${escapeHtml(tr('В процессе'))}</strong><div class="preview-task active">${escapeHtml(tr('Дизайн'))}</div></div>
            <div class="preview-column"><strong>${escapeHtml(tr('Выполнено'))}</strong><div class="preview-task done">✓ ${escapeHtml(tr('Готово'))}</div></div>
          </div>
        </div>
      </div>
      <p class="preview-hint">${escapeHtml(tr('Проверка изменений закреплена справа на больших экранах и переносится вниз на маленьких. Меняй настройки — результат обновляется сразу.'))}</p>
    </aside>
  `;

  if (mobileCompact) {
    return `
      <form id="designForm" class="design-form pro-design-form mobile-compact-design">
        <section class="profile-card design-presets-panel">
          <div>
            <span class="eyebrow">${escapeHtml(tr('Пресеты'))}</span>
            <h2>${escapeHtml(tr('Готовые стили'))}</h2>
          </div>
          <div class="preset-grid">${presetCards}</div>
        </section>
        <section class="design-workspace">
          <div class="design-controls-column">
            ${settingsSection('Основной вид', 'Тема, цвет и фон', mobileBaseControls, true)}
          </div>
        </section>
        <div class="design-bottom-bar">
          <button class="btn secondary" type="button" id="resetDesignBtn">${escapeHtml(tr('Сбросить дизайн'))}</button>
          <button class="btn" type="submit">${escapeHtml(tr('Сохранить дизайн'))}</button>
        </div>
      </form>
    `;
  }

  return `
    <form id="designForm" class="design-form pro-design-form">
      <section class="profile-card design-presets-panel">
        <div>
          <span class="eyebrow">${escapeHtml(tr('Пресеты'))}</span>
          <h2>${escapeHtml(tr('Готовые стили'))}</h2>
        </div>
        <div class="preset-grid">${presetCards}</div>
      </section>

      <section class="design-workspace">
        <div class="design-controls-column">
          ${settingsSection('Основа сайта', 'Тема, фон, шрифт, контраст', baseControls, true)}
          ${settingsSection('Карточки и блоки', 'Материал, тени, контуры, скругление', componentControls, true)}
          ${settingsSection('Кнопки и поля', 'Формы, hover, анимации, размеры', controlsControls, false)}
          ${settingsSection('Доска и задачи', 'Колонки, задачи, ширина и высота', boardControls, false)}
        </div>
        ${previewPanel}
      </section>

      <div class="design-bottom-bar">
        <button class="btn secondary" type="button" id="randomDesignBtn">${escapeHtml(tr('Случайный стиль'))}</button>
        <button class="btn secondary" type="button" id="resetDesignBtn">${escapeHtml(tr('Сбросить дизайн'))}</button>
        <button class="btn" type="submit">${escapeHtml(tr('Сохранить дизайн'))}</button>
      </div>
    </form>
  `;
}


function renderSystemSettings(user) {
  const system = normalizeSystem(user.systemSettings);
  return `
    <form id="systemForm" class="settings-grid system-settings-grid">
      <article class="profile-card">
        <span class="eyebrow">${escapeHtml(tr('Язык'))}</span>
        <h2>${escapeHtml(tr('Перевод и формат'))}</h2>
        ${selectField('language', 'Язык интерфейса', systemLabels.language, system.language, 'Основной язык сайта. Палитра меток задач тоже меняется под выбранный язык.')}
        ${selectField('dateFormat', 'Формат даты', systemLabels.dateFormat, system.dateFormat, 'Как показывать даты в задачах и профиле')}
        ${selectField('timeFormat', 'Формат времени', systemLabels.timeFormat, system.timeFormat, '24-часовой или 12-часовой формат')}
        ${selectField('firstDay', 'Первый день недели', systemLabels.firstDay, system.firstDay, 'Для будущего календаря и дедлайнов')}
      </article>
      <article class="profile-card">
        <span class="eyebrow">${escapeHtml(tr('Поведение'))}</span>
        <h2>${escapeHtml(tr('Работа сервиса'))}</h2>
        ${selectField('autosave', 'Автосохранение', systemLabels.autosave, system.autosave, 'Автоматически сохранять изменения')}
        ${selectField('confirmDelete', 'Подтверждение удаления', systemLabels.confirmDelete, system.confirmDelete, 'Защита от случайного удаления задач и колонок')}
        ${selectField('startPage', 'Стартовая страница', systemLabels.startPage, system.startPage, 'Куда отправлять после входа')}
        ${selectField('reducedMotion', 'Меньше анимаций', systemLabels.reducedMotion, system.reducedMotion, 'Полезно для слабых устройств и спокойного интерфейса')}
      </article>
      <article class="profile-card">
        <span class="eyebrow">${escapeHtml(tr('Уведомления'))}</span>
        <h2>${escapeHtml(tr('Напоминания'))}</h2>
        ${selectField('notifications', 'Тип уведомлений', systemLabels.notifications, system.notifications, 'Пока подготовка под браузерные уведомления')}
        ${selectField('deadlineReminder', 'Напоминать о дедлайне', systemLabels.deadlineReminder, system.deadlineReminder, 'За сколько времени предупреждать о сроке')}
        ${selectField('sound', 'Звуки интерфейса', systemLabels.sound, system.sound, 'Будущие мягкие звуки для действий')}
        <div class="system-preview-box">
          <strong>${escapeHtml(tr('Пример системного уведомления'))}</strong>
          <span>${escapeHtml(tr('Задача «Дизайн DUT» скоро истекает.'))}</span>
        </div>
        <button class="btn" type="submit">${escapeHtml(tr('Сохранить системные настройки'))}</button>
      </article>
    </form>
  `;
}

function bindAccountSettings() {
  bindLogout();
  document.getElementById('profileForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify(payload) });
      state.user = data.user;
      state.message = tr('Данные профиля обновлены.');
      renderProfileSettings();
    } catch (error) {
      state.error = error.message;
      renderProfileSettings();
    }
  });
}

function readDesignForm() {
  const form = document.getElementById('designForm');
  if (!form) return currentDesign();
  return normalizeDesign(Object.fromEntries(new FormData(form).entries()));
}

function updateDesignUiState() {
  document.querySelectorAll('.theme-pick').forEach((pick) => {
    const input = pick.querySelector('input[type="radio"]');
    pick.classList.toggle('selected', Boolean(input?.checked));
  });
}

function bindDesignSettings() {
  const form = document.getElementById('designForm');
  if (!form) return;
  let designFrame = 0;
  let designSafeTimer = null;
  const applyCurrent = () => {
    document.documentElement.setAttribute('data-performance-safe', 'on');
    clearTimeout(designSafeTimer);
    if (designFrame) cancelAnimationFrame(designFrame);
    designFrame = requestAnimationFrame(() => {
      designFrame = 0;
      applyVisualSettings(readDesignForm());
      updateDesignUiState();
      designSafeTimer = setTimeout(() => document.documentElement.removeAttribute('data-performance-safe'), 360);
    });
  };
  form.addEventListener('input', applyCurrent, { passive: true });
  form.addEventListener('change', applyCurrent, { passive: true });

  document.querySelectorAll('.accent-preset').forEach((button) => {
    button.addEventListener('click', () => {
      const color = button.dataset.accent;
      const input = form.querySelector('input[name="accent"]');
      if (input && color) input.value = color;
      applyCurrent();
    });
  });

  document.querySelectorAll('.preset-card').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = designPresets.find((item) => item.id === button.dataset.preset);
      if (!preset) return;
      Object.entries(preset.settings).forEach(([key, value]) => {
        const fields = form.querySelectorAll(`[name="${cssEscape(key)}"]`);
        fields.forEach((field) => {
          if (field.type === 'radio') field.checked = field.value === value;
          else field.value = value;
        });
      });
      applyCurrent();
    });
  });

  document.getElementById('randomDesignBtn')?.addEventListener('click', () => {
    const randomFrom = (obj) => {
      const keys = Object.keys(obj || {});
      return keys[Math.floor(Math.random() * keys.length)];
    };
    const randomHex = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    const randomSettings = {
      theme: randomFrom(designLabels.theme),
      background: randomFrom(designLabels.background),
      font: randomFrom(designLabels.font),
      textSize: randomFrom(designLabels.textSize),
      density: randomFrom(designLabels.density),
      radius: randomFrom(designLabels.radius),
      shadows: randomFrom(designLabels.shadows),
      surface: randomFrom(designLabels.surface),
      borders: randomFrom(designLabels.borders),
      buttonStyle: randomFrom(designLabels.buttonStyle),
      inputStyle: randomFrom(designLabels.inputStyle),
      taskStyle: randomFrom(designLabels.taskStyle),
      taskSize: randomFrom(designLabels.taskSize),
      columnStyle: randomFrom(designLabels.columnStyle),
      columnHeader: randomFrom(designLabels.columnHeader),
      boardWidth: randomFrom(designLabels.boardWidth),
      boardGap: randomFrom(designLabels.boardGap),
      columnHeight: randomFrom(designLabels.columnHeight),
      hoverEffect: randomFrom(designLabels.hoverEffect),
      animations: randomFrom(designLabels.animations),
      dragAnimation: randomFrom(designLabels.dragAnimation),
      headerStyle: randomFrom(designLabels.headerStyle),
      controlSize: randomFrom(designLabels.controlSize),
      cardTone: randomFrom(designLabels.cardTone),
      contrast: randomFrom(designLabels.contrast),
      glassPower: randomFrom(designLabels.glassPower),
      accentMode: randomFrom(designLabels.accentMode),
      columnColorMode: randomFrom(designLabels.columnColorMode),
      accent: randomHex()
    };
    Object.entries(randomSettings).forEach(([key, value]) => {
      const fields = form.querySelectorAll(`[name="${cssEscape(key)}"]`);
      fields.forEach((field) => {
        if (field.type === 'radio') field.checked = field.value === value;
        else field.value = value;
      });
    });
    applyCurrent();
  });

  document.getElementById('togglePreviewBtn')?.addEventListener('click', (event) => {
    const panel = document.getElementById('designPreviewSide');
    if (!panel) return;
    panel.classList.toggle('is-collapsed');
    event.currentTarget.textContent = panel.classList.contains('is-collapsed') ? tr('Показать') : tr('Скрыть');
  });

  updateDesignUiState();
  document.getElementById('resetDesignBtn')?.addEventListener('click', async () => {
    applyVisualSettings(defaultDesign);
    try {
      const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify({ designSettings: defaultDesign }) });
      state.user = data.user;
      state.message = tr('Дизайн сброшен к базовому виду.');
      renderProfileSettings();
    } catch (error) {
      state.error = error.message;
      renderProfileSettings();
    }
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const designSettings = readDesignForm();
    try {
      const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify({ designSettings }) });
      state.user = data.user;
      state.message = tr('Дизайн сайта сохранён.');
      renderProfileSettings();
    } catch (error) {
      state.error = error.message;
      renderProfileSettings();
    }
  });
}

function readSystemForm() {
  const form = document.getElementById('systemForm');
  if (!form) return currentSystem();
  return normalizeSystem(Object.fromEntries(new FormData(form).entries()));
}

function bindSystemSettings() {
  const form = document.getElementById('systemForm');
  if (!form) return;
  let languageRenderTimer = null;
  const applyCurrent = (event) => {
    const systemSettings = readSystemForm();
    applySystemSettings(systemSettings);
    if (state.user) state.user.systemSettings = systemSettings;
    if (event?.target?.name === 'language') {
      clearTimeout(languageRenderTimer);
      languageRenderTimer = setTimeout(async () => {
        try {
          const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify({ systemSettings }) });
          state.user = data.user;
        } catch (error) {
          state.error = error.message;
        }
        renderProfileSettings();
      }, 120);
    }
  };
  form.addEventListener('input', applyCurrent);
  form.addEventListener('change', applyCurrent);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const systemSettings = readSystemForm();
    try {
      const data = await api('/api/profile', { method: 'PATCH', body: JSON.stringify({ systemSettings }) });
      state.user = data.user;
      state.message = tr('Системные настройки сохранены.');
      renderProfileSettings();
    } catch (error) {
      state.error = error.message;
      renderProfileSettings();
    }
  });
}

function renderPricing() {
  app.innerHTML = layout(`
    <section class="profile-page public-pricing-page">
      <div class="profile-hero">
        <div class="profile-title no-mark"><div><span class="eyebrow">${escapeHtml(tr('Публичная версия тарифов'))}</span><h1>${escapeHtml(tr('Тарифы'))}</h1><p class="muted">${escapeHtml(tr('Выбери уровень доступа'))}</p></div></div>
        <div class="nav"><a href="${state.user ? '/profile/tariffs' : '/register'}" data-link class="btn">${escapeHtml(tr('Перейти к регистрации'))}</a></div>
      </div>
      <div class="price-grid">${plans.map(planCard).join('')}</div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/pricing', label: 'Тарифы' }]) });
  document.querySelectorAll('.choose-plan').forEach((button) => {
    button.addEventListener('click', () => navigate(state.user ? '/profile/tariffs' : '/register'));
  });
}

function renderQuality() {
  app.innerHTML = layout(`
    <section class="info-page quality-page">
      <div class="section-heading info-heading"><span class="eyebrow">UX/UI</span><h1>${escapeHtml(tr('Качество проекта'))}</h1><p>${escapeHtml(tr('Эта страница показывает, что сайт собран не как набор экранов, а как коммерческий веб-продукт с UX/UI-логикой.'))}</p></div>
      <div class="method-grid">
        <article class="method-card"><span>IA</span><h2>${escapeHtml(tr('Информационная архитектура'))}</h2><p>${escapeHtml(tr('Гибридная структура: лендинг ведёт линейно к регистрации, личный кабинет устроен иерархически, а настройки и тарифы связаны сетевыми переходами.'))}</p></article>
        <article class="method-card"><span>UI</span><h2>${escapeHtml(tr('Графический дизайн UI'))}</h2><p>${escapeHtml(tr('Сетка, визуальная иерархия, единые карточки, читабельные шрифты и управляемые акцентные цвета.'))}</p></article>
        <article class="method-card"><span>UX</span><h2>${escapeHtml(tr('Юзабилити-тестирование'))}</h2><p>${escapeHtml(tr('Для проверки предусмотрены тестовые задания, метрики времени, ошибок, отклонений и повторная проверка после исправлений.'))}</p></article>
      </div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/quality', label: 'Качество проекта' }]) });
}

function renderHelp() {
  app.innerHTML = layout(`
    <section class="info-page">
      <div class="section-heading info-heading"><span class="eyebrow">HELP</span><h1>${escapeHtml(tr('Центр помощи DUT'))}</h1><p>${escapeHtml(tr('Короткие ответы для пользователя и проверяющего.'))}</p></div>
      <div class="help-grid">
        ${featureCard('1', 'Как создать задачу?', 'Открой доску и нажми кнопку добавления в нужной колонке. На Pro можно добавить сроки, на Max — цветовую метку.')}
        ${featureCard('2', 'Как проверить тарифы?', 'Открой страницу тарифов в профиле или публичную страницу тарифов. Выбор тарифа сразу меняет доступные функции.')}
        ${featureCard('3', 'Как сменить язык?', 'Открой настройки системы, выбери язык и сохрани. Интерфейс и палитры задач обновятся сразу.')}
        ${featureCard('4', 'Что делать при ошибке?', 'Сообщение показывается человеческим языком. Пользователь может исправить данные или вернуться на предыдущий шаг.')}
      </div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/help', label: 'Помощь' }]) });
}

function renderContact() {
  app.innerHTML = layout(`
    <section class="info-page contact-page">
      <div class="section-heading info-heading"><span class="eyebrow">SUPPORT</span><h1>${escapeHtml(tr('Связаться с поддержкой'))}</h1><p>${escapeHtml(tr('Форма демонстрационная: она показывает сценарий обращения и сохраняет заявку на backend.'))}</p></div>
      <form class="contact-card" id="contactForm">
        <div id="contactMessage" aria-live="polite"></div>
        <div class="form-two"><div class="form-group"><label>${escapeHtml(tr('Ваше имя'))}</label><input class="input" name="name" value="${escapeHtml(state.user?.name || '')}" required /></div><div class="form-group"><label>${escapeHtml(tr('Email'))}</label><input class="input" name="email" type="email" value="${escapeHtml(state.user?.email || '')}" required /></div></div>
        <div class="form-group"><label>${escapeHtml(tr('Тема обращения'))}</label><input class="input" name="topic" required /></div>
        <div class="form-group"><label>${escapeHtml(tr('Сообщение'))}</label><textarea class="textarea" name="message" required minlength="10"></textarea></div>
        <label class="checkbox-line"><input type="checkbox" name="consent" required /><span>${escapeHtml(tr('Я согласен на обработку обращения'))}</span></label>
        <button class="btn" type="submit">${escapeHtml(tr('Отправить обращение'))}</button>
      </form>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/contact', label: 'Контакты' }]) });
  document.getElementById('contactForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = document.getElementById('contactMessage');
    message.innerHTML = '';
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) });
      event.currentTarget.reset();
      message.innerHTML = `<div class="success inline-message" role="status">${escapeHtml(tr('Обращение сохранено на сервере. В рабочем продукте оно ушло бы в поддержку.'))}</div>`;
    } catch (error) {
      message.innerHTML = `<div class="error inline-message" role="alert">${escapeHtml(error.message)}</div>`;
    }
  });
}

function legalCard(title, text) {
  return `<article class="legal-card"><h2>${escapeHtml(tr(title))}</h2><p>${escapeHtml(tr(text))}</p></article>`;
}

function renderPrivacy() {
  app.innerHTML = layout(`
    <section class="info-page legal-page">
      <div class="section-heading info-heading"><span class="eyebrow">LEGAL</span><h1>${escapeHtml(tr('Политика конфиденциальности'))}</h1><p>${escapeHtml(tr('Короткая версия для учебного проекта DUT.'))}</p></div>
      <div class="legal-grid">
        ${legalCard('Какие данные хранятся', 'Имя, email, настройки профиля, доска, колонки и задачи пользователя.')}
        ${legalCard('Как защищён вход', 'Пароль не хранится открытым текстом, а сессия работает через HttpOnly cookie.')}
        ${legalCard('Управление данными', 'Пользователь может изменить профиль, настройки и удалить созданные задачи.')}
      </div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/privacy', label: 'Конфиденциальность' }]) });
}

function renderTerms() {
  app.innerHTML = layout(`
    <section class="info-page legal-page">
      <div class="section-heading info-heading"><span class="eyebrow">LEGAL</span><h1>${escapeHtml(tr('Правила использования'))}</h1><p>${escapeHtml(tr('Учебная версия правил для демонстрации коммерческого SaaS.'))}</p></div>
      <div class="legal-grid">
        ${legalCard('Назначение сервиса', 'DUT предназначен для управления личными, учебными и командными задачами.')}
        ${legalCard('Ограничения тарифов', 'Free, Pro и Max отличаются количеством функций, колонок и кастомизацией.')}
        ${legalCard('Ответственность пользователя', 'Пользователь отвечает за корректность введённых данных и содержание своих задач.')}
      </div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/terms', label: 'Правила сервиса' }]) });
}

function renderSitemap() {
  const links = [['/', 'Главная'], ['/pricing', 'Тарифы'], ['/privacy', 'Конфиденциальность'], ['/terms', 'Правила сервиса'], ['/register', 'Регистрация'], ['/login', 'Вход'], ['/dashboard', 'Моя доска'], ['/profile', 'Профиль']];
  app.innerHTML = layout(`
    <section class="info-page sitemap-page">
      <article class="sitemap-card"><span class="eyebrow">MAP</span><h1>${escapeHtml(tr('Карта сайта'))}</h1><div class="sitemap-list">${links.map(([href, label]) => `<a href="${href}" data-link>${escapeHtml(tr(label))}</a>`).join('')}</div></article>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: '/sitemap', label: 'Карта сайта' }]) });
}

function renderNotFound() {
  app.innerHTML = layout(`
    <section class="info-page not-found-page">
      <div class="legal-card not-found-card"><span class="eyebrow">404</span><h1>${escapeHtml(tr('Страница не найдена'))}</h1><p>${escapeHtml(tr('Такого раздела нет или ссылка устарела.'))}</p><a href="/" data-link class="button">${escapeHtml(tr('Вернуться на главную'))}</a></div>
    </section>
  `, { breadcrumbs: breadcrumbs([{ href: window.location.pathname, label: 'Страница не найдена' }]) });
}

function bindLogout() {
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST' }).catch(() => null);
    stopSupportPolling();
    state = { user: null, board: null, columns: [], tasks: [], message: '', error: '', dragTaskId: null, filters: { taskQuery: '', status: 'all' }, supportOpen: false, supportThread: null, supportLoading: false, supportError: '', supportUnread: 0, supportLastSeenAdminMessageId: '' };
    applyVisualSettings(getStoredDesign());
    navigate('/login');
  });
}

async function renderRoute() {
  try { await loadMe(); } catch { state.user = null; applyVisualSettings(getStoredDesign()); applySystemSettings(getStoredSystem()); }
  const path = window.location.pathname;
  if (path === '/') return renderHome();
  if (path === '/register') return renderAuth('register');
  if (path === '/login') return renderAuth('login');
  if (path === '/dashboard') return renderDashboard();
  if (path === '/profile/tariffs') return renderProfileTariffs();
  if (path === '/profile/settings') return renderProfileSettings();
  if (path === '/profile/info') return renderProfile();
  if (path === '/profile') return renderProfile();
  if (path === '/pricing') return renderPricing();
  if (path === '/help') return renderHelp();
  if (path === '/contact' || path === '/contacts') return renderContact();
  if (path === '/privacy') return renderPrivacy();
  if (path === '/terms') return renderTerms();
  if (path === '/sitemap') return renderSitemap();
  return renderNotFound();
}

setInterval(() => {
  if (!document.hidden && window.location.pathname === '/dashboard') renderDashboard();
}, 60_000);


['(max-width: 760px)', '(pointer: coarse)'].forEach((query) => {
  const media = window.matchMedia(query);
  const handleChange = () => setMobilePerformanceFlags();
  if (typeof media.addEventListener === 'function') media.addEventListener('change', handleChange);
  else if (typeof media.addListener === 'function') media.addListener(handleChange);
});

applyVisualSettings(getStoredDesign());
applySystemSettings(getStoredSystem());
renderRoute();
