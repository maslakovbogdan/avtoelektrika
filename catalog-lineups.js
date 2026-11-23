/* Each group names the manufacturer's source for the hardware and its role. */
(() => {
  function add(industry, brand, source, url, models) {
    for (const model of models) {
      window.industryCatalog[industry].push({
        brand, source, url, finland: ["Epec", "Metso", "TANA"].includes(brand), ...model
      });
    }
  }

  add("mining", "Epec", "Epec · паспорт 5050, PDF",
    "https://epec.fi/wp-content/uploads/2021/05/Epec_DataSheet_5050_ControlUnit.pdf", [
      {
        model: "5050 Control Unit", geometryProfile: "ecu",
        image: "img/catalog/mining/epec-5050-studio.webp",
        imageAlt: "Epec 5050 под углом: литой корпус, симметричные рёбра охлаждения и разъёмы вдоль нижней кромки",
        imageSource: "https://epec.fi/wp-content/uploads/2022/03/Epec_DataSheet_5050_ControlUnit.pdf",
        imageSourceLabel: "Паспорт контроллера",
        use: "Мобильный контроллер с четырьмя шинами CAN и портом Ethernet. Epec выпускает несколько исполнений 5050.",
        repair: "По артикулу определяют исполнение блока, затем раздельно проверяют питание, обмен по шинам и отклик каналов ввода-вывода.",
        tool: "В паспорте исполнений E30D5050-02 и E30D5050-82 указана среда CODESYS 3.5 для прикладной программы."
      }
    ]);

  add("mining", "Metso", "Metso · модернизация автоматики дробилок, PDF",
    "https://www.metso.com/globalassets/automation-retrofit-solutions-4085-11-23-en-svs.pdf", [
      {
        model: "IC10C", geometryProfile: "panel",
        image: "img/catalog/mining/metso-ic10c.webp",
        imageAlt: "Панель Metso IC10C с экраном управления питателем щёковой дробилки",
        imageSource: "https://www.metso.com/contentassets/9c50aa6aa2f3473898a3953bdec1eef9/brochure-nordberg-c-series-4226-04-24-en-agg-new.pdf#page=9",
        use: "Система автоматизации стационарных щёковых дробилок Nordberg серии C. Комплект модернизации обновляет управление пуском и остановкой машины.",
        repair: "Сопоставляют этап остановки с сообщением на панели и проверяют связанный с ним вход контроллера.",
        tool: "Штатный интерфейс IC позволяет посмотреть состояние дробилки. Совместимое сервисное ПО определяют по комплектации станции."
      }, {
        model: "IC50C", geometryProfile: "panel",
        image: "img/catalog/mining/metso-ic50c.webp",
        imageAlt: "Панель Metso IC50C с показаниями нагрузки и параметров конусной дробилки",
        imageSource: "https://www.metso.com/globalassets/pdfs-and-other-downloads/brochure-nordberg-gp-series-4675-04-25-en-agg.pdf#page=10",
        use: "Автоматика конусных дробилок Nordberg серии GP. Metso предлагает IC50C для модернизации отдельно стоящих машин.",
        repair: "Проверяют, видит ли система сигналы датчиков и совпадает ли показание на панели с контрольным измерением.",
        tool: "Для поиска причины остановки используют функции диагностики IC. Версию программного пакета сверяют с исполнением контроллера."
      }, {
        model: "IC70C", geometryProfile: "panel",
        image: "img/catalog/mining/metso-ic70c.webp",
        imageAlt: "Сенсорный экран и кнопки управления автоматикой Metso IC70C на дверце шкафа",
        imageSource: "https://www.metso.com/globalassets/product-pages/crushers/stationary-crushers/cone-crushers/nordberg-hp-series/brochure-nordberg-hp-series-4236-05-23-en-agg.pdf#page=11",
        use: "Система автоматики конусных дробилок Nordberg серии HP. Вариант IC70C выбирают с учётом модели дробилки.",
        repair: "Сверяют сообщения оператора и состояние каналов управления. Отдельно проверяют связь панели со шкафом автоматики.",
        tool: "Рабочие параметры доступны через интерфейс IC. Состав обновления зависит от аппаратной комплектации системы."
      }
    ]);

  add("mining", "TANA", "TANA · терминал Wingman",
    "https://tana.fi/tana-products/tanaconnect/", [
      {
        model: "Wingman", geometryProfile: "panel",
        image: "img/catalog/mining/tana-wingman.webp",
        screenCrop: [21, 186, 177, 270],
        imageAlt: "Планшет TANA Wingman с изображением бункера и рабочими показателями измельчителя",
        imageSource: "https://tana.fi/2026/06/02/tana-wingman/",
        use: "Дополнительный терминал оператора измельчителя отходов TANA серии D. На его экране видны загрузочный бункер и показания основной панели.",
        repair: "Если исчезло изображение, проверяют отдельно камеру и канал связи с терминалом. Данные машины сравнивают с показаниями основной панели.",
        tool: "Интерфейс Wingman отображает видео и рабочие данные. Сведения о совместимости обновлений уточняют по версии терминала."
      }
    ]);

  add("mining", "Siemens", "AVATECH · проект на Магнитогорском комбинате",
    "https://avatech.ru/projects_industry/metallurgiya/mmk-magnitogorskiy-metallurgicheskiy-kombinat/", [
      {
        model: "SIMATIC ET 200M", geometryProfile: "plc",
        image: "img/catalog/mining/siemens-et200m-studio.webp",
        screenImage: "img/catalog/mining/siemens-et200m-front.webp",
        screenCrop: [0, 0, 768, 256],
        previewOrientation: [.56, .26],
        imageAlt: "Собранная станция Siemens SIMATIC ET 200M с рядом модулей и голубыми и жёлтыми полосами маркировки",
        imageSource: "https://cache.industry.siemens.com/dl/files/632/109745632/att_980299/v1/KG_STPCS7_en.pdf#page=421",
        imageCaption: "Комплектация для PCS 7. Иллюстрация по фотографии Siemens.",
        imageSourceLabel: "Исходное фото в каталоге Siemens",
        use: "Станция распределённой периферии. На Магнитогорском металлургическом комбинате семейство ET 200M указано в системе с контроллером S7-300.",
        repair: "По диагностике станции определяют проблемный модуль и сверяют сигнал на его входе с показанием в контроллере.",
        tool: "Для проверки конфигурации нужны проект станции и обозначения установленных модулей."
      }
    ]);

  add("mining", "РЕГЛАБ", "РЕГЛАБ · описание модуля аналогового ввода",
    "https://reglab.ru/modulegroup/moduli_analogovogo_vvoda/r500_ai_16_081/", [
      {
        model: "R500 AI 16 081", geometryProfile: "plc",
        previewOrientation: [-0.10, 0.12],
        image: "img/catalog/mining/regul-ai16.webp",
        screenCrop: [18, 25, 122, 174],
        imageAlt: "Модуль аналогового ввода REGUL R500 AI 16 081 с маркировкой и световыми индикаторами каналов",
        imageSource: "https://reglab.ru/modulegroup/moduli_analogovogo_vvoda/r500_ai_16_081/",
        use: "Модуль ввода серии REGUL R500 принимает 16 токовых сигналов от промышленного оборудования и поддерживает связь с датчиками по HART.",
        repair: "Показания выбранного входа сверяют с контрольным токовым сигналом. Проверку линии HART проводят отдельно.",
        tool: "Состояние каналов видно по индикации на модуле. Версии системного ПО и конфигурации уточняют для конкретной станции R500."
      }
    ]);

  add("mining", "Allen-Bradley", "Rockwell Automation · 1756-EN2TR",
    "https://www.rockwellautomation.com/en-us/products/details.1756-en2tr.html", [
      {
        model: "1756-EN2TR", geometryProfile: "plc",
        image: "img/catalog/mining/ab-en2tr-c-cutout.webp",
        imageAlt: "Allen-Bradley 1756-EN2TR серии C с боковым радиатором, оранжевым USB-разъёмом и двумя портами Ethernet",
        imageSource: "https://www.classicautomation.com/1756-en2trc",
        imageCaption: "Модуль 1756-EN2TR серии C. Иллюстрация по фото Classic Automation.",
        imageSourceLabel: "Исходное фото Classic Automation",
        screenImage: "img/catalog/mining/ab-en2tr-indicators.webp",
        screenCrop: [0, 0, 148, 152],
        previewOrientation: [.27, .10],
        use: "Коммуникационный модуль шасси ControlLogix с двумя портами EtherNet/IP. Его задача — обмен данными с другими устройствами сети.",
        repair: "Проверяют индикацию и обмен через каждый порт. Исполнение модуля сверяют по обозначению серии на корпусе.",
        tool: "Rockwell публикует документацию и файлы загрузки по каталожному номеру и аппаратной серии."
      }
    ]);

  add("mining", "ОВЕН", "ОВЕН · автоматика вакуумной печи",
    "https://owen.ru/news/universalnaya-vakuumnaya-pech-snvs-8.8.82", [
      {
        model: "СПК207", geometryProfile: "panel",
        image: "img/catalog/mining/owen-spk207.webp",
        screenCrop: [0, 0, 342, 230],
        previewOrientation: [-.37, .16],
        imageAlt: "Фасад панельного контроллера ОВЕН СПК207 с сенсорным экраном и кнопками справа",
        imageSource: "https://owen.ru/uploads/spk105_start_prodazh_v3.pdf#page=2",
        use: "Сенсорный панельный контроллер. На вакуумной печи СНВС-8.8.8/2-И2 он работает вместе с модулями ввода-вывода Мх110.",
        repair: "При сбое отделяют неисправность экрана от потери связи с модулями, затем проверяют показания измерительных каналов.",
        tool: "Для описанной ОВЕН установки проект разработан в CODESYS V3.5 SP1 Patch 2."
      }
    ]);

  add("mining", "ЭМИКОН", "ЭМИКОН · применение контроллеров в металлургии",
    "https://www.emicon.ru/about/history/", [
      {
        model: "ЭК-1000", geometryProfile: "plc",
        screenImage: "img/catalog/mining/emicon-ek1000-panels.webp",
        screenCrop: [0, 0, 800, 400],
        previewOrientation: [-.76, .12],
        image: "img/catalog/mining/emicon-ek1000-restored.webp",
        imageAlt: "ЭК-1000 с открытой корзиной плат слева и панелью индикации, дисплеем и клавиатурой справа",
        imageCaption: "Увеличенная иллюстрация по архивной фотографии ЭМИКОН.",
        imageSourceLabel: "Архивная фотография ЭМИКОН",
        imageSource: "https://www.emicon.ru/about/history/",
        use: "Семейство промышленных контроллеров раннего поколения. Производитель указывает применение на прокатных станах и в мартеновских цехах.",
        repair: "Сначала уточняют маркировку процессора и периферии. Затем проверяют, какие модули обмениваются данными в составе стойки.",
        tool: "Для работы с программой нужна документация конкретного исполнения и архив проекта предприятия."
      }
    ]);

  add("forestry", "Epec", "Epec · руководство 4W Herman, PDF",
    "https://epec.fi/wp-content/uploads/2018/12/Epec-4W-Herman_Users-manual.pdf", [
      {
        model: "2023 · 4W Herman", geometryProfile: "ecu",
        image: "img/catalog/forestry/epec-2023-studio.webp",
        screenImage: "img/catalog/forestry/epec-2023-legend.webp",
        screenCrop: [0, 0, 500, 240],
        previewOrientation: [.19, -.57],
        imageAlt: "Кабинный блок с цветными разъёмами в комплекте Epec",
        imageCaption: "Иллюстрация по фото кабинного модуля в каталоге Epec.",
        imageSource: "https://valtralita.lt/files/4w_Herman_eng.pdf#page=2",
        use: "Кабинный электронный блок системы управления харвестерной головкой. Связан с дисплеем и другими модулями по шине CAN.",
        repair: "Сопоставляют действия оператора с состоянием входов, проверяют разъёмы в кабине и связь между модулями.",
        tool: "Состояние системы проверяют на дисплее 4W Herman. Метод обновления выбирают по типу модуля и установленной версии."
      }, {
        model: "2040 · 4W Herman", geometryProfile: "panel",
        image: "img/catalog/forestry/epec-2040-studio.webp",
        imageCaption: "Дисплей измерительной системы. Иллюстрация по фото Epec.",
        screenImage: "img/catalog/forestry/epec-2040-membrane.webp",
        screenCrop: [0, 0, 704, 650],
        previewOrientation: [-.16, .025],
        imageAlt: "Лицевая панель Epec 2040 с дисплеем и пятью клавишами",
        imageSource: "https://valtralita.lt/files/4w_Herman_eng.pdf#page=2",
        use: "Цветной дисплей 4W Herman. В его памяти сохраняются данные о заготовленных сортиментах.",
        repair: "При пропадании показаний проверяют запуск самого дисплея, затем поступление данных по сети машины.",
        tool: "Руководство 4W Herman описывает работу с данными, сообщениями и калибровками через экран оператора."
      }, {
        model: "2021 · 4W Herman", geometryProfile: "ecu",
        image: "img/catalog/forestry/epec-2021-studio.webp",
        screenImage: "img/catalog/forestry/epec-2021-legend.webp",
        screenCrop: [0, 0, 500, 240],
        previewOrientation: [.22, -.57],
        imageAlt: "Узловой блок 4W Herman с четырьмя тёмными разъёмами и белым разъёмом",
        imageCaption: "Иллюстрация по фото узлового модуля в каталоге Epec.",
        imageSource: "https://valtralita.lt/files/4w_Herman_eng.pdf#page=2",
        use: "Узловой модуль 4W Herman. В схеме измерительной системы он обозначен как hub control unit.",
        repair: "Проверяют наличие связи с соседними узлами CAN и соответствие подключений схеме конкретной машины.",
        tool: "Для диагностики используют схему соединений и сообщения 4W Herman. Исполнение определяют по маркировке корпуса."
      }
    ]);

  add("forestry", "Log Max", "Log Max · аппаратный состав Log Mate 510",
    "https://logmax.com/en/controlsystem/", [
      {
        model: "LDM · Log Mate 510", geometryProfile: "ecu",
        image: "img/catalog/forestry/logmate-ldm-studio.webp",
        imageCaption: "Иллюстрация по фотографии кабинного распределительного модуля Log Max.",
        screenImage: "img/catalog/forestry/logmate-ldm-legend.webp",
        screenCrop: [0, 0, 768, 144],
        previewOrientation: [-.03, .31],
        imageAlt: "Кабинный модуль LDM с двумя группами фронтальных разъёмов",
        imageSource: "https://logmax.com/en/controlsystem/",
        use: "Кабинный модуль в комплекте Log Mate 510. Он работает совместно с бортовым ПК и модулем харвестерной головки LHM.",
        repair: "Если головка перестала отвечать, обмен проверяют последовательно на участке кабинного блока и на линии до LHM.",
        tool: "Для диагностики учитывают конфигурацию Log Mate 510 и комплектацию головки."
      }
    ]);

  add("forestry", "Mitron", "Mitron · сервисное руководство motomit IT, PDF",
    "https://www.terri.se/wp-content/uploads/service_manual_swe.pdf", [
      {
        model: "motomit IT · MCKC", geometryProfile: "ecu",
        image: "img/catalog/forestry/mitron-mckc-studio.webp",
        imageAlt: "Контроллер кнопок Mitron MCKC03 с четырьмя клеммными колодками по краям",
        imageCaption: "Исполнение MCKC03. Иллюстрация по фотографии комплекта motomit IT.",
        imageSource: "https://www.equipnet.ru/equip/equip_111608.html",
        screenCrop: [0, 0, 1035, 1250],
        previewOrientation: [-.16, .10],
        use: "Модуль сигналов кнопок управления. Через него команды с рукояток поступают в систему харвестера.",
        repair: "При отказе отдельной кнопки сверяют её сигнал на входе модуля и состояние кабеля.",
        tool: "Руководство motomit IT описывает сервисную проверку системы и назначение её модулей."
      }
    ]);

  add("forestry", "Ponsse", "Ponsse · дисплей нового поколения Opti",
    "https://www.ponsse.com/ru/kompanija/novosti/-/asset_publisher/P4s3zYhpxHUQ/content/ponsse-lance-le-systeme-d-information-opti-5g-de-nouvelle-generation-pour-les-machines-sur-chenilles-1", [
      {
        model: "Opti 8X", geometryProfile: "panel",
        image: "img/catalog/forestry/ponsse-opti-8x-studio.webp",
        screenImage: "img/catalog/forestry/opti-8x-badge.webp", screenCrop: [0, 0, 86, 28],
        previewOrientation: [-.16, .09],
        imageAlt: "Интерфейс Ponsse Opti 5G с показаниями длины, диаметра и выбранной породы дерева",
        imageCaption: "Терминал семейства Opti с рабочим экраном Opti 5G. Иллюстрация по каталогу Ponsse.",
        imageSource: "https://cdn-ponsse.contenthub.fi/api/v1/cdn/17045272#page=3",
        use: "Сенсорный дисплей системы Opti 5G на лесозаготовительных машинах. Оператор видит рабочие показатели, карту участка и параметры головки.",
        repair: "Проверяют загрузку изображения и работу сенсора, затем сверяют отображаемые данные с текущим состоянием машины.",
        tool: "Opti 5G — рабочая среда оператора. Совместимость программного пакета уточняют по версии дисплея и машины."
      }
    ]);

  add("forestry", "Komatsu Forest", "Komatsu Forest · комплектация харвестера 951, PDF",
    "https://www.komatsuforest.com/-/media/Komatsu-Forest/Files/Product-files/Komatsu-961/891-5412-K_961_GB1.pdf?la=en", [
      {
        model: "MaxiPC X20", geometryProfile: "ecu",
        image: "img/catalog/forestry/maxipc-x20-studio.webp",
        screenImage: "img/catalog/forestry/maxipc-face.webp", screenCrop: [0, 0, 840, 224],
        previewOrientation: [-.35, .29],
        imageAlt: "MaxiPC X20 с алюминиевым радиатором, разъёмами мониторов, COM, USB и Ethernet",
        imageCaption: "Системный блок MaxiPC X20. Иллюстрация по фотографии оборудования Komatsu/Valmet.",
        imageSource: "https://www.truck1.eu/spare-parts/electrical-system/komatsu-valmet-maxi-pc-x20-a5481116.html",
        use: "Бортовой компьютер одного из исполнений харвестера Komatsu 951. В комплектации с MaxiXplorer предусмотрен отдельный 12-дюймовый экран.",
        repair: "При сбое загрузки проверяют питание компьютера и накопитель. Неисправности монитора проверяют отдельно.",
        tool: "В описанной комплектации MaxiXplorer собирает сведения о работе машины и предоставляет диагностику и журнал аварий."
      }
    ]);

  add("forestry", "John Deere", "John Deere · поддерживаемые бортовые компьютеры",
    "https://www-cm-ue.deere.com/en-gb/industries/forestry/timbermatic-tm-maps", [
      {
        model: "HPC21 (XL5)", geometryProfile: "panel",
        image: "img/catalog/forestry/deere-xl5-studio.webp",
        // Illustrative site map over public-domain USDA NAIP imagery, via USGS The National Map.
        displayImage: "img/catalog/forestry/xl5-maps-display.webp",
        screenImage: "img/catalog/forestry/xl5-keystrip.webp", screenCrop: [0, 0, 62, 485],
        previewOrientation: [.18, .10],
        imageAlt: "Бортовой компьютер John Deere XL5, вид со стороны экрана",
        imageCaption: "Кабинный компьютер XL5. Иллюстрация по каталогу John Deere, артикул F710233.",
        imageSource: "https://shop.deere.com/us/product/F710233%3A-XL5-Computer/p/F710233",
        toolUrl: "https://www.deere.com.au/en/forestry/forestry-articles/control-pc/",
        toolSourceLabel: "John Deere · рабочий экран в кабине",
        use: "Компьютер харвестеров и форвардеров, включённый John Deere в список оборудования для TimberMatic Maps.",
        repair: "Если карта перестала получать данные, отдельно проверяют бортовой компьютер, версию приложения и соединение с телематикой.",
        tool: "Для TimberMatic Maps производитель указывает TimberMatic версии 2.0 или новее и совместимое оборудование связи."
      }
    ]);

  add("forestry", "Waratah", "Waratah · технические данные TimberRite H-16, PDF",
    "https://www.waratah.com/wp-content/uploads/2020/08/TimberRite_MTG_FastFacts_8.5x11_LR_082422.pdf", [
      {
        model: "XL4 · TimberRite", geometryProfile: "panel",
        image: "img/catalog/forestry/waratah-xl4-studio.webp",
        // Oregon aerial imagery: USDA NAIP 2022. The harvest routes and map controls are illustrative.
        displayImage: "img/catalog/forestry/xl4-harvest-map.webp",
        previewOrientation: [-.19, .11],
        imageAlt: "Компьютер с сенсорным экраном и картой участка из комплекта TimberRite H-16",
        imageCaption: "Кабинный компьютер XL4 с картой заготовки TimberRite. Иллюстрация по материалам Waratah.",
        imageSource: "https://www.waratah.com/wp-content/uploads/2020/08/TimberRite_MTG_FastFacts_8.5x11_LR_082422.pdf",
        use: "Кабинный компьютер TimberRite H-16 со встроенным сенсорным дисплеем. Через него оператор задаёт параметры заготовки.",
        repair: "Проверяют запуск компьютера и отклик сенсора. При потере данных головки отдельно исследуют соединение с модулями машины.",
        tool: "Штатная система TimberRite H-16 содержит бортовую диагностику и поддерживает резервное копирование настроек."
      }
    ]);

  add("roads", "MOBA", "MOBA · состав системы PAVE-TM, PDF",
    "https://moba.com.au/wp-content/uploads/sites/14/Pave_TM_Brochure_EN.pdf", [
      {
        model: "MPC-120", geometryProfile: "ecu",
        image: "img/catalog/roads/moba-mpc-120-studio.webp",
        screenImage: "img/catalog/roads/moba-mpc-120-face.webp",
        screenCrop: [0, 0, 600, 485],
        previewOrientation: [.59, .87],
        imageCaption: "Иллюстрация по фотографии контроллера в каталоге MOBA PAVE-TM.",
        imageAlt: "Металлический корпус MOBA MPC-120 с рёбрами охлаждения и прямоугольным разъёмом",
        imageSource: "https://www.jemco-e.co.jp/wordpress/wp-content/uploads/2019/03/PAVE_TM_%E3%82%AB%E3%82%BF%E3%83%AD%E3%82%B0.pdf#page=11",
        use: "Контроллер PAVE-TM принимает данные компонентов системы и выполняет вычисления для измерения толщины укладываемого слоя.",
        repair: "Проверяют обмен с датчиками и наличие данных измерения на операторском дисплее.",
        tool: "Для подбора сервисного пакета нужны исполнение контроллера и комплектация PAVE-TM."
      }, {
        model: "GDC-320", geometryProfile: "panel",
        image: "img/catalog/roads/moba-gdc-320-studio.webp",
        screenImage: "img/catalog/roads/moba-gdc-320-face.webp",
        screenCrop: [0, 0, 430, 480],
        previewOrientation: [-.53, -.16],
        imageCaption: "Иллюстрация по фотографии панели в каталоге MOBA PAVE-TM.",
        imageAlt: "Пульт GDC-320 с графическим экраном, кнопками и боковой рукояткой",
        imageSource: "https://www.jemco-e.co.jp/wordpress/wp-content/uploads/2019/03/PAVE_TM_%E3%82%AB%E3%82%BF%E3%83%AD%E3%82%B0.pdf#page=11",
        use: "Компактная графическая панель PAVE-TM. Отображает измеренную толщину слоя асфальта.",
        repair: "Проверяют питание дисплея, его разъём и наличие данных от контроллера MPC-120.",
        tool: "Измерения отображаются в штатном интерфейсе PAVE-TM. Сервисное ПО подбирают по версии панели."
      }
    ]);

  add("roads", "Danfoss", "Danfoss · контроллер для Gomaco",
    "https://powersource.danfoss.com/products/electronic-controls-hmi-and-iot/plus1-controllers/plus1-mc-microcontrollers/p/11075264", [
      {
        model: "MC050-010 · Gomaco", geometryProfile: "ecu",
        image: "img/catalog/roads/danfoss-mc050-studio.webp",
        previewOrientation: [-.71, .43],
        imageAlt: "Корпус контроллера семейства Danfoss MC050 с 50-контактным разъёмом",
        imageCaption: "Иллюстрация корпуса серии MC050-010/012 по паспорту Danfoss.",
        imageSource: "https://assets.danfoss.com/documents/latest/75564/AI152886480719en-001502.pdf",
        use: "В каталоге Danfoss исполнение 11075264 обозначено для Gomaco. Это 50-контактный контроллер семейства PLUS+1.",
        repair: "Сверяют заказной номер и конфигурацию машины, затем проверяют питание и обмен по CAN.",
        tool: "Прикладной проект для исполнения Gomaco и версии системного ПО сверяют с документацией производителя машины."
      }
    ]);

  add("roads", "Topcon", "Topcon · каталог 3D Construction, PDF",
    "https://www.topconpositioning.asia/content/dam/topcon-pa/language-masters/en/products/catalog%28pdf%29/3dconstruction_catalog_7010-2168_revf_team_en_us_lores.pdf", [
      {
        model: "GX-75", geometryProfile: "panel",
        image: "img/catalog/roads/topcon-gx75-studio.webp",
        screenImage: "img/catalog/roads/topcon-gx75-face.webp",
        screenCrop: [0, 0, 660, 480],
        previewOrientation: [-.06, .035],
        imageCaption: "Иллюстрация по фотографии Topcon Solutions.",
        imageAlt: "Монитор нивелирования Topcon GX-75, вид спереди",
        imageSource: "https://shop.topconsolutions.com/products/gx-75-machine-control-display",
        use: "10-дюймовый операторский дисплей системы управления землеройной техникой. Показывает положение машины относительно цифрового проекта.",
        repair: "Проверяют экран и органы управления, затем связь с оборудованием позиционирования и получение данных проекта.",
        tool: "GX-75 относится к системам управления 3D-MC. Нужные версии ПО зависят от состава машинного комплекта."
      }
    ]);

  add("roads", "Радиоавтоматика", "Радиоавтоматика · паспорт системы подогрева плиты",
    "https://www.radioavt.ru/viewdoc.php?name=ps_pcuggu_pdf&page=2", [
      {
        model: "БУ-ГГУ · ВГЛА.468214.061", geometryProfile: "ecu",
        image: "img/catalog/roads/radioavt-bu-studio.webp",
        imageAlt: "Блок газогорелочного устройства с кабелями и схемой на корпусе",
        imageCaption: "Иллюстрация по фотографии БУ-ГГУ из паспорта «Радиоавтоматики».",
        imageSource: "https://radioavt.ru/Files/ps_buggu.pdf#page=14",
        imageSourceLabel: "Фотография блока в паспорте",
        screenImage: "img/catalog/roads/radioavt-bu-front.webp",
        screenCrop: [0,0,290,596],
        previewOrientation: [-.22,.13],
        use: "Автономный блок управления горелкой подогрева плиты асфальтоукладчика. Центральный пульт ПЦУ-ГГУ объединяет несколько таких блоков.",
        repair: "По индикации пульта определяют, какой блок потерял связь. Электронный блок и линию связи проверяют раздельно.",
        tool: "Уставки отдельных БУ-ГГУ задаются через ПЦУ-ГГУ. Маркировку блока сверяют с паспортом конкретной установки."
      }
    ]);

  add("roads", "HITS", "HITS · DrillControl на свайной установке",
    "https://hits-group.ru/drillcontrol", [
      {
        model: "DC10 · DrillControl", geometryProfile: "receiver",
        image: "img/catalog/roads/hits-dc-studio.webp",
        imageAlt: "Аппаратный блок HITS DC10 с тремя антеннами",
        imageSource: "https://hits-group.ru/drillcontrol",
        imageCaption: "Корпус DC10 по иллюстрации HITS для системы DrillControl.",
        screenImage: "img/catalog/roads/hits-badge.webp",
        screenCrop: [0,0,144,153],
        previewOrientation: [-.42,.09],
        use: "Аппаратный блок системы позиционирования DrillControl для свайных и буровых установок. Производитель показывает оборудование на копре Sunward ZYJ360B.",
        repair: "Если положение на экране нестабильно, проверяют приём данных от антенн и соединение аппаратного блока с рабочим местом оператора.",
        tool: "Через интерфейс DrillControl сопоставляют фактическое положение с заданием проекта."
      }
    ]);
})();
