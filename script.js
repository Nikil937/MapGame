/* ============================================================================
 * ГеоСтолицы — угадай страну на карте и её столицу
 * Чистый JavaScript, без фреймворков.
 *
 * Архитектура намеренно разбита на слои, чтобы позже было легко добавить:
 *   - все страны мира (просто дополняем массив COUNTRIES);
 *   - таймер, лидерборд, аккаунты, сохранение прогресса (модуль state + storage);
 *   - уровни сложности и режим тренировки ошибок (фильтры в buildQueue).
 * ========================================================================== */

'use strict';

/* ----------------------------------------------------------------------------
 * 1. ДАННЫЕ: страны
 *    iso  — ISO 3166-1 alpha-2 (совпадает с id элемента на SVG-карте).
 *    continent — один из: Европа, Азия, Африка, Северная Америка,
 *                Южная Америка, Океания.
 *    capitalAliases — допустимые варианты ответа (рус./англ./альтернативы).
 *    Само название столицы (capital) в проверку добавляется автоматически.
 * -------------------------------------------------------------------------- */
const COUNTRIES = [
  /* ---------- Европа ---------- */
  { country: 'Франция',        capital: 'Париж',       iso: 'FR', continent: 'Европа', capitalAliases: ['Paris'] },
  { country: 'Германия',       capital: 'Берлин',      iso: 'DE', continent: 'Европа', capitalAliases: ['Berlin'] },
  { country: 'Италия',         capital: 'Рим',         iso: 'IT', continent: 'Европа', capitalAliases: ['Rome', 'Roma'] },
  { country: 'Испания',        capital: 'Мадрид',      iso: 'ES', continent: 'Европа', capitalAliases: ['Madrid'] },
  { country: 'Португалия',     capital: 'Лиссабон',    iso: 'PT', continent: 'Европа', capitalAliases: ['Lisbon', 'Lisboa'] },
  { country: 'Великобритания', capital: 'Лондон',      iso: 'GB', continent: 'Европа', capitalAliases: ['London'] },
  { country: 'Ирландия',       capital: 'Дублин',      iso: 'IE', continent: 'Европа', capitalAliases: ['Dublin'] },
  { country: 'Нидерланды',     capital: 'Амстердам',   iso: 'NL', continent: 'Европа', capitalAliases: ['Amsterdam'] },
  { country: 'Бельгия',        capital: 'Брюссель',    iso: 'BE', continent: 'Европа', capitalAliases: ['Brussels', 'Bruxelles'] },
  { country: 'Люксембург',     capital: 'Люксембург',  iso: 'LU', continent: 'Европа', capitalAliases: ['Luxembourg'] },
  { country: 'Швейцария',      capital: 'Берн',        iso: 'CH', continent: 'Европа', capitalAliases: ['Bern', 'Berne'] },
  { country: 'Австрия',        capital: 'Вена',        iso: 'AT', continent: 'Европа', capitalAliases: ['Vienna', 'Wien'] },
  { country: 'Польша',         capital: 'Варшава',     iso: 'PL', continent: 'Европа', capitalAliases: ['Warsaw', 'Warszawa'] },
  { country: 'Чехия',          capital: 'Прага',       iso: 'CZ', continent: 'Европа', capitalAliases: ['Prague', 'Praha'] },
  { country: 'Словакия',       capital: 'Братислава',  iso: 'SK', continent: 'Европа', capitalAliases: ['Bratislava'] },
  { country: 'Венгрия',        capital: 'Будапешт',    iso: 'HU', continent: 'Европа', capitalAliases: ['Budapest'] },
  { country: 'Румыния',        capital: 'Бухарест',    iso: 'RO', continent: 'Европа', capitalAliases: ['Bucharest', 'Bucuresti'] },
  { country: 'Болгария',       capital: 'София',       iso: 'BG', continent: 'Европа', capitalAliases: ['Sofia'] },
  { country: 'Греция',         capital: 'Афины',       iso: 'GR', continent: 'Европа', capitalAliases: ['Athens'] },
  { country: 'Хорватия',       capital: 'Загреб',      iso: 'HR', continent: 'Европа', capitalAliases: ['Zagreb'] },
  { country: 'Словения',       capital: 'Любляна',     iso: 'SI', continent: 'Европа', capitalAliases: ['Ljubljana'] },
  { country: 'Сербия',         capital: 'Белград',     iso: 'RS', continent: 'Европа', capitalAliases: ['Belgrade', 'Beograd'] },
  { country: 'Босния и Герцеговина', capital: 'Сараево', iso: 'BA', continent: 'Европа', capitalAliases: ['Sarajevo'] },
  { country: 'Черногория',     capital: 'Подгорица',   iso: 'ME', continent: 'Европа', capitalAliases: ['Podgorica'] },
  { country: 'Северная Македония', capital: 'Скопье',  iso: 'MK', continent: 'Европа', capitalAliases: ['Skopje'] },
  { country: 'Албания',        capital: 'Тирана',      iso: 'AL', continent: 'Европа', capitalAliases: ['Tirana'] },
  { country: 'Украина',        capital: 'Киев',        iso: 'UA', continent: 'Европа', capitalAliases: ['Kyiv', 'Kiev'] },
  { country: 'Беларусь',       capital: 'Минск',       iso: 'BY', continent: 'Европа', capitalAliases: ['Minsk'] },
  { country: 'Молдова',        capital: 'Кишинёв',     iso: 'MD', continent: 'Европа', capitalAliases: ['Chisinau'] },
  { country: 'Литва',          capital: 'Вильнюс',     iso: 'LT', continent: 'Европа', capitalAliases: ['Vilnius'] },
  { country: 'Латвия',         capital: 'Рига',        iso: 'LV', continent: 'Европа', capitalAliases: ['Riga'] },
  { country: 'Эстония',        capital: 'Таллин',      iso: 'EE', continent: 'Европа', capitalAliases: ['Tallinn'] },
  { country: 'Финляндия',      capital: 'Хельсинки',   iso: 'FI', continent: 'Европа', capitalAliases: ['Helsinki'] },
  { country: 'Швеция',         capital: 'Стокгольм',   iso: 'SE', continent: 'Европа', capitalAliases: ['Stockholm'] },
  { country: 'Норвегия',       capital: 'Осло',        iso: 'NO', continent: 'Европа', capitalAliases: ['Oslo'] },
  { country: 'Дания',          capital: 'Копенгаген',  iso: 'DK', continent: 'Европа', capitalAliases: ['Copenhagen', 'Kobenhavn'] },
  { country: 'Исландия',       capital: 'Рейкьявик',   iso: 'IS', continent: 'Европа', capitalAliases: ['Reykjavik'] },
  { country: 'Россия',         capital: 'Москва',      iso: 'RU', continent: 'Европа', capitalAliases: ['Moscow'] },
  { country: 'Мальта',         capital: 'Валлетта',    iso: 'MT', continent: 'Европа', capitalAliases: ['Valletta'] },
  { country: 'Кипр',           capital: 'Никосия',     iso: 'CY', continent: 'Европа', capitalAliases: ['Nicosia'] },

  /* ---------- Азия ---------- */
  { country: 'Китай',          capital: 'Пекин',       iso: 'CN', continent: 'Азия', capitalAliases: ['Beijing', 'Peking'] },
  { country: 'Япония',         capital: 'Токио',       iso: 'JP', continent: 'Азия', capitalAliases: ['Tokyo'] },
  { country: 'Южная Корея',    capital: 'Сеул',        iso: 'KR', continent: 'Азия', capitalAliases: ['Seoul'] },
  { country: 'Северная Корея', capital: 'Пхеньян',     iso: 'KP', continent: 'Азия', capitalAliases: ['Pyongyang'] },
  { country: 'Монголия',       capital: 'Улан-Батор',  iso: 'MN', continent: 'Азия', capitalAliases: ['Ulaanbaatar', 'Ulan Bator'] },
  { country: 'Индия',          capital: 'Нью-Дели',    iso: 'IN', continent: 'Азия', capitalAliases: ['New Delhi', 'Дели', 'Delhi'] },
  { country: 'Пакистан',       capital: 'Исламабад',   iso: 'PK', continent: 'Азия', capitalAliases: ['Islamabad'] },
  { country: 'Бангладеш',      capital: 'Дакка',       iso: 'BD', continent: 'Азия', capitalAliases: ['Dhaka'] },
  { country: 'Непал',          capital: 'Катманду',    iso: 'NP', continent: 'Азия', capitalAliases: ['Kathmandu'] },
  { country: 'Бутан',          capital: 'Тхимпху',     iso: 'BT', continent: 'Азия', capitalAliases: ['Thimphu'] },
  { country: 'Шри-Ланка',      capital: 'Шри-Джаяварденепура-Котте', iso: 'LK', continent: 'Азия', capitalAliases: ['Sri Jayawardenepura Kotte', 'Коломбо', 'Colombo'] },
  { country: 'Мальдивы',       capital: 'Мале',        iso: 'MV', continent: 'Азия', capitalAliases: ['Male'] },
  { country: 'Мьянма',         capital: 'Нейпьидо',    iso: 'MM', continent: 'Азия', capitalAliases: ['Naypyidaw', 'Нейпьидав'] },
  { country: 'Таиланд',        capital: 'Бангкок',     iso: 'TH', continent: 'Азия', capitalAliases: ['Bangkok'] },
  { country: 'Камбоджа',       capital: 'Пномпень',    iso: 'KH', continent: 'Азия', capitalAliases: ['Phnom Penh'] },
  { country: 'Лаос',           capital: 'Вьентьян',    iso: 'LA', continent: 'Азия', capitalAliases: ['Vientiane'] },
  { country: 'Вьетнам',        capital: 'Ханой',       iso: 'VN', continent: 'Азия', capitalAliases: ['Hanoi'] },
  { country: 'Малайзия',       capital: 'Куала-Лумпур',iso: 'MY', continent: 'Азия', capitalAliases: ['Kuala Lumpur'] },
  { country: 'Сингапур',       capital: 'Сингапур',    iso: 'SG', continent: 'Азия', capitalAliases: ['Singapore'] },
  { country: 'Индонезия',      capital: 'Джакарта',    iso: 'ID', continent: 'Азия', capitalAliases: ['Jakarta'] },
  { country: 'Филиппины',      capital: 'Манила',      iso: 'PH', continent: 'Азия', capitalAliases: ['Manila'] },
  { country: 'Бруней',         capital: 'Бандар-Сери-Бегаван', iso: 'BN', continent: 'Азия', capitalAliases: ['Bandar Seri Begawan'] },
  { country: 'Казахстан',      capital: 'Астана',      iso: 'KZ', continent: 'Азия', capitalAliases: ['Astana', 'Нур-Султан', 'Nur-Sultan'] },
  { country: 'Узбекистан',     capital: 'Ташкент',     iso: 'UZ', continent: 'Азия', capitalAliases: ['Tashkent'] },
  { country: 'Туркменистан',   capital: 'Ашхабад',     iso: 'TM', continent: 'Азия', capitalAliases: ['Ashgabat'] },
  { country: 'Киргизия',       capital: 'Бишкек',      iso: 'KG', continent: 'Азия', capitalAliases: ['Bishkek', 'Кыргызстан'] },
  { country: 'Таджикистан',    capital: 'Душанбе',     iso: 'TJ', continent: 'Азия', capitalAliases: ['Dushanbe'] },
  { country: 'Афганистан',     capital: 'Кабул',       iso: 'AF', continent: 'Азия', capitalAliases: ['Kabul'] },
  { country: 'Иран',           capital: 'Тегеран',     iso: 'IR', continent: 'Азия', capitalAliases: ['Tehran'] },
  { country: 'Ирак',           capital: 'Багдад',      iso: 'IQ', continent: 'Азия', capitalAliases: ['Baghdad'] },
  { country: 'Саудовская Аравия', capital: 'Эр-Рияд',  iso: 'SA', continent: 'Азия', capitalAliases: ['Riyadh'] },
  { country: 'ОАЭ',            capital: 'Абу-Даби',    iso: 'AE', continent: 'Азия', capitalAliases: ['Abu Dhabi'] },
  { country: 'Катар',          capital: 'Доха',        iso: 'QA', continent: 'Азия', capitalAliases: ['Doha'] },
  { country: 'Кувейт',         capital: 'Эль-Кувейт',  iso: 'KW', continent: 'Азия', capitalAliases: ['Kuwait City', 'Кувейт'] },
  { country: 'Оман',           capital: 'Маскат',      iso: 'OM', continent: 'Азия', capitalAliases: ['Muscat'] },
  { country: 'Йемен',          capital: 'Сана',        iso: 'YE', continent: 'Азия', capitalAliases: ['Sanaa', 'Sana'] },
  { country: 'Иордания',       capital: 'Амман',       iso: 'JO', continent: 'Азия', capitalAliases: ['Amman'] },
  { country: 'Ливан',          capital: 'Бейрут',      iso: 'LB', continent: 'Азия', capitalAliases: ['Beirut'] },
  { country: 'Сирия',          capital: 'Дамаск',      iso: 'SY', continent: 'Азия', capitalAliases: ['Damascus'] },
  { country: 'Израиль',        capital: 'Иерусалим',   iso: 'IL', continent: 'Азия', capitalAliases: ['Jerusalem'] },
  { country: 'Турция',         capital: 'Анкара',      iso: 'TR', continent: 'Азия', capitalAliases: ['Ankara'] },
  { country: 'Грузия',         capital: 'Тбилиси',     iso: 'GE', continent: 'Азия', capitalAliases: ['Tbilisi'] },
  { country: 'Армения',        capital: 'Ереван',      iso: 'AM', continent: 'Азия', capitalAliases: ['Yerevan'] },
  { country: 'Азербайджан',    capital: 'Баку',        iso: 'AZ', continent: 'Азия', capitalAliases: ['Baku'] },
  { country: 'Тайвань',        capital: 'Тайбэй',      iso: 'TW', continent: 'Азия', capitalAliases: ['Taipei', 'Тайпей'] },

  /* ---------- Африка ---------- */
  { country: 'Египет',         capital: 'Каир',        iso: 'EG', continent: 'Африка', capitalAliases: ['Cairo'] },
  { country: 'Ливия',          capital: 'Триполи',     iso: 'LY', continent: 'Африка', capitalAliases: ['Tripoli'] },
  { country: 'Тунис',          capital: 'Тунис',       iso: 'TN', continent: 'Африка', capitalAliases: ['Tunis'] },
  { country: 'Алжир',          capital: 'Алжир',       iso: 'DZ', continent: 'Африка', capitalAliases: ['Algiers'] },
  { country: 'Марокко',        capital: 'Рабат',       iso: 'MA', continent: 'Африка', capitalAliases: ['Rabat'] },
  { country: 'Судан',          capital: 'Хартум',      iso: 'SD', continent: 'Африка', capitalAliases: ['Khartoum'] },
  { country: 'Южный Судан',    capital: 'Джуба',       iso: 'SS', continent: 'Африка', capitalAliases: ['Juba'] },
  { country: 'Эфиопия',        capital: 'Аддис-Абеба', iso: 'ET', continent: 'Африка', capitalAliases: ['Addis Ababa'] },
  { country: 'Эритрея',        capital: 'Асмэра',      iso: 'ER', continent: 'Африка', capitalAliases: ['Asmara', 'Асмара'] },
  { country: 'Джибути',        capital: 'Джибути',     iso: 'DJ', continent: 'Африка', capitalAliases: ['Djibouti'] },
  { country: 'Сомали',         capital: 'Могадишо',    iso: 'SO', continent: 'Африка', capitalAliases: ['Mogadishu'] },
  { country: 'Кения',          capital: 'Найроби',     iso: 'KE', continent: 'Африка', capitalAliases: ['Nairobi'] },
  { country: 'Танзания',       capital: 'Додома',      iso: 'TZ', continent: 'Африка', capitalAliases: ['Dodoma', 'Дар-эс-Салам', 'Dar es Salaam'] },
  { country: 'Уганда',         capital: 'Кампала',     iso: 'UG', continent: 'Африка', capitalAliases: ['Kampala'] },
  { country: 'Руанда',         capital: 'Кигали',      iso: 'RW', continent: 'Африка', capitalAliases: ['Kigali'] },
  { country: 'Бурунди',        capital: 'Гитега',      iso: 'BI', continent: 'Африка', capitalAliases: ['Gitega', 'Бужумбура', 'Bujumbura'] },
  { country: 'ДР Конго',       capital: 'Киншаса',     iso: 'CD', continent: 'Африка', capitalAliases: ['Kinshasa'] },
  { country: 'Республика Конго', capital: 'Браззавиль',iso: 'CG', continent: 'Африка', capitalAliases: ['Brazzaville'] },
  { country: 'ЦАР',            capital: 'Банги',       iso: 'CF', continent: 'Африка', capitalAliases: ['Bangui', 'Центральноафриканская Республика'] },
  { country: 'Камерун',        capital: 'Яунде',       iso: 'CM', continent: 'Африка', capitalAliases: ['Yaounde'] },
  { country: 'Нигерия',        capital: 'Абуджа',      iso: 'NG', continent: 'Африка', capitalAliases: ['Abuja'] },
  { country: 'Нигер',          capital: 'Ниамей',      iso: 'NE', continent: 'Африка', capitalAliases: ['Niamey'] },
  { country: 'Чад',            capital: 'Нджамена',    iso: 'TD', continent: 'Африка', capitalAliases: ["N'Djamena"] },
  { country: 'Мали',           capital: 'Бамако',      iso: 'ML', continent: 'Африка', capitalAliases: ['Bamako'] },
  { country: 'Буркина-Фасо',   capital: 'Уагадугу',    iso: 'BF', continent: 'Африка', capitalAliases: ['Ouagadougou'] },
  { country: 'Сенегал',        capital: 'Дакар',       iso: 'SN', continent: 'Африка', capitalAliases: ['Dakar'] },
  { country: 'Гвинея',         capital: 'Конакри',     iso: 'GN', continent: 'Африка', capitalAliases: ['Conakry'] },
  { country: 'Кот-д’Ивуар',    capital: 'Ямусукро',    iso: 'CI', continent: 'Африка', capitalAliases: ['Yamoussoukro', 'Абиджан', 'Abidjan'] },
  { country: 'Гана',           capital: 'Аккра',       iso: 'GH', continent: 'Африка', capitalAliases: ['Accra'] },
  { country: 'Того',           capital: 'Ломе',        iso: 'TG', continent: 'Африка', capitalAliases: ['Lome'] },
  { country: 'Бенин',          capital: 'Порто-Ново',  iso: 'BJ', continent: 'Африка', capitalAliases: ['Porto-Novo', 'Котону', 'Cotonou'] },
  { country: 'Габон',          capital: 'Либревиль',   iso: 'GA', continent: 'Африка', capitalAliases: ['Libreville'] },
  { country: 'Экваториальная Гвинея', capital: 'Малабо', iso: 'GQ', continent: 'Африка', capitalAliases: ['Malabo'] },
  { country: 'Ангола',         capital: 'Луанда',      iso: 'AO', continent: 'Африка', capitalAliases: ['Luanda'] },
  { country: 'Замбия',         capital: 'Лусака',      iso: 'ZM', continent: 'Африка', capitalAliases: ['Lusaka'] },
  { country: 'Зимбабве',       capital: 'Хараре',      iso: 'ZW', continent: 'Африка', capitalAliases: ['Harare'] },
  { country: 'Мозамбик',       capital: 'Мапуту',      iso: 'MZ', continent: 'Африка', capitalAliases: ['Maputo'] },
  { country: 'Малави',         capital: 'Лилонгве',    iso: 'MW', continent: 'Африка', capitalAliases: ['Lilongwe'] },
  { country: 'ЮАР',            capital: 'Претория',    iso: 'ZA', continent: 'Африка', capitalAliases: ['Pretoria', 'Кейптаун', 'Cape Town', 'Блумфонтейн', 'Bloemfontein'] },
  { country: 'Намибия',        capital: 'Виндхук',     iso: 'NA', continent: 'Африка', capitalAliases: ['Windhoek'] },
  { country: 'Ботсвана',       capital: 'Габороне',    iso: 'BW', continent: 'Африка', capitalAliases: ['Gaborone'] },
  { country: 'Лесото',         capital: 'Масеру',      iso: 'LS', continent: 'Африка', capitalAliases: ['Maseru'] },
  { country: 'Эсватини',       capital: 'Мбабане',     iso: 'SZ', continent: 'Африка', capitalAliases: ['Mbabane', 'Свазиленд'] },
  { country: 'Мадагаскар',     capital: 'Антананариву',iso: 'MG', continent: 'Африка', capitalAliases: ['Antananarivo'] },
  { country: 'Маврикий',       capital: 'Порт-Луи',    iso: 'MU', continent: 'Африка', capitalAliases: ['Port Louis'] },
  { country: 'Гамбия',         capital: 'Банжул',      iso: 'GM', continent: 'Африка', capitalAliases: ['Banjul'] },
  { country: 'Гвинея-Бисау',   capital: 'Бисау',       iso: 'GW', continent: 'Африка', capitalAliases: ['Bissau'] },
  { country: 'Либерия',        capital: 'Монровия',    iso: 'LR', continent: 'Африка', capitalAliases: ['Monrovia'] },
  { country: 'Сьерра-Леоне',   capital: 'Фритаун',     iso: 'SL', continent: 'Африка', capitalAliases: ['Freetown'] },
  { country: 'Мавритания',     capital: 'Нуакшот',     iso: 'MR', continent: 'Африка', capitalAliases: ['Nouakchott'] },
  { country: 'Кабо-Верде',     capital: 'Прая',        iso: 'CV', continent: 'Африка', capitalAliases: ['Praia'] },
  { country: 'Сан-Томе и Принсипи', capital: 'Сан-Томе', iso: 'ST', continent: 'Африка', capitalAliases: ['Sao Tome'] },
  { country: 'Коморы',         capital: 'Морони',      iso: 'KM', continent: 'Африка', capitalAliases: ['Moroni'] },
  { country: 'Сейшелы',        capital: 'Виктория',    iso: 'SC', continent: 'Африка', capitalAliases: ['Victoria'] },

  /* ---------- Северная Америка ---------- */
  { country: 'США',            capital: 'Вашингтон',   iso: 'US', continent: 'Северная Америка', capitalAliases: ['Washington', 'Washington D.C.', 'Вашингтон округ Колумбия'] },
  { country: 'Канада',         capital: 'Оттава',      iso: 'CA', continent: 'Северная Америка', capitalAliases: ['Ottawa'] },
  { country: 'Мексика',        capital: 'Мехико',      iso: 'MX', continent: 'Северная Америка', capitalAliases: ['Mexico City', 'Ciudad de Mexico'] },
  { country: 'Гватемала',      capital: 'Гватемала',   iso: 'GT', continent: 'Северная Америка', capitalAliases: ['Guatemala City'] },
  { country: 'Белиз',          capital: 'Бельмопан',   iso: 'BZ', continent: 'Северная Америка', capitalAliases: ['Belmopan'] },
  { country: 'Сальвадор',      capital: 'Сан-Сальвадор', iso: 'SV', continent: 'Северная Америка', capitalAliases: ['San Salvador'] },
  { country: 'Гондурас',       capital: 'Тегусигальпа',iso: 'HN', continent: 'Северная Америка', capitalAliases: ['Tegucigalpa'] },
  { country: 'Никарагуа',      capital: 'Манагуа',     iso: 'NI', continent: 'Северная Америка', capitalAliases: ['Managua'] },
  { country: 'Коста-Рика',     capital: 'Сан-Хосе',    iso: 'CR', continent: 'Северная Америка', capitalAliases: ['San Jose'] },
  { country: 'Панама',         capital: 'Панама',      iso: 'PA', continent: 'Северная Америка', capitalAliases: ['Panama City'] },
  { country: 'Куба',           capital: 'Гавана',      iso: 'CU', continent: 'Северная Америка', capitalAliases: ['Havana', 'La Habana'] },
  { country: 'Гаити',          capital: 'Порт-о-Пренс',iso: 'HT', continent: 'Северная Америка', capitalAliases: ['Port-au-Prince'] },
  { country: 'Доминиканская Республика', capital: 'Санто-Доминго', iso: 'DO', continent: 'Северная Америка', capitalAliases: ['Santo Domingo'] },
  { country: 'Ямайка',         capital: 'Кингстон',    iso: 'JM', continent: 'Северная Америка', capitalAliases: ['Kingston'] },
  { country: 'Багамы',         capital: 'Нассау',      iso: 'BS', continent: 'Северная Америка', capitalAliases: ['Nassau'] },
  { country: 'Доминика',       capital: 'Розо',        iso: 'DM', continent: 'Северная Америка', capitalAliases: ['Roseau'] },
  { country: 'Сент-Люсия',     capital: 'Кастри',      iso: 'LC', continent: 'Северная Америка', capitalAliases: ['Castries'] },
  { country: 'Сент-Винсент и Гренадины', capital: 'Кингстаун', iso: 'VC', continent: 'Северная Америка', capitalAliases: ['Kingstown'] },
  { country: 'Тринидад и Тобаго', capital: 'Порт-оф-Спейн', iso: 'TT', continent: 'Северная Америка', capitalAliases: ['Port of Spain', 'Порт-оф-Спен'] },

  /* ---------- Южная Америка ---------- */
  { country: 'Бразилия',       capital: 'Бразилиа',    iso: 'BR', continent: 'Южная Америка', capitalAliases: ['Brasilia', 'Бразилья'] },
  { country: 'Аргентина',      capital: 'Буэнос-Айрес',iso: 'AR', continent: 'Южная Америка', capitalAliases: ['Buenos Aires'] },
  { country: 'Чили',           capital: 'Сантьяго',    iso: 'CL', continent: 'Южная Америка', capitalAliases: ['Santiago'] },
  { country: 'Уругвай',        capital: 'Монтевидео',  iso: 'UY', continent: 'Южная Америка', capitalAliases: ['Montevideo'] },
  { country: 'Парагвай',       capital: 'Асунсьон',    iso: 'PY', continent: 'Южная Америка', capitalAliases: ['Asuncion'] },
  { country: 'Боливия',        capital: 'Сукре',       iso: 'BO', continent: 'Южная Америка', capitalAliases: ['Sucre', 'Ла-Пас', 'La Paz'] },
  { country: 'Перу',           capital: 'Лима',        iso: 'PE', continent: 'Южная Америка', capitalAliases: ['Lima'] },
  { country: 'Эквадор',        capital: 'Кито',        iso: 'EC', continent: 'Южная Америка', capitalAliases: ['Quito'] },
  { country: 'Колумбия',       capital: 'Богота',      iso: 'CO', continent: 'Южная Америка', capitalAliases: ['Bogota'] },
  { country: 'Венесуэла',      capital: 'Каракас',     iso: 'VE', continent: 'Южная Америка', capitalAliases: ['Caracas'] },
  { country: 'Гайана',         capital: 'Джорджтаун',  iso: 'GY', continent: 'Южная Америка', capitalAliases: ['Georgetown'] },
  { country: 'Суринам',        capital: 'Парамарибо',  iso: 'SR', continent: 'Южная Америка', capitalAliases: ['Paramaribo'] },

  /* ---------- Океания ---------- */
  { country: 'Австралия',      capital: 'Канберра',    iso: 'AU', continent: 'Океания', capitalAliases: ['Canberra'] },
  { country: 'Новая Зеландия', capital: 'Веллингтон',  iso: 'NZ', continent: 'Океания', capitalAliases: ['Wellington'] },
  { country: 'Папуа — Новая Гвинея', capital: 'Порт-Морсби', iso: 'PG', continent: 'Океания', capitalAliases: ['Port Moresby'] },
  { country: 'Вануату',        capital: 'Порт-Вила',   iso: 'VU', continent: 'Океания', capitalAliases: ['Port Vila'] },
  { country: 'Соломоновы Острова', capital: 'Хониара', iso: 'SB', continent: 'Океания', capitalAliases: ['Honiara'] },
];

/* ----------------------------------------------------------------------------
 * 2. РЕЖИМЫ ИГРЫ
 *    Каждый режим — предикат по стране.
 * -------------------------------------------------------------------------- */
const MODES = [
  { key: 'europe',        title: 'Европа',           filter: c => c.continent === 'Европа' },
  { key: 'asia',          title: 'Азия',             filter: c => c.continent === 'Азия' },
  { key: 'africa',        title: 'Африка',           filter: c => c.continent === 'Африка' },
  { key: 'north-america', title: 'Северная Америка', filter: c => c.continent === 'Северная Америка' },
  { key: 'south-america', title: 'Южная Америка',    filter: c => c.continent === 'Южная Америка' },
  { key: 'oceania',       title: 'Океания',          filter: c => c.continent === 'Океания' },
  { key: 'world',         title: 'Весь мир',         filter: () => true },
];

const POINTS = { green: 100, orange: 40, red: 0 };
const NEXT_DELAY_MS = 1200;   // пауза перед следующей страной
const FLASH_MS = 650;         // мигание ошибочно выбранной страны

/* ----------------------------------------------------------------------------
 * 3. СОСТОЯНИЕ ИГРЫ
 * -------------------------------------------------------------------------- */
const state = {
  queue: [],          // перемешанный список стран текущей игры
  index: 0,           // индекс текущей страны в queue
  score: 0,
  counts: { green: 0, orange: 0, red: 0 },
  results: [],        // [{country, result}] по порядку прохождения
  selectedIso: null,  // страна, выбранная кликом на карте (в верхнем регистре)
  capitalChosen: null,// выбранный вариант столицы (ещё не подтверждён)
  answering: false,   // блокировка ввода во время перехода к следующей стране
  inGame: false,      // идёт ли игра (разрешён ли выбор страны на карте)
  finished: false,
};

/* ----------------------------------------------------------------------------
 * 4. УТИЛИТЫ
 * -------------------------------------------------------------------------- */

// Нормализация ответа: регистр, пробелы, ё→е, дефисы, апострофы, точки.
function normalize(str) {
  return String(str)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[.'’`]/g, '')
    .replace(/[\s\-–—]+/g, ' ')
    .trim();
}

// Перемешивание Фишера–Йейтса (не мутирует исходный массив).
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Перемешивание массива (для вариантов ответа). Возвращает новый массив.
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---- Генерация вариантов ответа для столицы ---- */

// Множество всех реальных столиц (и их алиасов) — чтобы искажения
// случайно не совпали с настоящей столицей другой страны.
const REAL_CAPITALS = (() => {
  const set = new Set();
  COUNTRIES.forEach(c => {
    set.add(normalize(c.capital));
    c.capitalAliases.forEach(a => set.add(normalize(a)));
  });
  return set;
})();

const VOWELS = 'аеёиоуыэюя';
const CONS_PAIRS = {
  'п': 'б', 'б': 'п', 'с': 'з', 'з': 'с', 'т': 'д', 'д': 'т',
  'к': 'г', 'г': 'к', 'ж': 'ш', 'ш': 'ж', 'в': 'ф', 'ф': 'в',
  'л': 'р', 'р': 'л', 'м': 'н', 'н': 'м', 'х': 'к', 'ц': 'ч', 'ч': 'ц',
};

function ri(n) { return Math.floor(Math.random() * n); }
function isSep(ch) { return ch === '-' || ch === ' '; }

// Каждое слово с заглавной, остальное строчными (как в «Нью-Дели»),
// чтобы искажения выглядели ровно и не выдавали ответ регистром букв.
function titleCase(s) {
  let out = '', cap = true;
  for (const ch of s) {
    if (isSep(ch)) { out += ch; cap = true; }
    else { out += cap ? ch.toUpperCase() : ch.toLowerCase(); cap = false; }
  }
  return out;
}

// Заменить символ на позиции i, сохранив регистр исходного символа.
function replaceAt(s, i, ch) {
  const orig = s[i];
  const isUpper = orig === orig.toUpperCase() && orig !== orig.toLowerCase();
  return s.slice(0, i) + (isUpper ? ch.toUpperCase() : ch) + s.slice(i + 1);
}

// Набор искажающих преобразований. Каждое возвращает строку или null.
const TRANSFORMS = [
  function swap(s) {                       // переставить две соседние буквы
    for (let t = 0; t < 6; t++) {
      const i = ri(Math.max(1, s.length - 1));
      if (i + 1 < s.length && !isSep(s[i]) && !isSep(s[i + 1])) {
        return s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2);
      }
    }
    return null;
  },
  function replaceVowel(s) {               // заменить гласную на другую гласную
    const idx = [];
    for (let i = 0; i < s.length; i++) if (VOWELS.includes(s[i].toLowerCase())) idx.push(i);
    if (!idx.length) return null;
    const i = idx[ri(idx.length)];
    let v; do { v = VOWELS[ri(VOWELS.length)]; } while (v === s[i].toLowerCase());
    return replaceAt(s, i, v);
  },
  function replaceCons(s) {                // заменить согласную на похожую
    const idx = [];
    for (let i = 0; i < s.length; i++) if (CONS_PAIRS[s[i].toLowerCase()]) idx.push(i);
    if (!idx.length) return null;
    const i = idx[ri(idx.length)];
    return replaceAt(s, i, CONS_PAIRS[s[i].toLowerCase()]);
  },
  function drop(s) {                        // выбросить букву
    if (s.length < 4) return null;
    for (let t = 0; t < 6; t++) {
      const i = 1 + ri(s.length - 1);
      if (!isSep(s[i])) return s.slice(0, i) + s.slice(i + 1);
    }
    return null;
  },
  function double(s) {                      // удвоить букву
    for (let t = 0; t < 6; t++) {
      const i = ri(s.length);
      if (!isSep(s[i])) return s.slice(0, i + 1) + s[i] + s.slice(i + 1);
    }
    return null;
  },
  function ending(s) {                      // сменить окончание
    const suf = ['а', 'я', 'ск', 'е', 'ов', 'о', 'ы', 'и', 'ин'];
    let base = s;
    if (VOWELS.includes(base[base.length - 1].toLowerCase())) base = base.slice(0, -1);
    return base + suf[ri(suf.length)];
  },
];

// 7 непохожих друг на друга искажений столицы, не являющихся реальными столицами.
function generateDistractors(capital, count) {
  const out = [];
  const seen = new Set([normalize(capital)]);
  let attempts = 0;

  while (out.length < count && attempts < 800) {
    attempts++;
    let d = TRANSFORMS[ri(TRANSFORMS.length)](capital);
    if (!d) continue;
    if (Math.random() < 0.35) {            // иногда второе преобразование
      const d2 = TRANSFORMS[ri(TRANSFORMS.length)](d);
      if (d2) d = d2;
    }
    d = titleCase(d);
    const nd = normalize(d);
    if (nd.length < 2 || seen.has(nd) || REAL_CAPITALS.has(nd)) continue;
    seen.add(nd);
    out.push(d);
  }

  // Гарантируем нужное количество на случай очень коротких названий.
  const suffixes = ['а', 'я', 'ск', 'ов', 'е', 'о', 'ы', 'и', 'ин', 'град', 'бург'];
  for (let i = 0; out.length < count && i < suffixes.length * 2; i++) {
    const d = titleCase(capital + suffixes[i % suffixes.length]);
    const nd = normalize(d);
    if (seen.has(nd) || REAL_CAPITALS.has(nd)) continue;
    seen.add(nd);
    out.push(d);
  }
  return out.slice(0, count);
}

// Массив из 8 вариантов: правильная столица + 7 искажений, перемешанные.
function buildCapitalOptions(country) {
  const options = [country.capital, ...generateDistractors(country.capital, 7)];
  return shuffleArray(options);
}

/* ----------------------------------------------------------------------------
 * 5. РАБОТА С SVG-КАРТОЙ
 * -------------------------------------------------------------------------- */
const map = {
  svg: null,
  labelEl: null,       // текущая подпись на карте
  base: null,          // исходный viewBox {x,y,w,h}
  view: null,          // текущий viewBox {x,y,w,h}
  pointers: new Map(), // активные указатели (мышь/касания)
  panLast: null,       // последняя точка при панорамировании
  start: null,         // точка начала жеста (для порога перетаскивания)
  pinch: null,         // состояние жеста «щипок»
  dragging: false,     // идёт ли реальное перетаскивание
  moved: 0,            // накопленное перемещение указателя
  suppressClick: false,// подавить выбор страны после перетаскивания

  init() {
    this.svg = document.querySelector('#map-container svg');
    if (!this.svg) return;

    const vb = (this.svg.getAttribute('viewBox') || '0 0 1000 500')
      .split(/[\s,]+/).map(Number);
    this.base = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    this.view = Object.assign({}, this.base);
    this.applyView();

    this.svg.addEventListener('click', e => this.onClick(e));
    this.svg.addEventListener('wheel', e => this.onWheel(e), { passive: false });
    this.svg.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.svg.addEventListener('pointermove', e => this.onPointerMove(e));
    // up/cancel слушаем на окне, чтобы поймать отпускание вне карты.
    // Захват указателя (setPointerCapture) НЕ используем: он переносит
    // цель события click на корневой <svg> и ломает выбор страны.
    window.addEventListener('pointerup', e => this.onPointerUp(e));
    window.addEventListener('pointercancel', e => this.onPointerUp(e));
  },

  /* ---- Масштаб и панорамирование через viewBox ---- */
  applyView() {
    const v = this.view;
    this.svg.setAttribute('viewBox', v.x + ' ' + v.y + ' ' + v.w + ' ' + v.h);
  },

  clampView() {
    const b = this.base, v = this.view;
    const minW = b.w / 8;                 // максимальное приближение (~8x)
    v.w = Math.min(b.w, Math.max(minW, v.w));
    v.h = v.w * (b.h / b.w);              // сохраняем пропорции карты
    v.x = Math.min(b.x + b.w - v.w, Math.max(b.x, v.x));
    v.y = Math.min(b.y + b.h - v.h, Math.max(b.y, v.y));
  },

  // Экранные координаты -> координаты внутри SVG.
  toSvg(clientX, clientY) {
    const r = this.svg.getBoundingClientRect();
    return {
      x: this.view.x + (clientX - r.left) / r.width * this.view.w,
      y: this.view.y + (clientY - r.top) / r.height * this.view.h,
    };
  },

  // factor < 1 — приблизить, > 1 — отдалить. Фокус — точка на экране.
  zoomAt(factor, clientX, clientY) {
    let fx, fy;
    if (clientX == null) {
      fx = this.view.x + this.view.w / 2;
      fy = this.view.y + this.view.h / 2;
    } else {
      const p = this.toSvg(clientX, clientY);
      fx = p.x; fy = p.y;
    }
    this.view.x = fx - (fx - this.view.x) * factor;
    this.view.y = fy - (fy - this.view.y) * factor;
    this.view.w *= factor;
    this.view.h *= factor;
    this.clampView();
    this.applyView();
  },

  zoomIn()    { this.zoomAt(0.8); },
  zoomOut()   { this.zoomAt(1.25); },
  resetView() { if (this.base) { this.view = Object.assign({}, this.base); this.applyView(); } },

  onWheel(e) {
    e.preventDefault();
    this.zoomAt(e.deltaY < 0 ? 0.85 : 1 / 0.85, e.clientX, e.clientY);
  },

  onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // только ЛКМ
    if (this.pointers.size === 0) {
      this.suppressClick = false;
      this.dragging = false;
      this.moved = 0;
    }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 2) {
      const p = [...this.pointers.values()];
      this.pinch = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) };
      this.panLast = null;
    } else {
      this.panLast = { x: e.clientX, y: e.clientY };
      this.start = { x: e.clientX, y: e.clientY };
    }
  },

  onPointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Щипок двумя пальцами — масштаб.
    if (this.pointers.size === 2 && this.pinch) {
      const p = [...this.pointers.values()];
      const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const cx = (p[0].x + p[1].x) / 2;
      const cy = (p[0].y + p[1].y) / 2;
      if (this.pinch.dist > 0 && dist > 0) this.zoomAt(this.pinch.dist / dist, cx, cy);
      this.pinch.dist = dist;
      this.suppressClick = true;
      return;
    }

    // Перетаскивание одним указателем — панорамирование.
    // Пан начинается только после порога, чтобы обычный клик не сдвигал карту.
    if (this.panLast && this.pointers.size === 1) {
      if (!this.dragging) {
        const totX = e.clientX - this.start.x;
        const totY = e.clientY - this.start.y;
        if (Math.hypot(totX, totY) > 4) this.dragging = true;
      }
      if (this.dragging) {
        const dx = e.clientX - this.panLast.x;
        const dy = e.clientY - this.panLast.y;
        const r = this.svg.getBoundingClientRect();
        if (r.width && r.height) {
          this.view.x -= dx / r.width * this.view.w;
          this.view.y -= dy / r.height * this.view.h;
          this.clampView();
          this.applyView();
        }
        this.suppressClick = true;
      }
      this.panLast = { x: e.clientX, y: e.clientY };
    }
  },

  onPointerUp(e) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (this.pointers.size === 0) { this.panLast = null; this.dragging = false; }
  },

  // Элемент страны по ISO (учитывает и <path id>, и <g id>).
  el(iso) {
    if (!this.svg || !iso) return null;
    return this.svg.querySelector('#' + CSS.escape(iso.toLowerCase()));
  },

  onClick(e) {
    // Клик после перетаскивания/щипка не должен выбирать страну.
    if (this.suppressClick) { this.suppressClick = false; return; }
    if (!state.inGame || state.answering) return;
    const target = e.target.closest('[id]');
    if (!target || target === this.svg) return;
    const iso = target.id;
    if (!/^[a-z]{2}$/.test(iso)) return; // игнорируем океан и служебные id
    this.select(iso.toUpperCase());
  },

  select(iso) {
    // снять прошлое выделение
    const prev = this.svg.querySelector('.c-selected');
    if (prev) prev.classList.remove('c-selected');
    state.selectedIso = iso;
    const el = this.el(iso);
    if (el) el.classList.add('c-selected');
    maybeSubmit();
  },

  clearSelection() {
    const prev = this.svg && this.svg.querySelector('.c-selected');
    if (prev) prev.classList.remove('c-selected');
    state.selectedIso = null;
  },

  paint(iso, result) {
    const el = this.el(iso);
    if (!el) return;
    el.classList.remove('c-selected', 'c-green', 'c-orange', 'c-red');
    el.classList.add('c-' + result);
  },

  flashWrong(iso) {
    const el = this.el(iso);
    if (!el) return;
    el.classList.add('c-flash');
    setTimeout(() => el.classList.remove('c-flash'), FLASH_MS);
  },

  // Подпись «Страна — Столица» в центре правильной страны.
  showLabel(country, result) {
    this.removeLabel();
    const el = this.el(country.iso);
    if (!el) return;
    let box;
    try { box = el.getBBox(); } catch (_) { return; }
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const ns = 'http://www.w3.org/2000/svg';
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', 'map-label map-label-' + result);
    text.textContent = country.country + ' — ' + country.capital;

    this.svg.appendChild(text);
    this.labelEl = text;
  },

  removeLabel() {
    if (this.labelEl && this.labelEl.parentNode) {
      this.labelEl.parentNode.removeChild(this.labelEl);
    }
    this.labelEl = null;
  },

  // Полный сброс раскраски карты и масштаба (новая игра).
  reset() {
    if (!this.svg) return;
    this.svg.querySelectorAll('.c-green, .c-orange, .c-red, .c-selected, .c-flash')
      .forEach(el => el.classList.remove('c-green', 'c-orange', 'c-red', 'c-selected', 'c-flash'));
    this.removeLabel();
    this.resetView();
  },
};

/* ----------------------------------------------------------------------------
 * 6. DOM-ССЫЛКИ
 * -------------------------------------------------------------------------- */
const dom = {};
function cacheDom() {
  dom.screens = {
    mode:  document.getElementById('screen-mode'),
    game:  document.getElementById('screen-game'),
    final: document.getElementById('screen-final'),
  };
  dom.modeList     = document.getElementById('mode-list');

  dom.countryName = document.getElementById('country-name');
  dom.progress    = document.getElementById('progress');
  dom.score       = document.getElementById('score');
  dom.cntGreen    = document.getElementById('cnt-green');
  dom.cntOrange   = document.getElementById('cnt-orange');
  dom.cntRed      = document.getElementById('cnt-red');
  dom.options     = document.getElementById('capital-options');
  dom.btnReset    = document.getElementById('btn-reset');
  dom.hint        = document.getElementById('hint');

  dom.finalScore  = document.getElementById('final-score');
  dom.finalGreen  = document.getElementById('final-green');
  dom.finalOrange = document.getElementById('final-orange');
  dom.finalRed    = document.getElementById('final-red');
  dom.finalPct    = document.getElementById('final-pct');
  dom.reviewList  = document.getElementById('review-list');
  dom.btnAgain    = document.getElementById('btn-again');
}

function showScreen(name) {
  Object.values(dom.screens).forEach(s => s.classList.remove('active'));
  dom.screens[name].classList.add('active');
}

/* ----------------------------------------------------------------------------
 * 7. ЭКРАН ВЫБОРА РЕЖИМА
 * -------------------------------------------------------------------------- */
function renderModeScreen() {
  dom.modeList.innerHTML = '';
  MODES.forEach(mode => {
    const count = COUNTRIES.filter(mode.filter).length;
    const btn = document.createElement('button');
    btn.className = 'mode-card';
    btn.innerHTML =
      '<span class="mode-title">' + mode.title + '</span>' +
      '<span class="mode-count">' + count + ' стран</span>';
    btn.addEventListener('click', () => startGame(COUNTRIES.filter(mode.filter)));
    dom.modeList.appendChild(btn);
  });
}

/* ----------------------------------------------------------------------------
 * 8. ИГРОВОЙ ЦИКЛ
 * -------------------------------------------------------------------------- */
function startGame(countryList) {
  state.queue = shuffle(countryList);
  state.index = 0;
  state.score = 0;
  state.counts = { green: 0, orange: 0, red: 0 };
  state.results = [];
  state.selectedIso = null;
  state.answering = false;
  state.inGame = true;
  state.finished = false;

  map.reset();
  showScreen('game');
  updateHud();
  renderCurrent();
}

function currentCountry() {
  return state.queue[state.index];
}

function renderCurrent() {
  const c = currentCountry();
  map.clearSelection();
  map.removeLabel();
  state.capitalChosen = null;
  dom.countryName.textContent = c.country;
  renderOptions(buildCapitalOptions(c));
  dom.hint.textContent = 'Отметьте страну на карте и выберите её столицу';
  dom.hint.className = 'hint';
  updateHud();
}

function updateHud() {
  dom.progress.textContent = Math.min(state.index + 1, state.queue.length) + ' / ' + state.queue.length;
  dom.score.textContent = state.score;
  dom.cntGreen.textContent = state.counts.green;
  dom.cntOrange.textContent = state.counts.orange;
  dom.cntRed.textContent = state.counts.red;
}

// Определяем результат по правилам ТЗ.
function evaluate(country, selectedIso, capitalRight) {
  const countryRight = selectedIso !== null && selectedIso === country.iso;
  if (countryRight && capitalRight) return 'green';
  if (countryRight || capitalRight) return 'orange';
  return 'red';
}

// Как только выбраны И страна на карте, И вариант столицы — проверяем.
function maybeSubmit() {
  if (state.answering || !state.inGame) return;
  if (state.selectedIso !== null && state.capitalChosen !== null) submitAnswer();
}

// Игрок выбрал вариант столицы — помечаем его и, если страна уже отмечена, проверяем.
function onSelectCapital(chosen, btnEl) {
  if (state.answering || !state.inGame) return;
  const prev = dom.options.querySelector('.option-btn.selected');
  if (prev) prev.classList.remove('selected');
  btnEl.classList.add('selected');
  state.capitalChosen = chosen;
  maybeSubmit();
}

// Проверка ответа: нужны и страна, и столица.
function submitAnswer() {
  if (state.answering || !state.inGame) return;
  if (state.selectedIso === null || state.capitalChosen === null) return;

  const c = currentCountry();
  const selectedIso = state.selectedIso;
  const capitalRight = normalize(state.capitalChosen) === normalize(c.capital);
  const result = evaluate(c, selectedIso, capitalRight);

  state.answering = true;

  // Блокируем варианты, подсвечиваем правильный и (если ошибка) выбранный.
  const buttons = dom.options.querySelectorAll('.option-btn');
  buttons.forEach(b => {
    b.disabled = true;
    b.classList.remove('selected');
    if (normalize(b.textContent) === normalize(c.capital)) b.classList.add('correct');
  });
  if (!capitalRight) {
    const chosenBtn = [...buttons].find(b => normalize(b.textContent) === normalize(state.capitalChosen));
    if (chosenBtn) chosenBtn.classList.add('wrong');
  }

  // Ошибочно выбранная страна коротко мигает красным.
  if (selectedIso && selectedIso !== c.iso) map.flashWrong(selectedIso);
  map.clearSelection();

  // Итоговый цвет получает именно правильная страна.
  map.paint(c.iso, result);
  map.showLabel(c, result);

  // Очки и статистика.
  state.score += POINTS[result];
  state.counts[result] += 1;
  state.results.push({ country: c, result });

  const hintText = {
    green:  'Верно! ' + c.country + ' — ' + c.capital,
    orange: 'Почти! ' + c.country + ' — ' + c.capital,
    red:    'Мимо. ' + c.country + ' — ' + c.capital,
  }[result];
  dom.hint.textContent = hintText;
  dom.hint.className = 'hint hint-' + result;

  updateHud();

  setTimeout(() => {
    state.answering = false;
    state.index += 1;
    if (state.index >= state.queue.length) finishGame();
    else renderCurrent();
  }, NEXT_DELAY_MS);
}

// Отрисовка кнопок вариантов (уже перемешанных).
function renderOptions(options) {
  dom.options.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => onSelectCapital(opt, btn));
    dom.options.appendChild(btn);
  });
}

/* ----------------------------------------------------------------------------
 * 9. ФИНАЛЬНЫЙ ЭКРАН
 * -------------------------------------------------------------------------- */
function finishGame() {
  state.finished = true;
  state.inGame = false;
  map.removeLabel();

  const total = state.queue.length;
  const maxScore = total * POINTS.green;
  const pct = maxScore ? Math.round((state.score / maxScore) * 100) : 0;

  dom.finalScore.textContent = state.score;
  dom.finalGreen.textContent = state.counts.green;
  dom.finalOrange.textContent = state.counts.orange;
  dom.finalRed.textContent = state.counts.red;
  dom.finalPct.textContent = pct + '%';

  // Список для повторения: сначала красные, затем оранжевые (порядок стабилен).
  const reds = state.results.filter(r => r.result === 'red');
  const oranges = state.results.filter(r => r.result === 'orange');
  const toReview = reds.concat(oranges);

  dom.reviewList.innerHTML = '';
  if (!toReview.length) {
    const li = document.createElement('li');
    li.className = 'review-perfect';
    li.textContent = 'Идеально! Все страны угаданы полностью.';
    dom.reviewList.appendChild(li);
  } else {
    toReview.forEach(r => {
      const li = document.createElement('li');
      li.className = 'review-item review-' + r.result;
      li.innerHTML =
        '<span class="review-country">' + r.country.country + '</span>' +
        '<span class="review-capital">' + r.country.capital + '</span>';
      dom.reviewList.appendChild(li);
    });
  }

  showScreen('final');
}

/* ----------------------------------------------------------------------------
 * 10. ИНИЦИАЛИЗАЦИЯ
 * -------------------------------------------------------------------------- */
function goToModeScreen() {
  state.inGame = false;    // блокируем выбор страны вне игры
  state.finished = true;
  map.reset();
  showScreen('mode');
}

function init() {
  cacheDom();
  map.init();
  renderModeScreen();

  dom.btnReset.addEventListener('click', goToModeScreen);
  dom.btnAgain.addEventListener('click', goToModeScreen);

  const zi = document.getElementById('zoom-in');
  const zo = document.getElementById('zoom-out');
  const zr = document.getElementById('zoom-reset');
  if (zi) zi.addEventListener('click', () => map.zoomIn());
  if (zo) zo.addEventListener('click', () => map.zoomOut());
  if (zr) zr.addEventListener('click', () => map.resetView());

  showScreen('mode');
}

document.addEventListener('DOMContentLoaded', init);
