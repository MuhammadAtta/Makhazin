// Makhazin — tiny i18n layer (English / Arabic RTL).
// Language is chosen from ?lang=ar|en, then the saved choice, then the browser language.
(function () {
  const D = {
    en: {
      "brand": "Makhazin",
      "lang.other": "عربي",
      "nav.warehouses": "Warehouses",
      "nav.join": "Join waitlist",
      "title.home": "Makhazin — Unlock Space. Unleash Growth. Rent Securely.",
      "title.list": "Warehouses — Makhazin",
      "meta.home": "Makhazin is the warehouse marketplace for Egypt and the MENA region, with live IoT monitoring and secure digital contracts. Join the waitlist.",
      "meta.list": "Browse verified warehouses for rent in Egypt. Filter by city, size and price, and request a viewing.",

      "hero.eyebrow": "Warehouse marketplace · Egypt & MENA",
      "h1.1": "Unlock Space.", "h1.2": "Unleash Growth.", "h1.3": "Rent Securely.",
      "hero.lead": "Find verified warehouses, sign digital contracts in minutes, and watch temperature, humidity and access live from your phone. One platform for owners and tenants.",
      "hero.owner": "I own a warehouse", "hero.tenant": "I need storage space",
      "sensor.aria": "Live sensor example",
      "sensor.title": "Warehouse B-12 · 10th of Ramadan City",
      "sensor.live": "LIVE", "sensor.temp": "Temp", "sensor.humidity": "Humidity", "sensor.door": "Door", "sensor.closed": "Closed",
      "sensor.foot": "Last 60 seconds · simulated data", "sensor.status": "All within range",

      "how.kicker": "How it works",
      "how.h2": "From search to signed contract, without the runaround",
      "how.sub": "Renting a warehouse today means phone calls, middlemen and paper. Makhazin puts it in one place.",
      "step1.h": "Discover", "step1.p": "Browse verified warehouses by city, size, clear height and features like cold storage or loading docks.",
      "step2.h": "Book & sign", "step2.p": "Request a viewing, agree terms and sign a digital contract. Every version is stored with a tamper-evident audit trail.",
      "step3.h": "Monitor", "step3.p": "IoT sensors report temperature, humidity and door access in real time, with alerts when something drifts out of range.",

      "who.kicker": "Built for both sides",
      "who.h2": "Fill empty space. Find the right space.",
      "who.sub": "Owners earn from idle capacity. Tenants get flexible space they can trust.",
      "owners.h": "Warehouse owners",
      "owners.1": "List space and reach verified tenants", "owners.2": "Digital contracts and rent tracking in one dashboard",
      "owners.3": "Sensor data that proves conditions to tenants", "owners.4": "Fewer vacancies, fewer disputes",
      "tenants.h": "Businesses & tenants",
      "tenants.1": "Compare options by price, size and features", "tenants.2": "Short and long terms that scale with your stock",
      "tenants.3": "Live visibility into your goods from anywhere", "tenants.4": "Clear contracts, no hidden terms",

      "feat.kicker": "What you get", "feat.h2": "The essentials, done properly",
      "feat1.h": "Verified listings", "feat1.p": "Every warehouse is checked before it goes live.",
      "feat2.h": "Digital contracts", "feat2.p": "Sign online. Each contract is hashed and logged so any change is visible.",
      "feat3.h": "Live monitoring", "feat3.p": "Temperature, humidity and access, with instant alerts.",

      "wl.kicker": "Early access", "wl.h2": "Be first in line when we launch",
      "wl.sub": "We're onboarding our first warehouses and tenants now. Join the waitlist and we'll reach out personally.",
      "wl.roleAria": "I am a", "wl.owner": "Warehouse owner", "wl.tenant": "Tenant",
      "wl.email": "Email *", "wl.name": "Name", "wl.phone": "WhatsApp / phone", "wl.city": "City",
      "wl.cityPh": "Cairo, 10th of Ramadan, Alexandria…", "wl.submit": "Join the waitlist",
      "wl.fine": "No spam. We only use your details to contact you about Makhazin.",
      "wl.sending": "Sending…", "wl.badEmail": "Please enter a valid email address.", "wl.ok": "You're on the list. We'll be in touch soon.",
      "wl.invalid": "That email doesn't look right.", "wl.error": "Something went wrong. Please try again.", "wl.network": "Network error. Please try again.",
      "footer.copy": "© {y} Makhazin", "footer.slogan": "Unlock Space. Unleash Growth. Rent Securely.",

      "list.h1": "Warehouses for rent",
      "list.lead": "Verified warehouse space across Egypt. Filter, compare, and request a viewing.",
      "f.city": "City", "f.all": "All cities", "f.min": "Min size", "f.minPh": "Min size (m²)", "f.max": "Max price", "f.maxPh": "Max price (EGP)",
      "loading": "Loading…", "list.fail": "Could not load warehouses. Please try again.", "list.empty": "No warehouses match these filters yet.",
      "price.ask": "Ask for price", "price.fmt": "{n} EGP / month", "price.ask2": "Ask",
      "status.rented": "Currently rented", "status.available": "Available",
      "photo.none": "No photo", "photo.yet": "No photo yet",
      "back": "← All warehouses", "detail.na": "This warehouse is not available.",
      "fact.size": "Size", "fact.price": "Price", "fact.height": "Clear height", "fact.status": "Status",
      "unit.sqm": "{n} m²", "unit.m": "{n} m",
      "inq.h": "Request a viewing", "inq.name": "Name *", "inq.phone": "WhatsApp / phone *", "inq.phonePh": "WhatsApp / phone",
      "inq.email": "Email (optional)", "inq.msg": "Message (optional)", "inq.msgPh": "Space needed, start date, what you will store…",
      "inq.invalid": "Please enter your name and a valid phone number.", "inq.ok": "Request sent. We will contact you shortly.",
      "inq.fail": "Could not send. Please check your details and try again.",
      "live.h": "Live conditions", "live.temp": "Temperature", "live.hum": "Humidity", "live.door": "Door", "live.open": "Open", "live.closed": "Closed",
      "live.sensor": "Sensor", "live.online": "Online", "live.offline": "Offline",
      "live.chart": "Temperature, last 24 hours", "live.last": "Last reading {x}",
      "ago.now": "just now", "ago.min": "{n} min ago", "ago.h": "{n} h ago", "ago.d": "{n} days ago",
    },
    ar: {
      "brand": "مخازن",
      "lang.other": "English",
      "nav.warehouses": "المخازن",
      "nav.join": "سجّل في القائمة",
      "title.home": "مخازن — افتح المساحة. أطلق النمو. أجّر بأمان.",
      "title.list": "المخازن — مخازن",
      "meta.home": "مخازن هي سوق تأجير المخازن في مصر والشرق الأوسط، مع مراقبة مباشرة بإنترنت الأشياء وعقود رقمية آمنة. سجّل في قائمة الانتظار.",
      "meta.list": "تصفّح مخازن موثّقة للإيجار في مصر. صفِّ حسب المدينة والمساحة والسعر، واطلب معاينة.",

      "hero.eyebrow": "سوق المخازن · مصر والشرق الأوسط",
      "h1.1": "افتح المساحة.", "h1.2": "أطلق النمو.", "h1.3": "أجّر بأمان.",
      "hero.lead": "ابحث عن مخازن موثّقة، ووقّع عقودًا رقمية في دقائق، وتابع الحرارة والرطوبة ودخول المخزن مباشرة من هاتفك. منصة واحدة للملّاك والمستأجرين.",
      "hero.owner": "أملك مخزنًا", "hero.tenant": "أبحث عن مساحة تخزين",
      "sensor.aria": "مثال على قراءة الحساس المباشرة",
      "sensor.title": "مخزن B-12 · مدينة العاشر من رمضان",
      "sensor.live": "مباشر", "sensor.temp": "الحرارة", "sensor.humidity": "الرطوبة", "sensor.door": "الباب", "sensor.closed": "مغلق",
      "sensor.foot": "آخر 60 ثانية · بيانات تجريبية", "sensor.status": "كل القراءات طبيعية",

      "how.kicker": "كيف يعمل",
      "how.h2": "من البحث إلى توقيع العقد، دون لفّ ودوران",
      "how.sub": "تأجير المخزن اليوم يعني مكالمات ووسطاء وأوراق. مخازن تجمع كل ذلك في مكان واحد.",
      "step1.h": "اكتشف", "step1.p": "تصفّح مخازن موثّقة حسب المدينة والمساحة والارتفاع والمميزات مثل التبريد ورصيف التحميل.",
      "step2.h": "احجز ووقّع", "step2.p": "اطلب معاينة، واتفق على الشروط، ووقّع عقدًا رقميًا. تُحفظ كل نسخة مع سجل تدقيق يكشف أي تعديل.",
      "step3.h": "تابع", "step3.p": "تنقل حساسات إنترنت الأشياء الحرارة والرطوبة وفتح الباب لحظة بلحظة، مع تنبيه عند أي قراءة غير طبيعية.",

      "who.kicker": "مصمَّم للطرفين",
      "who.h2": "املأ المساحات الفارغة. اعثر على المساحة المناسبة.",
      "who.sub": "يربح الملّاك من المساحات غير المستغلة، ويحصل المستأجرون على مساحة مرنة يثقون بها.",
      "owners.h": "ملّاك المخازن",
      "owners.1": "اعرض مساحتك وتواصل مع مستأجرين موثّقين", "owners.2": "عقود رقمية ومتابعة للإيجار في لوحة واحدة",
      "owners.3": "بيانات الحساسات تثبت حالة المخزن للمستأجر", "owners.4": "مساحات شاغرة أقل ونزاعات أقل",
      "tenants.h": "الشركات والمستأجرون",
      "tenants.1": "قارن الخيارات حسب السعر والمساحة والمميزات", "tenants.2": "مدد قصيرة وطويلة تنمو مع بضاعتك",
      "tenants.3": "تابع بضاعتك مباشرة من أي مكان", "tenants.4": "عقود واضحة بلا شروط خفية",

      "feat.kicker": "ما ستحصل عليه", "feat.h2": "الأساسيات، بإتقان",
      "feat1.h": "قوائم موثّقة", "feat1.p": "يُراجَع كل مخزن قبل نشره.",
      "feat2.h": "عقود رقمية", "feat2.p": "وقّع إلكترونيًا. يُسجَّل كل عقد ببصمة رقمية ليظهر أي تعديل.",
      "feat3.h": "مراقبة مباشرة", "feat3.p": "الحرارة والرطوبة والدخول، مع تنبيهات فورية.",

      "wl.kicker": "وصول مبكر", "wl.h2": "كن أول من يعرف عند الإطلاق",
      "wl.sub": "نضمّ الآن أول المخازن والمستأجرين. سجّل في قائمة الانتظار وسنتواصل معك شخصيًا.",
      "wl.roleAria": "أنا", "wl.owner": "مالك مخزن", "wl.tenant": "مستأجر",
      "wl.email": "البريد الإلكتروني *", "wl.name": "الاسم", "wl.phone": "واتساب / هاتف", "wl.city": "المدينة",
      "wl.cityPh": "القاهرة، العاشر من رمضان، الإسكندرية…", "wl.submit": "سجّل في قائمة الانتظار",
      "wl.fine": "لا رسائل مزعجة. نستخدم بياناتك فقط للتواصل معك بخصوص مخازن.",
      "wl.sending": "جارٍ الإرسال…", "wl.badEmail": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.", "wl.ok": "تم تسجيلك في القائمة. سنتواصل معك قريبًا.",
      "wl.invalid": "هذا البريد الإلكتروني غير صحيح.", "wl.error": "حدث خطأ. حاول مرة أخرى.", "wl.network": "خطأ في الاتصال. حاول مرة أخرى.",
      "footer.copy": "© {y} مخازن", "footer.slogan": "افتح المساحة. أطلق النمو. أجّر بأمان.",

      "list.h1": "مخازن للإيجار",
      "list.lead": "مساحات مخازن موثّقة في أنحاء مصر. صفِّ وقارن واطلب معاينة.",
      "f.city": "المدينة", "f.all": "كل المدن", "f.min": "أقل مساحة", "f.minPh": "أقل مساحة (م²)", "f.max": "أعلى سعر", "f.maxPh": "أعلى سعر (جنيه)",
      "loading": "جارٍ التحميل…", "list.fail": "تعذّر تحميل المخازن. حاول مرة أخرى.", "list.empty": "لا توجد مخازن مطابقة لهذه الفلاتر حاليًا.",
      "price.ask": "اسأل عن السعر", "price.fmt": "{n} جنيه / شهر", "price.ask2": "اسأل",
      "status.rented": "مؤجَّر حاليًا", "status.available": "متاح",
      "photo.none": "بدون صورة", "photo.yet": "لا توجد صورة بعد",
      "back": "→ كل المخازن", "detail.na": "هذا المخزن غير متاح.",
      "fact.size": "المساحة", "fact.price": "السعر", "fact.height": "الارتفاع", "fact.status": "الحالة",
      "unit.sqm": "{n} م²", "unit.m": "{n} م",
      "inq.h": "اطلب معاينة", "inq.name": "الاسم *", "inq.phone": "واتساب / هاتف *", "inq.phonePh": "واتساب / هاتف",
      "inq.email": "البريد الإلكتروني (اختياري)", "inq.msg": "رسالة (اختياري)", "inq.msgPh": "المساحة المطلوبة، موعد البدء، ما الذي ستخزّنه…",
      "inq.invalid": "من فضلك أدخل اسمك ورقم هاتف صحيحًا.", "inq.ok": "تم إرسال طلبك. سنتواصل معك قريبًا.",
      "inq.fail": "تعذّر الإرسال. راجع بياناتك وحاول مرة أخرى.",
      "live.h": "الحالة المباشرة", "live.temp": "الحرارة", "live.hum": "الرطوبة", "live.door": "الباب", "live.open": "مفتوح", "live.closed": "مغلق",
      "live.sensor": "الحساس", "live.online": "متصل", "live.offline": "غير متصل",
      "live.chart": "الحرارة خلال آخر 24 ساعة", "live.last": "آخر قراءة {x}",
      "ago.now": "الآن", "ago.min": "منذ {n} دقيقة", "ago.h": "منذ {n} ساعة", "ago.d": "منذ {n} يوم",
    },
  };

  const KEY = "mk_lang";
  function detect() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "ar" || q === "en") return q;
    try { const s = localStorage.getItem(KEY); if (s === "ar" || s === "en") return s; } catch {}
    return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
  }
  let lang = detect();
  const listeners = [];

  function t(key, vars) {
    let s = (D[lang] && D[lang][key]) ?? D.en[key] ?? key;
    if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }
  function setDir() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }
  function apply() {
    setDir();
    const y = new Date().getFullYear();
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n, { y }); });
    document.querySelectorAll("[data-i18n-ph]").forEach(el => el.setAttribute("placeholder", t(el.dataset.i18nPh)));
    document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    const meta = document.querySelector('meta[name="description"]');
    const mk = document.body && document.body.dataset.metaKey;
    if (meta && mk) meta.setAttribute("content", t(mk));
    const tk = document.body && document.body.dataset.titleKey;
    if (tk) document.title = t(tk);
  }
  function set(l) {
    lang = l;
    try { localStorage.setItem(KEY, l); } catch {}
    apply();
    listeners.forEach(f => f(l));
  }

  setDir(); // set direction immediately to avoid a layout flip
  window.i18n = { t, set, apply, onChange: f => listeners.push(f), get lang() { return lang; } };
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    const b = document.getElementById("lang-btn");
    if (b) b.addEventListener("click", () => set(lang === "ar" ? "en" : "ar"));
  });
})();
