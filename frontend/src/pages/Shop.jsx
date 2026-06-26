import { useState, useMemo } from "react";

// ── COMPLETE PUJA SAMAGRI CATALOG ─────────────────────────────────────────────
const PRODUCTS = [
  // ── FLOWERS ──────────────────────────────────────────────────────────────────
  { id:101, name:"Lotus (Kamal Phool)",             cat:"Flowers",  price:350,  unit:"11 pcs",   icon:"🪷", badge:"Fresh",     deity:"Lakshmi, Saraswati, Vishnu",   desc:"Sacred pink lotus, sourced same morning from local ponds." },
  { id:102, name:"Marigold (Sayapatri/Genda)",      cat:"Flowers",  price:120,  unit:"500g",     icon:"🌼", badge:"Fresh",     deity:"All deities",                  desc:"Bright orange-yellow marigold, most common puja flower." },
  { id:103, name:"Jasmine (Chameli)",               cat:"Flowers",  price:180,  unit:"100g",     icon:"🌸", badge:"Fresh",     deity:"Vishnu, Lakshmi, Devi",        desc:"Pure white jasmine, freshly strung." },
  { id:104, name:"Rose (Gulab) — Red",              cat:"Flowers",  price:200,  unit:"dozen",    icon:"🌹", badge:"Fresh",     deity:"Devi, Ganesha",                desc:"Deep red roses, pesticide-free." },
  { id:105, name:"Rose (Gulab) — White",            cat:"Flowers",  price:200,  unit:"dozen",    icon:"🤍", badge:"Fresh",     deity:"Saraswati, Shiva",             desc:"White roses for Saraswati and lunar rituals." },
  { id:106, name:"Hibiscus (Japa/Gurhal) — Red",   cat:"Flowers",  price:150,  unit:"25 pcs",   icon:"🌺", badge:"Fresh",     deity:"Kali, Durga, Ganesha",         desc:"Red hibiscus — essential for Devi puja and Tantric rites." },
  { id:107, name:"Dhatura (Thorn Apple Flower)",   cat:"Flowers",  price:100,  unit:"11 pcs",   icon:"🌿", badge:"Rare",      deity:"Shiva only",                   desc:"Sacred to Lord Shiva. Offered at Shivling during Shiv puja." },
  { id:108, name:"Aak/Madar Flower (White)",       cat:"Flowers",  price:80,   unit:"25 pcs",   icon:"🤍", badge:"Fresh",     deity:"Shiva, Ganesha, Surya",        desc:"Calotropis flowers — auspicious for Ganesha and Shiva." },
  { id:109, name:"Champak (Champa)",               cat:"Flowers",  price:220,  unit:"50g",      icon:"🌸", badge:"Fresh",     deity:"Vishnu, Lakshmi",              desc:"Golden champak — highly fragrant, beloved by Vishnu." },
  { id:110, name:"Parijat (Harshringar) Night Jasmine", cat:"Flowers", price:180, unit:"100g", icon:"🌸", badge:"Rare",     deity:"Krishna, Vishnu",              desc:"The celestial Parijat — offered to Krishna and Vishnu." },
  { id:111, name:"Aparajita (Butterfly Pea, Blue)", cat:"Flowers", price:140,  unit:"25 pcs",   icon:"💙", badge:"Fresh",     deity:"Durga, Vishnu",                desc:"Blue aparajita, used in Durga Saptashati rituals." },
  { id:112, name:"Ashoka Tree Flowers",            cat:"Flowers",  price:160,  unit:"100g",     icon:"🌸", badge:"Fresh",     deity:"Devi, Vishnu",                 desc:"Bright orange Ashoka blossoms. Auspicious for Devi." },
  { id:113, name:"Kadamba Flowers",               cat:"Flowers",  price:190,  unit:"100g",     icon:"🟡", badge:"Seasonal",  deity:"Krishna, Radha",               desc:"Kadamba — Krishna's favourite flower. Used in Janmashtami." },
  { id:114, name:"Sunflower (Suryamukhi)",         cat:"Flowers",  price:160,  unit:"5 pcs",    icon:"🌻", badge:"Fresh",     deity:"Surya (Sun God)",              desc:"Offered to Surya during Sunday rituals and Chhath Puja." },
  { id:115, name:"Blue Lotus (Neel Kamal)",        cat:"Flowers",  price:450,  unit:"5 pcs",    icon:"💠", badge:"Rare",      deity:"Vishnu, Devi",                 desc:"Extremely rare blue lotus — used in Tantric and Devi pujas." },
  { id:116, name:"Brahma Kamal (Saussurea)",       cat:"Flowers",  price:600,  unit:"3 pcs",    icon:"🌸", badge:"Very Rare", deity:"Brahma, Vishnu, Shiva",        desc:"Sacred Himalayan Brahma Kamal — blooms once a year." },
  { id:117, name:"Chrysanthemum (Shevanti)",       cat:"Flowers",  price:130,  unit:"250g",     icon:"🌼", badge:"Fresh",     deity:"All deities",                  desc:"White and yellow chrysanthemum — used in all-purpose pujas." },
  { id:118, name:"Kaner (Oleander) — Yellow",     cat:"Flowers",  price:100,  unit:"25 pcs",   icon:"🌼", badge:"Fresh",     deity:"Surya, Vishnu",                desc:"Yellow Kaner for Surya puja and Thursday rituals." },
  { id:119, name:"Kaner (Oleander) — White",      cat:"Flowers",  price:100,  unit:"25 pcs",   icon:"🤍", badge:"Fresh",     deity:"Shiva, Saraswati",             desc:"White Kaner for Shiva and Saraswati puja." },
  { id:120, name:"Shankha Pushpa (Morning Glory)", cat:"Flowers", price:120,  unit:"50 pcs",   icon:"🌸", badge:"Fresh",     deity:"Vishnu, Saraswati",            desc:"White conch-shaped flowers — auspicious for learning rituals." },
  { id:121, name:"Mixed Flower Garland (2 ft)",   cat:"Flowers",  price:250,  unit:"1 garland", icon:"💐", badge:"Fresh",     deity:"All deities",                  desc:"Hand-strung mixed flower garland for deity decoration." },
  { id:122, name:"Marigold Garland (3 ft)",       cat:"Flowers",  price:180,  unit:"1 garland", icon:"🌼", badge:"Fresh",     deity:"All deities",                  desc:"Pure marigold garland — doorway decoration and offering." },
  { id:123, name:"Rose Garland (2 ft)",           cat:"Flowers",  price:300,  unit:"1 garland", icon:"🌹", badge:"Fresh",     deity:"Devi, Lakshmi",                desc:"Red rose garland for special Devi and Lakshmi pujas." },

  // ── SACRED LEAVES & GRASS ────────────────────────────────────────────────────
  { id:201, name:"Bilva Patra (Bel Leaves)",       cat:"Leaves & Grass", price:120, unit:"21 leaves", icon:"🌿", badge:"Fresh", deity:"Shiva (essential)",   desc:"The holiest offering for Shiva puja. Three-lobed Bilva." },
  { id:202, name:"Tulsi Manjari (Holy Basil)",     cat:"Leaves & Grass", price:80,  unit:"50g",     icon:"🌿", badge:"Fresh",   deity:"Vishnu, Krishna",     desc:"Fresh Tulsi with manjari (flower buds) — essential for Vishnu." },
  { id:203, name:"Tulsi Leaves (without manjari)", cat:"Leaves & Grass", price:60,  unit:"50g",     icon:"🌱", badge:"Fresh",   deity:"Vishnu, Krishna",     desc:"Fresh holy basil leaves for daily puja and panchamrit." },
  { id:204, name:"Durva Grass (Doob)",             cat:"Leaves & Grass", price:80,  unit:"bundle",  icon:"🌾", badge:"Fresh",   deity:"Ganesha (essential)", desc:"Three-bladed Durva — the most sacred grass for Ganesha." },
  { id:205, name:"Kusha/Darbha Grass",             cat:"Leaves & Grass", price:100, unit:"bundle",  icon:"🌾", badge:"Fresh",   deity:"All pujas (ring)",    desc:"Sacred grass for asana, ring-making, and purification rites." },
  { id:206, name:"Mango Leaves (Aamra Patra)",     cat:"Leaves & Grass", price:60,  unit:"21 leaves",icon:"🍃", badge:"Fresh",  deity:"All auspicious pujas",desc:"Fresh mango leaves for kalash topping and doorway decoration." },
  { id:207, name:"Banana Leaves (Kela Patra)",     cat:"Leaves & Grass", price:80,  unit:"2 leaves", icon:"🍃", badge:"Fresh",  deity:"Vishnu, all pujas",   desc:"Large fresh banana leaf — used as natural puja plate (patthal)." },
  { id:208, name:"Pipal Leaves (Ashvattha)",       cat:"Leaves & Grass", price:70,  unit:"21 leaves",icon:"🍃", badge:"Fresh",  deity:"Vishnu, Satyanarayan",desc:"Sacred Pipal — the tree of Vishnu and enlightenment." },
  { id:209, name:"Neem Leaves (Nimba Patra)",      cat:"Leaves & Grass", price:60,  unit:"bundle",  icon:"🌿", badge:"Fresh",   deity:"Durga, Devi",         desc:"Neem leaves for purification and Durga Navratri rituals." },
  { id:210, name:"Ashoka Leaves",                  cat:"Leaves & Grass", price:90,  unit:"21 leaves",icon:"🍃", badge:"Fresh",  deity:"Devi, all pujas",     desc:"Ashoka leaves for auspicious ceremonies and kalash." },
  { id:211, name:"Palas Leaves (Flame of Forest)", cat:"Leaves & Grass", price:100, unit:"bundle",  icon:"🍃", badge:"Fresh",   deity:"Havan/Yajna",         desc:"Used in havan for specific graha shanti rituals." },
  { id:212, name:"Betel Leaves (Paan Patra)",      cat:"Leaves & Grass", price:120, unit:"25 leaves",icon:"🌿", badge:"Fresh",  deity:"All deities",         desc:"Fresh betel leaves — essential for tambolam offering." },
  { id:213, name:"Lotus Leaves (Kamal Patra)",     cat:"Leaves & Grass", price:150, unit:"5 leaves", icon:"🍃", badge:"Fresh",  deity:"Lakshmi, Vishnu",     desc:"Pure lotus leaves for Lakshmi puja and deep/lamp floating." },
  { id:214, name:"Coconut Leaves (Narikela Patra)",cat:"Leaves & Grass", price:80,  unit:"5 leaves", icon:"🌴", badge:"Fresh",  deity:"All pujas",           desc:"Young coconut palm leaves for pandal and decoration." },

  // ── SEEDS & GRAINS ────────────────────────────────────────────────────────────
  { id:301, name:"Akshat (Unbroken Rice, white)",  cat:"Seeds & Grains", price:80,  unit:"500g", icon:"🍚", badge:"Pure",    deity:"All deities",         desc:"Whole unbroken white rice — used in every puja as offering." },
  { id:302, name:"Black Sesame (Kala Til)",        cat:"Seeds & Grains", price:120, unit:"250g", icon:"⚫", badge:"Pure",    deity:"Shani, Pitru",        desc:"Black til for Shani puja, Pitru Tarpan, and Shraddha." },
  { id:303, name:"White Sesame (Safed Til)",       cat:"Seeds & Grains", price:100, unit:"250g", icon:"⚪", badge:"Pure",    deity:"Surya, all pujas",    desc:"White sesame for Surya puja, havan, and Makar Sankranti." },
  { id:304, name:"Barley (Jau/Yava)",              cat:"Seeds & Grains", price:90,  unit:"500g", icon:"🌾", badge:"Pure",    deity:"All havans",          desc:"Sacred barley — used in havan samagri and Jau offerings." },
  { id:305, name:"Black Gram (Urad Dal/Maash)",    cat:"Seeds & Grains", price:140, unit:"250g", icon:"🫘", badge:"Pure",    deity:"Shani, Hanumanji",    desc:"Whole black gram for Shani puja and Saturday rituals." },
  { id:306, name:"Green Gram (Moong)",             cat:"Seeds & Grains", price:130, unit:"250g", icon:"🫘", badge:"Pure",    deity:"Mercury, Vishnu",     desc:"Whole green moong — offered on Wednesdays for Budh graha." },
  { id:307, name:"Chickpea (Chana/Chanaka)",       cat:"Seeds & Grains", price:110, unit:"250g", icon:"🟡", badge:"Pure",    deity:"Hanuman, Surya",      desc:"Whole chickpeas — offered to Hanumanji on Tuesdays." },
  { id:308, name:"Mustard Seeds (Sarso/Raai)",     cat:"Seeds & Grains", price:80,  unit:"250g", icon:"🔵", badge:"Pure",    deity:"Kali, protective rites",desc:"Black mustard — for Kali puja and evil-eye protection rituals." },
  { id:309, name:"Wheat (Gehun/Godhuma)",          cat:"Seeds & Grains", price:100, unit:"500g", icon:"🌾", badge:"Pure",    deity:"Surya, Satyanarayan", desc:"Whole wheat grain for Surya puja and Satyanarayan prasad." },
  { id:310, name:"Lentil (Masur Dal — red)",       cat:"Seeds & Grains", price:120, unit:"250g", icon:"🔴", badge:"Pure",    deity:"Mars, Durga",         desc:"Red masur — offered on Tuesdays for Mangal (Mars) puja." },
  { id:311, name:"Flax Seeds (Alsi)",              cat:"Seeds & Grains", price:90,  unit:"250g", icon:"🟤", badge:"Pure",    deity:"Havan samagri",       desc:"Flax seeds added to havan samagri for specific yagnas." },
  { id:312, name:"Lotus Seeds (Makhana)",          cat:"Seeds & Grains", price:300, unit:"100g", icon:"⚪", badge:"Pure",    deity:"Lakshmi, Vishnu",     desc:"Fox nuts (makhana) — auspicious offering and prasad." },
  { id:313, name:"Pancha Dhanya (Five Grains Set)",cat:"Seeds & Grains", price:180, unit:"set",  icon:"🌾", badge:"Set",     deity:"All pujas (kalash)",  desc:"Wheat, rice, moong, urad, chana — for kalash and navratri." },
  { id:314, name:"Sapta Dhanya (Seven Grains Set)",cat:"Seeds & Grains", price:220, unit:"set",  icon:"🌾", badge:"Set",     deity:"Graha shanti",        desc:"Seven sacred grains for Navagraha shanti rituals." },
  { id:315, name:"Navadhanya (Nine Grains Set)",   cat:"Seeds & Grains", price:280, unit:"set",  icon:"🌾", badge:"Set",     deity:"Navagraha",           desc:"Nine grains for nine planets — complete Navagraha samagri." },
  { id:316, name:"Pumpkin Seeds (Kaddu Beej)",     cat:"Seeds & Grains", price:140, unit:"100g", icon:"🎃", badge:"Pure",    deity:"Ketu remedies",       desc:"Raw pumpkin seeds for Ketu remedies and certain havan." },
  { id:317, name:"Hemp Seeds (Bhang Beej)",        cat:"Seeds & Grains", price:200, unit:"100g", icon:"🌿", badge:"Sacred",  deity:"Shiva",               desc:"Hemp seeds — sacred to Shiva. Used in Shivratri offerings." },
  { id:318, name:"Jowar (Sorghum)",                cat:"Seeds & Grains", price:90,  unit:"500g", icon:"🌾", badge:"Pure",    deity:"Devi, harvest pujas", desc:"Sorghum — offered during Navratri and harvest festivals." },
  { id:319, name:"Poppy Seeds (Khus Khus/Post)",   cat:"Seeds & Grains", price:180, unit:"100g", icon:"⚪", badge:"Pure",    deity:"Havan, Lakshmi",      desc:"White poppy seeds for havan samagri and Lakshmi puja." },
  { id:320, name:"Millet (Bajra/Bajri)",           cat:"Seeds & Grains", price:80,  unit:"500g", icon:"🌾", badge:"Pure",    deity:"Pitru, Shraddha",     desc:"Pearl millet — offered to ancestors during Shraddha rituals." },

  // ── MILK, DAIRY & PANCHAMRIT ──────────────────────────────────────────────────
  { id:401, name:"Pure Cow Milk (Gai ko Doodh)",   cat:"Milk & Dairy", price:120, unit:"500ml", icon:"🥛", badge:"Pure",    deity:"All deities",         desc:"Fresh A2 cow milk, unprocessed. From local Nepali gai." },
  { id:402, name:"Pure Curd (Dahi)",               cat:"Milk & Dairy", price:150, unit:"500g",  icon:"🫙", badge:"Pure",    deity:"Shiva, Moon remedy",  desc:"Set curd from pure cow milk. No preservatives or mixture." },
  { id:403, name:"Pure Cow Ghee (Gai ko Ghiu)",    cat:"Milk & Dairy", price:650, unit:"500ml", icon:"🍯", badge:"Best Seller",deity:"All (havan essential)",desc:"Hand-churned A2 cow ghee. Golden, pure, most sacred fat." },
  { id:404, name:"Butter (Navaneet/Makhan)",       cat:"Milk & Dairy", price:350, unit:"250g",  icon:"🧈", badge:"Pure",    deity:"Krishna (essential)", desc:"Freshly churned white butter — Krishna's most loved offering." },
  { id:405, name:"Raw Honey (Jungle Madhu)",        cat:"Milk & Dairy", price:450, unit:"250g",  icon:"🍯", badge:"Pure",    deity:"All deities",         desc:"Wild forest honey, unprocessed, unheated. Nepal highlands." },
  { id:406, name:"Rock Sugar (Mishri/Khadisakkhar)",cat:"Milk & Dairy", price:140, unit:"250g",  icon:"🪨", badge:"Pure",    deity:"Vishnu, Saraswati",   desc:"Crystalline rock candy — pure, unrefined. Used in panchamrit." },
  { id:407, name:"Panchamrit Set (all 5)",          cat:"Milk & Dairy", price:550, unit:"set",   icon:"🫙", badge:"Complete", deity:"Vishnu, Shiva, all",  desc:"Milk, curd, ghee, honey, mishri — all pure, measured set." },
  { id:408, name:"Shuddha Jaggery (Gur)",          cat:"Milk & Dairy", price:180, unit:"500g",  icon:"🟤", badge:"Pure",    deity:"Surya, havan",        desc:"Organic unrefined jaggery — no sulphur, no chemicals." },
  { id:409, name:"Sugar (Cheeni/Sharkara)",        cat:"Milk & Dairy", price:100, unit:"500g",  icon:"⚪", badge:"Pure",    deity:"All pujas",           desc:"Pure white sugar for prasad, havan, and naivedya." },
  { id:410, name:"Coconut Water (Narikela Jal)",   cat:"Milk & Dairy", price:60,  unit:"1 nut", icon:"🥥", badge:"Fresh",   deity:"All pujas",           desc:"Fresh coconut with water intact — for abhishek and offering." },

  // ── OILS & SACRED LIQUIDS ──────────────────────────────────────────────────────
  { id:501, name:"Mustard Oil (Sarso Tel)",         cat:"Oils & Liquids", price:180, unit:"250ml", icon:"🫙", badge:"Pure",   deity:"Shani, Hanumanji",    desc:"Cold-pressed mustard oil for Shani diya and Hanuman puja." },
  { id:502, name:"Sesame Oil (Til ka Tel)",         cat:"Oils & Liquids", price:220, unit:"250ml", icon:"🫙", badge:"Pure",   deity:"Shani, Pitru",        desc:"Cold-pressed black sesame oil for Shani and Shraddha lamps." },
  { id:503, name:"Coconut Oil (Narikel Tel)",       cat:"Oils & Liquids", price:200, unit:"250ml", icon:"🫙", badge:"Pure",   deity:"Lakshmi, Vishnu",     desc:"Virgin cold-pressed coconut oil for Lakshmi puja lamps." },
  { id:504, name:"Castor Oil (Arandi Tel)",         cat:"Oils & Liquids", price:180, unit:"250ml", icon:"🫙", badge:"Pure",   deity:"Shani, Nav. remedies", desc:"Pure cold-pressed castor oil for Shani graha lamp." },
  { id:505, name:"Rose Water (Gulab Jal)",          cat:"Oils & Liquids", price:150, unit:"100ml", icon:"🌹", badge:"Pure",   deity:"Devi, all pujas",     desc:"Steam-distilled rose water — for sprinkling and abhishek." },
  { id:506, name:"Gangajal (Holy Ganga Water)",     cat:"Oils & Liquids", price:200, unit:"100ml", icon:"💧", badge:"Sacred", deity:"All pujas (essential)",desc:"Authentic Ganga water from Haridwar. Sealed, certified pure." },
  { id:507, name:"Pancha Gavya (Five Cow Products)",cat:"Oils & Liquids", price:350, unit:"set",   icon:"🐄", badge:"Sacred", deity:"All pujas, purification",desc:"Milk, curd, ghee, cow urine (gomutra), cow dung. Full set." },
  { id:508, name:"Gomutra (Cow Urine)",             cat:"Oils & Liquids", price:120, unit:"100ml", icon:"🫙", badge:"Sacred", deity:"Purification rites",  desc:"Pure cow urine from desi gai — used for purification." },
  { id:509, name:"Sugarcane Juice (Iksha Rasa)",   cat:"Oils & Liquids", price:100, unit:"250ml", icon:"🧃", badge:"Fresh",  deity:"Surya, Chhath Puja",  desc:"Fresh pressed sugarcane juice for Chhath and Surya offerings." },
  { id:510, name:"Sandalwood Oil (Chandan Tel)",    cat:"Oils & Liquids", price:400, unit:"10ml",  icon:"🫙", badge:"Pure",   deity:"Vishnu, Shiva",       desc:"Pure Mysore sandalwood essential oil — for tilak and abhishek." },

  // ── SACRED POWDERS, PASTES & COLOURS ──────────────────────────────────────────
  { id:601, name:"Sindoor (Vermillion, natural)",   cat:"Powders & Pastes", price:120, unit:"50g", icon:"🔴", badge:"Pure",   deity:"Devi, Hanuman",       desc:"Natural stone-ground vermillion. No synthetic colour." },
  { id:602, name:"Kumkum (Red powder)",             cat:"Powders & Pastes", price:100, unit:"50g", icon:"🔴", badge:"Pure",   deity:"Devi, all pujas",     desc:"Pure kumkum from turmeric and lime — natural saffron-red." },
  { id:603, name:"Haldi (Turmeric powder)",         cat:"Powders & Pastes", price:120, unit:"100g",icon:"🟡", badge:"Pure",   deity:"All pujas",           desc:"Organic farm-fresh turmeric — no artificial colour or filler." },
  { id:604, name:"Chandan Paste (Sandalwood)",      cat:"Powders & Pastes", price:280, unit:"50g", icon:"🟤", badge:"Pure",   deity:"Vishnu, Shiva",       desc:"Pure white sandalwood paste — for tilak and deity smearing." },
  { id:605, name:"Kesar (Saffron)",                 cat:"Powders & Pastes", price:800, unit:"1g",  icon:"🟠", badge:"Pure",   deity:"Lakshmi, Vishnu",     desc:"Genuine Kashmiri saffron (Mongra grade) — for tilak and bhog." },
  { id:606, name:"Roli (Mixed Tilak powder)",       cat:"Powders & Pastes", price:80,  unit:"50g", icon:"🔴", badge:"Pure",   deity:"All pujas",           desc:"Traditional roli for tilak — natural kumkum and chandan blend." },
  { id:607, name:"Vibhuti (Sacred Ash)",            cat:"Powders & Pastes", price:150, unit:"100g",icon:"⚪", badge:"Sacred", deity:"Shiva (essential)",   desc:"Pure vibhuti from cow dung and sacred wood — for Shiva tilak." },
  { id:608, name:"Gopichandana (White clay)",       cat:"Powders & Pastes", price:180, unit:"100g",icon:"⚪", badge:"Sacred", deity:"Vishnu, Vaishnavas",  desc:"Pure Dwarka clay for urdhva pundra Vaishnava tilak." },
  { id:609, name:"Abir/Gulal (Natural Red)",        cat:"Powders & Pastes", price:100, unit:"100g",icon:"🔴", badge:"Natural",deity:"Holi, all pujas",     desc:"100% natural herbal gulal from flowers — no chemical dye." },
  { id:610, name:"Abir/Gulal (Natural Yellow)",     cat:"Powders & Pastes", price:100, unit:"100g",icon:"🟡", badge:"Natural",deity:"Holi, Vishnu",        desc:"Natural turmeric-based yellow gulal — pure and safe." },
  { id:611, name:"Abir/Gulal (Natural Green)",      cat:"Powders & Pastes", price:100, unit:"100g",icon:"🟢", badge:"Natural",deity:"Holi",                desc:"Herbal green gulal from Mehendi and leaves — pure." },
  { id:612, name:"Naag Champa Powder (loose)",      cat:"Powders & Pastes", price:150, unit:"50g", icon:"🟤", badge:"Pure",   deity:"Shiva, Naga deities", desc:"Pure Naag Champa resin powder for direct burning on coal." },
  { id:613, name:"Panchamrit Snan Powder",          cat:"Powders & Pastes", price:200, unit:"set", icon:"⚪", badge:"Set",    deity:"All deity abhishek",  desc:"Pre-measured powders for complete panchamrit bathing ritual." },
  { id:614, name:"Raj Tilak (Natural compound)",    cat:"Powders & Pastes", price:250, unit:"50g", icon:"🔶", badge:"Special",deity:"Kshatriya rituals",   desc:"Traditional compound tilak for coronation and warrior rituals." },

  // ── INCENSE, DHOOP & CAMPHOR ────────────────────────────────────────────────────
  { id:701, name:"Sandalwood Agarbatti (pure resin)",cat:"Incense & Dhoop", price:280, unit:"20 sticks",icon:"🪔", badge:"Pure",  deity:"Vishnu, all pujas",   desc:"Pure sandalwood resin — no synthetic fragrance or charcoal." },
  { id:702, name:"Rose Agarbatti",                   cat:"Incense & Dhoop", price:200, unit:"20 sticks",icon:"🌹", badge:"Pure",  deity:"Devi, Lakshmi",       desc:"Natural rose petal extract incense — for Devi puja." },
  { id:703, name:"Jasmine Agarbatti",                cat:"Incense & Dhoop", price:200, unit:"20 sticks",icon:"🌸", badge:"Pure",  deity:"Vishnu, Lakshmi",     desc:"Pure jasmine extract — light, divine fragrance." },
  { id:704, name:"Guggal Dhoop (Resin)",             cat:"Incense & Dhoop", price:220, unit:"50g",      icon:"🟤", badge:"Pure",  deity:"All pujas (purifier)", desc:"Pure Boswellia Guggal resin — the most sacred purifying dhoop." },
  { id:705, name:"Loban Dhoop (Benzoin)",            cat:"Incense & Dhoop", price:240, unit:"50g",      icon:"🟤", badge:"Pure",  deity:"All pujas",           desc:"Pure benzoin/loban resin — for removing negative energy." },
  { id:706, name:"Camphor (Kapur) — Bhimseni",      cat:"Incense & Dhoop", price:180, unit:"50g",      icon:"⚪", badge:"Pure",  deity:"All pujas (aarti)",   desc:"Bhimseni camphor — purest grade, burns completely clean." },
  { id:707, name:"Camphor Tablets (Kapur Vati)",    cat:"Incense & Dhoop", price:120, unit:"50 tablets",icon:"⚪", badge:"Pure", deity:"All pujas (aarti)",   desc:"Pressed camphor tablets for easy aarti use." },
  { id:708, name:"Dhoop Sticks (Cow Dung/Gobar)",   cat:"Incense & Dhoop", price:150, unit:"20 sticks",icon:"🟤", badge:"Sacred",deity:"All pujas",           desc:"Pure cow dung dhoop — ancient Vedic purifier. No chemicals." },
  { id:709, name:"Sambrani Dhoop Cups",              cat:"Incense & Dhoop", price:200, unit:"10 cups",  icon:"🔥", badge:"Pure",  deity:"Devi, Lakshmi",       desc:"Benzoin cup dhoop — lit and circled for home purification." },
  { id:710, name:"Havan Samagri Mix (complete)",    cat:"Incense & Dhoop", price:350, unit:"500g",     icon:"🌿", badge:"Complete",deity:"Havan/Yajna",        desc:"54-herb complete havan samagri — all pure, ground fresh." },
  { id:711, name:"Chandan Dhoop Sticks",            cat:"Incense & Dhoop", price:280, unit:"20 sticks",icon:"🟤", badge:"Pure",  deity:"Vishnu, all",         desc:"Pure sandalwood dhoop sticks — no bamboo, no charcoal." },
  { id:712, name:"Kapoor Aarti Set",               cat:"Incense & Dhoop", price:250, unit:"set",      icon:"🪔", badge:"Set",   deity:"All pujas (aarti)",   desc:"Bhimseni camphor + brass aarti plate + holder — complete." },
  { id:713, name:"Agar Wood (Oud/Aloeswood) chips", cat:"Incense & Dhoop", price:800, unit:"10g",      icon:"🟤", badge:"Rare",  deity:"All (highest grade)", desc:"Genuine oud/agarwood chips for direct burning — divine aroma." },

  // ── CLOTH PIECES (VASTRA) ─────────────────────────────────────────────────────
  { id:801, name:"Yellow Silk Cloth (Pitambar)",    cat:"Cloth Pieces",  price:850,  unit:"2m",  icon:"🟡", badge:"Silk",    deity:"Vishnu, Krishna, Jupiter",desc:"Pure yellow silk — the sacred cloth of Vishnu and auspicious occasions." },
  { id:802, name:"Red Silk Cloth",                  cat:"Cloth Pieces",  price:900,  unit:"2m",  icon:"🔴", badge:"Silk",    deity:"Devi, Lakshmi, Mars",    desc:"Pure red silk for Durga, Kali, and Lakshmi puja offerings." },
  { id:803, name:"White Silk Cloth",                cat:"Cloth Pieces",  price:880,  unit:"2m",  icon:"⚪", badge:"Silk",    deity:"Saraswati, Shiva, Moon", desc:"Pure white silk for Saraswati puja and Shiva offerings." },
  { id:804, name:"Orange Silk Cloth (Kesariya)",   cat:"Cloth Pieces",  price:870,  unit:"2m",  icon:"🟠", badge:"Silk",    deity:"Hanuman, Surya",         desc:"Saffron-orange silk — for Hanuman and Surya puja." },
  { id:805, name:"Blue Silk Cloth (Nilambara)",     cat:"Cloth Pieces",  price:890,  unit:"2m",  icon:"🔵", badge:"Silk",    deity:"Vishnu, Krishna, Saturn",desc:"Blue silk — for Vishnu in Nilambara form and Saturn remedies." },
  { id:806, name:"Green Silk Cloth",               cat:"Cloth Pieces",  price:860,  unit:"2m",  icon:"🟢", badge:"Silk",    deity:"Mercury, Budh puja",     desc:"Green silk for Mercury/Budh puja on Wednesdays." },
  { id:807, name:"Black Cloth (Shani Vastra)",     cat:"Cloth Pieces",  price:400,  unit:"2m",  icon:"⚫", badge:"Pure",    deity:"Shani (Saturn)",         desc:"Pure black cotton cloth — offered to Shani on Saturdays." },
  { id:808, name:"Yellow Cotton Cloth",            cat:"Cloth Pieces",  price:280,  unit:"2m",  icon:"🟡", badge:"Pure",    deity:"Vishnu, general puja",   desc:"Pure yellow cotton for general pujas where silk is not available." },
  { id:809, name:"Red Cotton Cloth",              cat:"Cloth Pieces",  price:260,  unit:"2m",  icon:"🔴", badge:"Pure",    deity:"Devi, general puja",     desc:"Bright red unbleached cotton for Devi and general offerings." },
  { id:810, name:"White Cotton Cloth",            cat:"Cloth Pieces",  price:240,  unit:"2m",  icon:"⚪", badge:"Pure",    deity:"All pujas",              desc:"Pure unbleached white cotton — used in almost every puja." },
  { id:811, name:"New Dhoti (Unstitched white)",  cat:"Cloth Pieces",  price:350,  unit:"1 pc",icon:"🤍", badge:"Pure",    deity:"Brahmin offering, Pitru",desc:"New unstitched white dhoti for pandit dakshina and ancestor offering." },
  { id:812, name:"Silk Angavastram",              cat:"Cloth Pieces",  price:700,  unit:"1 pc",icon:"🟡", badge:"Silk",    deity:"Deity decoration",       desc:"Silk shoulder cloth for draping over deity or prasad." },
  { id:813, name:"Mauli Thread (Red-Yellow)",     cat:"Cloth Pieces",  price:80,   unit:"10m", icon:"🟡", badge:"Sacred",  deity:"All pujas (kalai)",      desc:"Sacred thread dyed with natural turmeric and sindoor." },
  { id:814, name:"Janai (Yagyopavit/Janehu)",    cat:"Cloth Pieces",  price:120,  unit:"5 pcs",icon:"⚪", badge:"Sacred", deity:"Bratabandha, Havan",     desc:"Sacred thread for Bratabandha, Upanayana, and daily Sandhya." },
  { id:815, name:"Kalava Thread (plain red)",    cat:"Cloth Pieces",  price:60,   unit:"10m", icon:"🔴", badge:"Sacred",  deity:"All pujas",              desc:"Pure red thread for wrist tying after puja blessings." },
  { id:816, name:"Puja Cloth Set (7 colours)",   cat:"Cloth Pieces",  price:1200, unit:"set", icon:"🌈", badge:"Set",     deity:"Navagraha puja",         desc:"Seven coloured cloth pieces for seven-planet Navagraha puja." },
  { id:817, name:"Navagraha Cloth Set (9 pcs)",  cat:"Cloth Pieces",  price:1800, unit:"set", icon:"🌈", badge:"Set",     deity:"Navagraha (complete)",   desc:"All nine planet colours: red, white, orange, green, yellow, blue/white, black, multi, grey-brown." },
  { id:818, name:"Pitambar Dhoti (for deity)",   cat:"Cloth Pieces",  price:2200, unit:"1 pc",icon:"🟡", badge:"Silk",   deity:"Vishnu deity dressing",   desc:"Fine pure Kanchipuram silk dhoti for dressing Vishnu murti." },

  // ── SACRED STONES & CRYSTALS ─────────────────────────────────────────────────
  { id:901, name:"Shaligram Shila (Gandaki)",     cat:"Sacred Stones",  price:1200, unit:"1 pc",  icon:"🪨", badge:"Certified",  deity:"Vishnu (essential)",    desc:"Authentic Gandaki river Shaligram — verified ammonite fossil." },
  { id:902, name:"Spatik Shivling (Crystal)",     cat:"Sacred Stones",  price:1800, unit:"1 pc",  icon:"💠", badge:"Natural",     deity:"Shiva",                 desc:"Clear quartz crystal Shivling — natural, unpolished." },
  { id:903, name:"Parad Shivling (Mercury)",      cat:"Sacred Stones",  price:3500, unit:"1 pc",  icon:"🔘", badge:"Very Rare",   deity:"Shiva (highest merit)", desc:"Solidified mercury Shivling — purified via 8 Samskara process." },
  { id:904, name:"Narmada Bana Lingam",           cat:"Sacred Stones",  price:800,  unit:"1 pc",  icon:"🪨", badge:"Sacred",      deity:"Shiva",                 desc:"Naturally smooth egg-shaped Narmada river Shivling." },
  { id:905, name:"Gomati Chakra",                 cat:"Sacred Stones",  price:50,   unit:"11 pcs",icon:"🐚", badge:"Sacred",      deity:"Lakshmi, Vishnu",       desc:"Natural Gomati river spiral stone — for prosperity rituals." },
  { id:906, name:"Sphatik Mala (Quartz, 108)",   cat:"Sacred Stones",  price:950,  unit:"1 mala",icon:"📿", badge:"Natural",     deity:"Vishnu, Saraswati",     desc:"Clear crystal quartz mala — natural, untreated, 8mm beads." },
  { id:907, name:"Hakik Stone (Black Agate)",     cat:"Sacred Stones",  price:400,  unit:"1 pc",  icon:"⚫", badge:"Natural",     deity:"Rahu, protection",      desc:"Natural black agate for Rahu remedies and protection." },
  { id:908, name:"Sulemani Hakik (Banded Agate)",cat:"Sacred Stones",  price:600,  unit:"1 pc",  icon:"🟤", badge:"Natural",     deity:"Rahu, Saturn",          desc:"Banded Sulemani agate — powerful stone for Rahu and Shani." },
  { id:909, name:"Sphatik Ball (Crystal Sphere)",cat:"Sacred Stones",  price:1400, unit:"1 pc",  icon:"🔮", badge:"Natural",     deity:"Saraswati, Lakshmi",    desc:"Clear quartz scrying ball — 5cm, natural, no lead glass." },
  { id:910, name:"Rose Quartz (Rough)",           cat:"Sacred Stones",  price:300,  unit:"100g",  icon:"🩷", badge:"Natural",     deity:"Lakshmi, Venus",        desc:"Raw rose quartz chunks for love and Lakshmi altar." },
  { id:911, name:"Amethyst Crystal (Rough)",      cat:"Sacred Stones",  price:350,  unit:"100g",  icon:"💜", badge:"Natural",     deity:"Jupiter, wisdom",       desc:"Natural amethyst for Jupiter remedies and meditation." },
  { id:912, name:"Pyrite (Fool's Gold)",          cat:"Sacred Stones",  price:400,  unit:"100g",  icon:"🟡", badge:"Natural",     deity:"Lakshmi, wealth",       desc:"Natural pyrite clusters for wealth altar and Lakshmi puja." },
  { id:913, name:"Black Tourmaline",              cat:"Sacred Stones",  price:500,  unit:"100g",  icon:"⚫", badge:"Natural",     deity:"Protection",            desc:"Raw black tourmaline for negative energy protection." },
  { id:914, name:"Selenite Wand",                cat:"Sacred Stones",  price:450,  unit:"1 pc",  icon:"⚪", badge:"Natural",     deity:"Moon, Saraswati",       desc:"Pure selenite wand for purification and lunar rituals." },
  { id:915, name:"Yellow Calcite",               cat:"Sacred Stones",  price:300,  unit:"100g",  icon:"🟡", badge:"Natural",     deity:"Jupiter, knowledge",    desc:"Yellow calcite for Brihaspati and knowledge enhancement." },
  { id:916, name:"Lapis Lazuli",                 cat:"Sacred Stones",  price:700,  unit:"1 pc",  icon:"🔵", badge:"Natural",     deity:"Vishnu, Saturn",        desc:"Deep blue lapis for Saturn remedies and Vishnu worship." },
  { id:917, name:"Turquoise Stone",              cat:"Sacred Stones",  price:900,  unit:"1 pc",  icon:"🔵", badge:"Natural",     deity:"Jupiter, Venus",        desc:"Natural turquoise — for prosperity, health, and good fortune." },
  { id:918, name:"Parad Gutika (Mercury Ball)",  cat:"Sacred Stones",  price:2000, unit:"1 pc",  icon:"🔘", badge:"Very Rare",   deity:"Shiva, Nag remedies",   desc:"Purified mercury ball — for wearing and puja. Eight-Samskara purified." },

  // ── GEMSTONES (NAVARATNA / GRAHA RATNA) ──────────────────────────────────────
  { id:1001,name:"Ruby (Manik) — Natural",         cat:"Gemstones",    price:8500,  unit:"1ct",  icon:"♦", badge:"Certified",  deity:"Sun (Surya)",           desc:"Natural unheated ruby for Sun planet remedy. GIA-style certified." },
  { id:1002,name:"Pearl (Moti) — Basra",           cat:"Gemstones",    price:3500,  unit:"5 ratti",icon:"⚪",badge:"Certified", deity:"Moon (Chandra)",        desc:"Natural Basra pearl for Moon remedy — not farmed or treated." },
  { id:1003,name:"Red Coral (Moonga) — Italian",   cat:"Gemstones",    price:4500,  unit:"5 ratti",icon:"🔴",badge:"Certified", deity:"Mars (Mangal)",         desc:"Natural undyed Italian red coral — for Mars planet remedy." },
  { id:1004,name:"Emerald (Panna) — Colombian",    cat:"Gemstones",    price:12000, unit:"1ct",  icon:"🟢", badge:"Certified",  deity:"Mercury (Budh)",        desc:"Natural Colombian emerald for Budh graha — unheated, certified." },
  { id:1005,name:"Yellow Sapphire (Pukhraj)",      cat:"Gemstones",    price:9000,  unit:"3 ratti",icon:"🟡",badge:"Certified", deity:"Jupiter (Brihaspati)",  desc:"Natural Ceylon yellow sapphire — unheated, for Guru puja." },
  { id:1006,name:"Diamond (Heera) — Natural",      cat:"Gemstones",    price:35000, unit:"0.25ct",icon:"💎",badge:"Certified",  deity:"Venus (Shukra)",        desc:"Natural diamond for Shukra graha — GIA certified." },
  { id:1007,name:"White Sapphire (Shvet Pushparaj)",cat:"Gemstones",   price:5500,  unit:"3 ratti",icon:"⚪",badge:"Certified", deity:"Venus (Shukra alt.)",  desc:"Natural white sapphire — affordable Venus remedy stone." },
  { id:1008,name:"Blue Sapphire (Neelam)",         cat:"Gemstones",    price:15000, unit:"2 ratti",icon:"🔵",badge:"Certified", deity:"Saturn (Shani)",        desc:"Natural Sri Lanka blue sapphire — for Saturn. Test first!" },
  { id:1009,name:"Hessonite (Gomed) — Natural",    cat:"Gemstones",    price:3000,  unit:"5 ratti",icon:"🟤",badge:"Certified", deity:"Rahu",                  desc:"Natural hessonite garnet for Rahu remedy — honey-coloured." },
  { id:1010,name:"Cat's Eye (Lehsunia/Vaidurya)",  cat:"Gemstones",    price:4000,  unit:"3 ratti",icon:"🟡",badge:"Certified", deity:"Ketu",                  desc:"Natural chrysoberyl cat's eye for Ketu remedy — chatoyant." },
  { id:1011,name:"Navratna Ring (all 9 stones)",   cat:"Gemstones",    price:25000, unit:"1 ring",icon:"💍", badge:"Set",        deity:"All 9 grahas",           desc:"Gold ring with all 9 gemstones — certified natural stones." },

  // ── RUDRAKSHA ────────────────────────────────────────────────────────────────
  { id:1101,name:"1 Mukhi Rudraksha",              cat:"Rudraksha",    price:8500,  unit:"1 bead",icon:"📿", badge:"Very Rare",  deity:"Shiva (supreme)",       desc:"Single-faced rudraksha — rarest, for Shiva connection and moksha." },
  { id:1102,name:"2 Mukhi Rudraksha",              cat:"Rudraksha",    price:600,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Shiva-Parvati, Moon",   desc:"Two-faced — for harmony, marriage, and Moon remedy." },
  { id:1103,name:"3 Mukhi Rudraksha",              cat:"Rudraksha",    price:400,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Agni, Mars",            desc:"Three-faced — for Mars remedy and fire purification." },
  { id:1104,name:"4 Mukhi Rudraksha",              cat:"Rudraksha",    price:350,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Brahma, Mercury",       desc:"Four-faced — for knowledge, communication, Mercury remedy." },
  { id:1105,name:"5 Mukhi Rudraksha",              cat:"Rudraksha",    price:250,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Shiva Kalagni",         desc:"Most common and auspicious — good for all. Jupiter remedy." },
  { id:1106,name:"6 Mukhi Rudraksha",              cat:"Rudraksha",    price:500,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Kartikeya, Venus",      desc:"Six-faced — for Venus remedy, creativity, and willpower." },
  { id:1107,name:"7 Mukhi Rudraksha",              cat:"Rudraksha",    price:700,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Mahalakshmi, Saturn",   desc:"Seven-faced — for Saturn remedy, wealth, and good luck." },
  { id:1108,name:"8 Mukhi Rudraksha",              cat:"Rudraksha",    price:900,   unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Ganesha, Rahu",         desc:"Eight-faced — for Rahu remedy and obstacle removal." },
  { id:1109,name:"9 Mukhi Rudraksha",              cat:"Rudraksha",    price:1200,  unit:"1 bead",icon:"📿", badge:"Certified",  deity:"Durga, Ketu",           desc:"Nine-faced — for Ketu remedy and Shakti connection." },
  { id:1110,name:"10 Mukhi Rudraksha",             cat:"Rudraksha",    price:1800,  unit:"1 bead",icon:"📿", badge:"Rare",       deity:"Vishnu, all grahas",    desc:"Ten-faced — pacifies all planets, Vishnu's blessing." },
  { id:1111,name:"11 Mukhi Rudraksha",             cat:"Rudraksha",    price:2500,  unit:"1 bead",icon:"📿", badge:"Rare",       deity:"Hanuman, Indra",        desc:"Eleven-faced — for adventure, wisdom, and Hanuman's blessing." },
  { id:1112,name:"12 Mukhi Rudraksha",             cat:"Rudraksha",    price:3000,  unit:"1 bead",icon:"📿", badge:"Rare",       deity:"Surya (Sun)",           desc:"Twelve-faced — for Sun remedy, leadership, and vitality." },
  { id:1113,name:"14 Mukhi Rudraksha",             cat:"Rudraksha",    price:5000,  unit:"1 bead",icon:"📿", badge:"Very Rare",  deity:"Hanuman, Shiva",        desc:"Fourteen-faced — awakens the third eye, supreme protection." },
  { id:1114,name:"5 Mukhi Mala (108+1 beads)",    cat:"Rudraksha",    price:2200,  unit:"1 mala",icon:"📿", badge:"Certified",  deity:"Shiva, all pujas",      desc:"Full 108+1 bead japa mala — Nepal origin, authenticated." },
  { id:1115,name:"Rudraksha Bracelet (5 mukhi)",  cat:"Rudraksha",    price:800,   unit:"1 pc",  icon:"📿", badge:"Certified",  deity:"Daily protection",      desc:"5 mukhi rudraksha bracelet in red thread — for daily wear." },
  { id:1116,name:"Gauri Shankar Rudraksha",       cat:"Rudraksha",    price:4500,  unit:"1 bead",icon:"📿", badge:"Special",    deity:"Shiva-Parvati",         desc:"Two naturally joined beads — for marital bliss and unity." },

  // ── CLAY & NATURAL UTENSILS ───────────────────────────────────────────────────
  { id:1201,name:"Clay Diya (Set of 12)",          cat:"Clay Utensils",price:180,  unit:"set",   icon:"🪔", badge:"Handmade",   deity:"All pujas (aarti)",     desc:"Unglazed clay diyas — hand-shaped by local artisans." },
  { id:1202,name:"Clay Diya (Set of 108)",         cat:"Clay Utensils",price:700,  unit:"set",   icon:"🪔", badge:"Handmade",   deity:"Deepawali, Kali puja",  desc:"108 clay diyas for Deepawali illumination and special pujas." },
  { id:1203,name:"Clay Kalash (Ghada)",            cat:"Clay Utensils",price:150,  unit:"1 pc",  icon:"🏺", badge:"Handmade",   deity:"All auspicious pujas",  desc:"Pure clay water pot for Varuna invocation and kalash puja." },
  { id:1204,name:"Clay Handi (Cooking pot)",       cat:"Clay Utensils",price:280,  unit:"1 pc",  icon:"🏺", badge:"Handmade",   deity:"Bhog/Naivedya cooking", desc:"Unglazed clay pot for cooking prasad — sattvic vessel." },
  { id:1205,name:"Clay Puja Plate (Patthal)",      cat:"Clay Utensils",price:120,  unit:"1 pc",  icon:"⭕", badge:"Handmade",   deity:"All pujas",             desc:"Flat clay puja plate for arranging offerings." },
  { id:1206,name:"Clay Cup (Kulhad) Set of 6",    cat:"Clay Utensils",price:120,  unit:"set",   icon:"🏺", badge:"Handmade",   deity:"Panchamrit, offerings", desc:"Six kulhad cups for panchamrit distribution." },
  { id:1207,name:"Clay Elephant (Ganesha murti)", cat:"Clay Utensils",price:350,  unit:"1 pc",  icon:"🐘", badge:"Handmade",   deity:"Ganesha",               desc:"Handmade natural clay Ganesha murti — eco-friendly, dissolves." },
  { id:1208,name:"Clay Shivling (natural)",       cat:"Clay Utensils",price:200,  unit:"1 pc",  icon:"🪨", badge:"Handmade",   deity:"Shiva",                 desc:"Hand-shaped pure clay Shivling — made without chemicals." },
  { id:1209,name:"Mud Incense Holder",            cat:"Clay Utensils",price:150,  unit:"1 pc",  icon:"🏺", badge:"Handmade",   deity:"All pujas",             desc:"Clay agarbatti stand — simple, pure, natural." },
  { id:1210,name:"Clay Dhoop Burner (Dhunachi)", cat:"Clay Utensils",price:280,  unit:"1 pc",  icon:"🏺", badge:"Handmade",   deity:"All pujas",             desc:"Traditional clay dhoop burner for burning resin dhoop." },

  // ── BRASS & COPPER UTENSILS ───────────────────────────────────────────────────
  { id:1301,name:"Brass Kalash (Lota)",            cat:"Brass & Copper", price:850,  unit:"1 pc",icon:"🏺", badge:"Pure",      deity:"All pujas (essential)", desc:"Pure brass kalash — for invocation of Varuna and holy water." },
  { id:1302,name:"Copper Kalash",                 cat:"Brass & Copper", price:1200, unit:"1 pc",icon:"🏺", badge:"Pure",      deity:"Surya, all pujas",     desc:"Pure copper water vessel — most sacred metal for water storage." },
  { id:1303,name:"Brass Puja Thali",              cat:"Brass & Copper", price:700,  unit:"1 pc",icon:"⭕", badge:"Pure",      deity:"All pujas",            desc:"Engraved brass plate with Om and floral design." },
  { id:1304,name:"Brass Aarti Diya (5-flame)",   cat:"Brass & Copper", price:950,  unit:"1 pc",icon:"🪔", badge:"Pure",      deity:"All pujas (aarti)",    desc:"Five-flame panchmukhi brass diya for aarti ceremony." },
  { id:1305,name:"Brass Bell (Ghanta)",           cat:"Brass & Copper", price:600,  unit:"1 pc",icon:"🔔", badge:"Pure",      deity:"All pujas",            desc:"Pure brass temple bell — clear tone, drives away negativity." },
  { id:1306,name:"Brass Conch (Shankha)",         cat:"Brass & Copper", price:500,  unit:"1 pc",icon:"🐚", badge:"Pure",      deity:"Vishnu (essential)",   desc:"Brass decorative shankha — for those without natural conch." },
  { id:1307,name:"Natural Shankha (Right-handed)",cat:"Brass & Copper", price:2500, unit:"1 pc",icon:"🐚", badge:"Sacred",    deity:"Vishnu (highest merit)",desc:"Rare Dakshinavarta (right-handed) conch — most auspicious." },
  { id:1308,name:"Natural Shankha (Left-handed)", cat:"Brass & Copper", price:800,  unit:"1 pc",icon:"🐚", badge:"Sacred",    deity:"Vishnu, all pujas",    desc:"Common Vamavarti shankha for blowing and filling with water." },
  { id:1309,name:"Copper Achamani Set",           cat:"Brass & Copper", price:650,  unit:"set", icon:"🏺", badge:"Pure",      deity:"All pujas (achamana)", desc:"Copper spoon + small vessel for sipping and purification." },
  { id:1310,name:"Brass Panchadhatu Kalash",     cat:"Brass & Copper", price:2200, unit:"1 pc",icon:"🏺", badge:"Rare",      deity:"All major pujas",      desc:"Five-metal sacred vessel — most auspicious for puja." },
  { id:1311,name:"Brass Incense Holder (dhoop dan)",cat:"Brass & Copper",price:450,unit:"1 pc",icon:"🏺", badge:"Pure",     deity:"All pujas",            desc:"Engraved brass dhoop and agarbatti stand." },
  { id:1312,name:"Brass Coconut Stand (Kalash top)",cat:"Brass & Copper",price:350,unit:"1 pc",icon:"🥥", badge:"Pure",     deity:"Kalash puja",          desc:"Brass fixture for mounting coconut on top of kalash." },
  { id:1313,name:"Copper Tumbler (Lota)",        cat:"Brass & Copper", price:550,  unit:"1 pc",icon:"🏺", badge:"Pure",      deity:"Surya, all pujas",     desc:"Pure copper drinking vessel — for sacred water storage." },
  { id:1314,name:"Silver Puja Thali",            cat:"Brass & Copper", price:5500, unit:"1 pc",icon:"⭕", badge:"Silver",    deity:"All major pujas",      desc:"Pure 92.5 silver engraved puja plate — for special ceremonies." },

  // ── COMPLETE PUJA SETS ────────────────────────────────────────────────────────
  { id:1401,name:"Satyanarayan Puja Complete Set", cat:"Puja Sets",    price:1800, unit:"set", icon:"🎋", badge:"Complete",   deity:"Satyanarayan",          desc:"All samagri for Satyanarayan Katha — pure, fresh, and measured." },
  { id:1402,name:"Griha Pravesh Puja Set",        cat:"Puja Sets",    price:2500, unit:"set", icon:"🏠", badge:"Complete",   deity:"Vastu, Griha Devata",   desc:"Housewarming puja complete set — all items for 3-hour ceremony." },
  { id:1403,name:"Navgraha Shanti Set",           cat:"Puja Sets",    price:3500, unit:"set", icon:"🌟", badge:"Complete",   deity:"All 9 Grahas",          desc:"Nine planet complete samagri — grains, flowers, cloth, oil." },
  { id:1404,name:"Diwali Puja Set (Lakshmi-Ganesh)",cat:"Puja Sets",  price:2200, unit:"set", icon:"🪔", badge:"Complete",   deity:"Lakshmi, Ganesha",      desc:"Complete Diwali puja samagri — 108 diyas, incense, flowers, sweets." },
  { id:1405,name:"Bratabandha Puja Set",          cat:"Puja Sets",    price:4500, unit:"set", icon:"🎋", badge:"Complete",   deity:"All Vedic deities",     desc:"Complete Bratabandha (sacred thread ceremony) samagri." },
  { id:1406,name:"Shraddha Puja Set",             cat:"Puja Sets",    price:1500, unit:"set", icon:"🕯", badge:"Complete",   deity:"Pitru (Ancestors)",     desc:"Complete ancestor ritual set — til, kusha, barley, water vessel." },
  { id:1407,name:"Vivah Puja Set",                cat:"Puja Sets",    price:5500, unit:"set", icon:"💒", badge:"Complete",   deity:"All wedding deities",   desc:"All samagri for Hindu wedding puja — for pandit and couple." },
  { id:1408,name:"Rudrabhishek Set",              cat:"Puja Sets",    price:2800, unit:"set", icon:"🔱", badge:"Complete",   deity:"Shiva",                 desc:"Complete Rudrabhishek — bilva, panchamrit, gangajal, dhoop." },
  { id:1409,name:"Kaal Sarpa Dosh Shanti Set",    cat:"Puja Sets",    price:3200, unit:"set", icon:"🐍", badge:"Complete",   deity:"Rahu-Ketu shanti",      desc:"Complete Kaal Sarpa Dosha remedy samagri." },
  { id:1410,name:"Daily Home Puja Kit",           cat:"Puja Sets",    price:650,  unit:"set", icon:"🏡", badge:"Starter",    deity:"All household deities", desc:"Starter kit for daily home puja — diya, agarbatti, roli, akshat, ghee." },
];

const ALL_CATS = ["All", ...new Set(PRODUCTS.map(p => p.cat))];

const BADGE_COLOR = {
  "Fresh":"#007744","Pure":"#115522","Certified":"#1a3a8a","Best Seller":"#8a4400",
  "Handmade":"#6a3010","Rare":"#6a1040","Very Rare":"#4a0060","Sacred":"#3a006a",
  "Complete":"#004455","Set":"#2a4400","Special":"#5a3a00","Starter":"#1a3a00",
  "Silk":"#5a0060","Silver":"#3a3a3a","Natural":"#0a5a2a","Seasonal":"#6a5a00",
};

export default function Shop() {
  const [cat, setCat]   = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [added, setAdded] = useState(null);
  const [showCart, setShowCart] = useState(false);

  const filtered = useMemo(() =>
    PRODUCTS.filter(p =>
      (cat === "All" || p.cat === cat) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.deity?.toLowerCase().includes(search.toLowerCase()) ||
       p.desc.toLowerCase().includes(search.toLowerCase()))
    ), [cat, search]);

  function addToCart(p) {
    setCart(c => {
      const ex = c.find(x => x.id === p.id);
      return ex ? c.map(x => x.id===p.id ? {...x,qty:x.qty+1} : x) : [...c,{...p,qty:1}];
    });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1400);
  }

  function removeFromCart(id) {
    setCart(c => c.filter(x => x.id !== id));
  }

  const cartCount = cart.reduce((s,x) => s+x.qty, 0);
  const cartTotal = cart.reduce((s,x) => s+x.price*x.qty, 0);

  return (
    <div style={S.page}>
      {/* ── HEADER ── */}
      <div style={S.topBar}>
        <div>
          <h1 style={S.title}>Puja Samagri</h1>
          <p style={S.sub}>{PRODUCTS.length} items · Hand-sourced · Delivered fresh in Kathmandu</p>
        </div>
        <button style={S.cartBtn} onClick={() => setShowCart(v => !v)}>
          🛒 {cartCount > 0 ? `${cartCount} items · NPR ${cartTotal.toLocaleString()}` : "Cart"}
        </button>
      </div>

      {/* promise bar */}
      <div style={S.promise}>
        <span>✦ Zero adulteration</span>
        <span>✦ Personally hand-sourced</span>
        <span>✦ Same-day Kathmandu delivery</span>
        <span>✦ Search by product or deity name</span>
      </div>

      {/* ── SEARCH ── */}
      <input style={S.search} placeholder="Search by product, deity, or use (e.g. 'Shiva', 'wedding', 'lotus')…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* ── CATEGORIES ── */}
      <div style={S.catScroll}>
        {ALL_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={c===cat ? {...S.catBtn,...S.catActive} : S.catBtn}>{c}</button>
        ))}
      </div>

      {/* ── RESULT COUNT ── */}
      <p style={S.count}>{filtered.length} products found</p>

      {/* ── PRODUCT GRID ── */}
      <div style={S.grid}>
        {filtered.map(p => (
          <div key={p.id} style={S.card}>
            <div style={S.cardIcon}>{p.icon}</div>
            <div style={{...S.badge, background: BADGE_COLOR[p.badge]||"#333"}}>{p.badge}</div>
            <div style={S.pname}>{p.name}</div>
            <div style={S.pdeity}>For: {p.deity}</div>
            <div style={S.pdesc}>{p.desc}</div>
            <div style={S.pbottom}>
              <div>
                <span style={S.price}>NPR {p.price.toLocaleString()}</span>
                <span style={S.unit}> / {p.unit}</span>
              </div>
              <button style={added===p.id ? S.addedBtn : S.addBtn} onClick={() => addToCart(p)}>
                {added===p.id ? "✓ Added" : "+ Add"}
              </button>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <p style={S.empty}>No products found for "{search || cat}" — more coming soon.</p>
        )}
      </div>

      {/* ── CART PANEL ── */}
      {showCart && (
        <div style={S.cartPanel}>
          <div style={S.cartHeader}>
            <h3 style={S.cartTitle}>Your Cart</h3>
            <button style={S.closeCart} onClick={() => setShowCart(false)}>✕</button>
          </div>
          {cart.length === 0 ? (
            <p style={S.emptyCart}>Your cart is empty.</p>
          ) : (
            <>
              {cart.map(x => (
                <div key={x.id} style={S.cartRow}>
                  <div style={S.cartItemInfo}>
                    <span style={S.cartItemName}>{x.icon} {x.name}</span>
                    <span style={S.cartItemSub}>×{x.qty} · NPR {(x.price*x.qty).toLocaleString()}</span>
                  </div>
                  <button style={S.removeBtn} onClick={() => removeFromCart(x.id)}>✕</button>
                </div>
              ))}
              <div style={S.cartTotal}>
                <span>Total</span>
                <span>NPR {cartTotal.toLocaleString()}</span>
              </div>
              <button style={S.checkoutBtn}>Proceed to Checkout</button>
              <p style={S.cartNote}>
                📞 Orders confirmed via WhatsApp.<br/>
                Same-day delivery across Kathmandu Valley.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const G="#c9973a", GSFT="#f0d080", DEEP="#0a0300", SURF="#150900", TXT="#fdf0d5", MUTED="#b89060";
const S = {
  page:     { background:DEEP, minHeight:"100vh", padding:"24px 32px", maxWidth:1300, margin:"0 auto" },
  topBar:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:12 },
  title:    { fontSize:32, fontWeight:"bold", color:GSFT, marginBottom:2 },
  sub:      { color:MUTED, fontSize:13, fontFamily:"system-ui,sans-serif" },
  cartBtn:  { padding:"10px 20px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
              border:`1px solid ${G}`, borderRadius:10, color:GSFT, fontSize:14,
              fontWeight:"bold", cursor:"pointer", fontFamily:"system-ui,sans-serif" },
  promise:  { display:"flex", flexWrap:"wrap", gap:16, padding:"10px 0",
              borderTop:`1px solid ${G}22`, borderBottom:`1px solid ${G}22`,
              marginBottom:16, color:MUTED, fontSize:12, fontFamily:"system-ui,sans-serif" },
  search:   { width:"100%", padding:"11px 16px", background:"#1e0e02",
              border:`1px solid ${G}44`, borderRadius:10, color:TXT, fontSize:14,
              outline:"none", marginBottom:12, fontFamily:"system-ui,sans-serif" },
  catScroll:{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 },
  catBtn:   { padding:"5px 13px", background:"#1e0e02", border:`1px solid ${G}22`,
              borderRadius:16, color:MUTED, fontSize:12, cursor:"pointer",
              fontFamily:"system-ui,sans-serif" },
  catActive:{ background:"#3d1500", border:`1px solid ${G}`, color:G },
  count:    { color:MUTED, fontSize:12, marginBottom:16, fontFamily:"system-ui,sans-serif" },
  grid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 },
  card:     { background:SURF, border:`1px solid ${G}22`, borderRadius:14, padding:14,
              display:"flex", flexDirection:"column", gap:6, position:"relative" },
  cardIcon: { fontSize:32, textAlign:"center", paddingTop:6 },
  badge:    { position:"absolute", top:10, right:10, padding:"2px 7px", borderRadius:8,
              fontSize:10, color:"#fff", fontFamily:"system-ui,sans-serif", fontWeight:"bold" },
  pname:    { color:TXT, fontWeight:"bold", fontSize:13, lineHeight:1.4, marginTop:2 },
  pdeity:   { color:G, fontSize:11, fontFamily:"system-ui,sans-serif" },
  pdesc:    { color:MUTED, fontSize:11, lineHeight:1.5, fontFamily:"system-ui,sans-serif", flex:1 },
  pbottom:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 },
  price:    { color:GSFT, fontWeight:"bold", fontSize:14 },
  unit:     { color:MUTED, fontSize:10, fontFamily:"system-ui,sans-serif" },
  addBtn:   { padding:"5px 12px", background:"#3d1500", border:`1px solid ${G}55`,
              borderRadius:8, color:G, fontSize:11, cursor:"pointer", fontFamily:"system-ui,sans-serif" },
  addedBtn: { padding:"5px 12px", background:"#003d00", border:"1px solid #00aa44",
              borderRadius:8, color:"#44cc88", fontSize:11, cursor:"pointer", fontFamily:"system-ui,sans-serif" },
  empty:    { color:MUTED, padding:40, textAlign:"center", gridColumn:"1/-1", fontFamily:"system-ui,sans-serif" },

  cartPanel:{ position:"fixed", right:0, top:64, bottom:0, width:340, background:"#1a0800",
              border:`1px solid ${G}44`, borderLeft:`2px solid ${G}`, padding:20,
              overflowY:"auto", zIndex:200, display:"flex", flexDirection:"column", gap:0 },
  cartHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  cartTitle:{ color:GSFT, fontSize:18, fontWeight:"bold" },
  closeCart:{ background:"none", border:"none", color:MUTED, fontSize:18, cursor:"pointer" },
  emptyCart:{ color:MUTED, textAlign:"center", padding:20, fontFamily:"system-ui,sans-serif" },
  cartRow:  { display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0", borderBottom:`1px solid ${G}22` },
  cartItemInfo:{ display:"flex", flexDirection:"column", gap:3, flex:1 },
  cartItemName:{ color:TXT, fontSize:13, fontFamily:"system-ui,sans-serif" },
  cartItemSub:{ color:MUTED, fontSize:11, fontFamily:"system-ui,sans-serif" },
  removeBtn:{ background:"none", border:"none", color:"#663333", cursor:"pointer", fontSize:14 },
  cartTotal:{ display:"flex", justifyContent:"space-between", padding:"14px 0",
              color:GSFT, fontWeight:"bold", fontSize:16, borderTop:`1px solid ${G}44`, marginTop:8 },
  checkoutBtn:{ width:"100%", padding:"12px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
              border:`1px solid ${G}`, borderRadius:10, color:GSFT, fontSize:15,
              fontWeight:"bold", cursor:"pointer", marginTop:4 },
  cartNote: { color:MUTED, fontSize:11, marginTop:12, textAlign:"center", lineHeight:1.6,
              fontFamily:"system-ui,sans-serif" },
};
