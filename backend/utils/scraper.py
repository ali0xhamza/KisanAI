# backend/utils/scraper.py
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from database import SessionLocal
from models import MandiPrice
from datetime import date
import asyncio

# ── AMIS IDs — single source of truth from mandi.py ──────────────
from routes.mandi import CITY_TO_AMIS_ID

# For scraper: normalized_key → display name
SCRAPE_CITIES = {
    'lahore':           'Lahore',
    'faisalabad':       'Faisalabad',
    'gujranwala':       'Gujranwala',
    'okara':            'Okara',
    'sargodha':         'Sargodha',
    'rawalpindi':       'Rawalpindi',
    'multan':           'Multan',
    'rahimyarkhan':     'RahimYarKhan',
    'bhakhar':          'Bhakhar',
    'bhalwal':          'Bhalwal',
    'kasur':            'Kasur',
    'sahiwal':          'Sahiwal',
    'vehari':           'Vehari',
    'burewala':         'Burewala',
    'layyah':           'Layyah',
    'gujrat':           'Gujrat',
    'khanewal':         'Khanewal',
    'muzafargarh':      'Muzaffargarh',
    'kachakhu':         'KachaKhu',
    'bahawalpur':       'BahawalPur',
    'ttsingh':          'TTSingh',
    'kabirwala':        'Kabirwala',
    'patoki':           'Patoki',
    'arifwala':         'ArifWala',
    'jaranwala':        'Jaranwala',
    'pakpattan':        'PakPattan',
    'bahawalnagar':     'BahawalNagar',
    'lodhran':          'Lodhran',
    'haroonabad':       'HaroonAbad',
    'chistian':         'Chistian',
    'gujarkhan':        'GujarKhan',
    'mailsi':           'Mailsi',
    'kahrorpacca':      'KahrorPacca',
    'chichawatni':      'Chichawatni',
    'dunyapur':         'Dunyapur',
    'dgkhan':           'DGKhan',
    'chunian':          'Chunian',
    'phoolnagar':       'PhoolNagar',
    'lalaamusa':        'LalaMusa',
    'mandibahaudin':    'MandiBahaudin',
    'jalalpurjattan':   'JalalpurJattan',
    'daska':            'Daska',
    'gojra':            'Gojra',
    'kamalia':          'Kamalia',
    'pirmahal':         'PirMahal',
    'shujaabad':        'ShujaAbad',
    'jalalpurpirwala':  'JalalpurPirwala',
    'jahanian':         'Jahanian',
    'mianchhannu':      'MianChannu',
    'ahmadpureast':     'AhmadPurEast',
    'hasalpur':         'Hasalpur',
    'kotchutta':        'KotChutta',
    'shahrsultan':      'ShahrSultan',
    'jampur':           'Jampur',
    'sialkot':          'Sialkot',
    'narowal':          'Narowal',
    'chakwal':          'Chakwal',
    'jhelum':           'Jhelum',
    'khushab':          'Khushab',
    'mianwali':         'Mianwali',
    'rajanpur':         'RajanPur',
    'jhang':            'Jhang',
    'quetta':           'Quetta',
    'sadiqabad':        'SadiqAbad',
    'khanpur':          'Khanpur',
    'kotadu':           'KotAdu',
    'renalakhurd':      'RenalaKhurd',
    'nankana':          'Nankana',
    'liaqatpur':        'LiaqatPur',
    'chackjhumra':      'ChackJhumra',
    'summandri':        'Summandri',
    'tandlianwala':     'Tandlianwala',
    'mamunkanjan':      'MamunKanjan',
    'yazman':           'Yazman',
    'fatehpur':         'Fatehpur',
    'sheikhupura':      'Sheikhupura',
    'depalpur':         'Depalpur',
    'kamoke':           'Kamoke',
    'chiniot':          'Chiniot',
    'shorkot':          'Shorkot',
    'muridke':          'Muridke',
    'kalurkot':         'Kalurkot',
    'fortabas':         'FortAbas',
    'karachi':          'Karachi',
    'talagang':         'Talagang',
    'alipurchatta':     'AliPurChatta',
    'chuasaidanshah':   'ChuaSaidanShah',
    'farooqabad':       'Farooqabad',
    'eminabad':         'Eminabad',
    'hujrashahmuqeem':  'HujraShahMuqeem',
    'hyderabad':        'Hyderabad',
    'sillanwali':       'Sillanwali',
    'abdulhakim':       'Abdulhakim',
    'pasroor':          'Pasroor',
    'sanglahill':       'SanglaHill',
    'raiwind':          'Raiwind',
    'hasanabdal':       'HasanAbdal',
    'warberten':        'Warberten',
    'lalian':           'Lalian',
    'havelilakha':      'HaveliLakha',
    'basirpur':         'Basirpur',
    'hafizabad':        'Hafizabad',
    'wazirabad':        'Wazirabad',
    'pindibhattian':    'PindiBhattian',
    'sukheke':          'Sukheke',
    'narangmandi':      'NarangMandi',
    'multanroadlahore': 'MultanRoadLahore',
    'lahoresinghpura':  'LahoreSinghpura',
    'katchalahore':     'KatchaLahore',
    'khankahdogran':    'KhankahdogRan',
    'safdarabad':       'Safdarabad',
    'mananwala':        'Mananwala',
    'kotradhakishan':   'KotradhakiShan',
    'kanganpur':        'Kanganpur',
    'khudian':          'Khudian',
    'ghakhar':          'Ghakhar',
    'qiladedarsingh':   'QilaDedaRsingh',
    'noshehrawirkan':   'NoshehraWirkan',
    'malakwal':         'Malakwal',
    'dinga':            'Dinga',
    'sambrial':         'Sambrial',
    'badomalhi':        'BadoMalhi',
    'shakargarh':       'Shakargarh',
    'hazro':            'Hazro',
    'sraialamgir':      'SraiAlamgir',
    'pinanwal':         'Pinanwal',
    'phularwan':        'Phularwan',
    'jauharabad':       'Jauharabad',
    'mithatiwana':      'MithatiWana',
    'quaidabad':        'Quaidabad',
    'piplan':           'Piplan',
    'shahjewana':       'ShahJewana',
    'qadirpurrawan':    'QadirPurRawan',
    'kassowal':         'Kassowal',
    'khairpurtamewali': 'KhairPurTamewali',
    'minchanabad':      'Minchanabad',
    'taunsasharif':     'TaunsaSharif',
    'alipur':           'Alipur',
    'kotmoman':         'KotMoman',
    'gwadar':           'Gwadar',
    'attock':           'Attock',
    'rujhan':           'Rujhan',
    'murree':           'Murree',
}

# ── Crop Mapping ─────────────────────────────────────────────────
FASAL_MAP = {
    'Wheat':                    ('گندم',               'Gehoon',    '100 kg'),
    'Rice Basmati Super (New)': ('چاول باسمتی',        'Chawal',    '100 kg'),
    'Rice Basmati (385)':       ('چاول 385',           'Chawal385', '100 kg'),
    'Rice (IRRI)':              ('چاول آئی آر آر آئی', 'ChawlIRRI', '100 kg'),
    'Maize':                    ('مکئی',               'Makki',     '100 kg'),
    'Potato Fresh':             ('آلو تازہ',           'Aalu',      '100 kg'),
    'Potato Store':             ('آلو اسٹور',          'AaluStore', '100 kg'),
    'Onion':                    ('پیاز',               'Pyaz',      '100 kg'),
    'Tomato':                   ('ٹماٹر',              'Tamatar',   '100 kg'),
    'Garlic (Local)':           ('لہسن دیسی',          'Lehsan',    '100 kg'),
    'Garlic (China)':           ('لہسن چینی',          'LehsanCN',  '100 kg'),
    'Ginger(China)':            ('ادرک',               'Adrak',     '100 kg'),
    'Spinach':                  ('پالک',               'Palak',     '100 kg'),
    'Brinjal':                  ('بینگن',              'Baingan',   '100 kg'),
    'Carrot':                   ('گاجر',               'Gaajar',    '100 kg'),
    'Peas':                     ('مٹر',                'Matar',     '100 kg'),
    'Lady Finger/Okra':         ('بھنڈی',              'Bhindi',    '100 kg'),
    'Bitter Gourd':             ('کریلا',              'Karela',    '100 kg'),
    'Bottle Gourd':             ('کدو',                'Kadu',      '100 kg'),
    'Green Chilli':             ('ہری مرچ',            'Mirch',     '100 kg'),
    'Cauliflower':              ('پھول گوبھی',         'Gobi',      '100 kg'),
    'Cabbage':                  ('بند گوبھی',          'BandGobi',  '100 kg'),
    'Mango(Desahri)':           ('آم دسہری',           'Aam',       '100 kg'),
    'Mango(Chounsa)':           ('آم چونسہ',           'AamChounsa','100 kg'),
    'Mango(Sindhri)':           ('آم سندھڑی',          'AamSindhri','100 kg'),
    'Banana(DOZEN)':            ('کیلا',               'Kela',      'Dozen'),
    'Apple (Golden)':           ('سیب گولڈن',          'Seb',       '100 kg'),
    'Guava':                    ('امرود',              'Amrood',    '100 kg'),
    'Moong':                    ('مونگ',               'Moong',     '100 kg'),
    'Moong Pulse':              ('مونگ دال',           'MoongDal',  '100 kg'),
    'Masoor Whole(local)':      ('مسور',               'Masoor',    '100 kg'),
    'Masoor Pulse(local)':      ('مسور دال',           'MasoorDal', '100 kg'),
    'Gram White(local)':        ('چنا سفید',           'Chana',     '100 kg'),
    'Gram Black':               ('چنا کالا',           'ChanaKala', '100 kg'),
    'Gram Pulse':               ('چنا دال',            'ChanaDal',  '100 kg'),
    'Mustard seed':             ('سرسوں',              'Sarson',    '100 kg'),
    'Mustard Greens(ساگ سرسوں)':('ساگ سرسوں',          'SarsonSag', '100 kg'),
    'Seed Cotton(Phutti)':      ('کپاس',               'Kapas',     '100 kg'),
    'Sugar':                    ('چینی',               'Cheeni',    '100 kg'),
    'Jaggery':                  ('گڑ',                 'Gur',       '100 kg'),
    'Groundnut':                ('مونگ پھلی',          'Mungphali', '100 kg'),
    'Coriander':                ('دھنیا',              'Dhaniya',   '100 kg'),
    'Turmeric Whole':           ('ہلدی',               'Haldi',     '100 kg'),
    'Sunflower':                ('سورج مکھی',          'Sunflower', '100 kg'),
    'Barley':                   ('جو',                 'Jau',       '100 kg'),
    'Sugarcane':                ('گنا',                'Ganna',     '100 kg'),
}

def match_fasal(commodity_name: str):
    name_lower = commodity_name.lower().strip()
    for eng_key, info in FASAL_MAP.items():
        if eng_key.lower() in name_lower or name_lower in eng_key.lower():
            return info
    for eng_key, info in FASAL_MAP.items():
        words = eng_key.lower().split()
        if any(w in name_lower for w in words if len(w) > 3):
            return info
    return None


async def scrape_city(city_key: str, city_display: str, amis_id: int, db: Session, today_str: str) -> int:
    """
    AMIS URL (verified):
      ViewPrices.aspx?searchType=1&commodityId={city_amis_id}
      searchType=1 = city-based view
      commodityId   = city's AMIS ID (from CITY_TO_AMIS_ID)

    NOTE: Printer.aspx requires session — use ViewPrices directly
    """
    url = f"http://www.amis.pk/ViewPrices.aspx?searchType=1&commodityId={amis_id}"
    saved = 0

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            res = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                              'AppleWebKit/537.36 (KHTML, like Gecko) '
                              'Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'http://www.amis.pk/BrowsePrices.aspx?searchType=1',
            })

        if res.status_code != 200:
            print(f"  ⚠️  {city_display}: HTTP {res.status_code}")
            return 0

        soup = BeautifulSoup(res.text, 'html.parser')

        # ── Find price table ───────────────────────────────────
        # On AMIS ViewPrices page, the main data table contains commodity, min, max, FQP columns
        tables = soup.find_all('table')

        price_table = None
        for t in tables:
            headers = [th.get_text(strip=True).lower() for th in t.find_all('th')]
            # Table with 'commodity', 'min', 'max', 'fqp' headers is the price table
            if any(h in headers for h in ['commodity', 'min', 'max', 'fqp']):
                price_table = t
                break

        if not price_table:
            # Fallback: table with most rows
            price_table = max(tables, key=lambda t: len(t.find_all('tr')), default=None) if tables else None

        if not price_table:
            print(f"  ⚠️  {city_display}: price table not found")
            return 0

        rows = price_table.find_all('tr')

        # Get column positions from header row
        col_map = {}
        for row in rows:
            headers = row.find_all('th')
            if headers:
                for idx, th in enumerate(headers):
                    h = th.get_text(strip=True).lower()
                    if 'commodity' in h or 'item' in h:
                        col_map['name'] = idx
                    elif 'min' in h:
                        col_map['min'] = idx
                    elif 'max' in h:
                        col_map['max'] = idx
                    elif 'fqp' in h:
                        col_map['fqp'] = idx
                break

        # If no header found, use default AMIS column order: Commodity(0) | Market(1) | Min(2) | Max(3) | FQP(4) | Qty(5)
        if not col_map:
            col_map = {'name': 0, 'min': 2, 'max': 3, 'fqp': 4}

        def safe_float(cols, idx):
            try:
                text = cols[idx].get_text(strip=True).replace(',', '').strip()
                return float(text) if text not in ('-', '', 'N/A', '0', 'na') else None
            except (IndexError, ValueError):
                return None

        for row in rows[1:]:
            cols = row.find_all('td')
            if len(cols) < 3:
                continue

            try:
                commodity = cols[col_map.get('name', 0)].get_text(strip=True)
                if not commodity or commodity.lower() in ('commodity', 'item', ''):
                    continue
                if 'graph' in commodity.lower() or commodity.isdigit():
                    continue

                fqp = safe_float(cols, col_map.get('fqp', 4))
                mn  = safe_float(cols, col_map.get('min', 2))
                mx  = safe_float(cols, col_map.get('max', 3))

                price = fqp or (round((mn + mx) / 2, 2) if mn and mx else None)
                if not price or price <= 0:
                    continue

                fasal_info = match_fasal(commodity)
                if not fasal_info:
                    continue

                fasal_urdu, fasal_eng, unit = fasal_info

                existing = db.query(MandiPrice).filter(
                    MandiPrice.fasal_eng  == fasal_eng,
                    MandiPrice.city       == city_display,
                    MandiPrice.price_date == today_str,
                ).first()

                if existing:
                    existing.change = round(price - float(existing.price), 2)
                    existing.price  = price
                else:
                    db.add(MandiPrice(
                        fasal_urdu = fasal_urdu,
                        fasal_eng  = fasal_eng,
                        city       = city_display,
                        price      = price,
                        unit       = unit,
                        change     = 0,
                        price_date = today_str,
                    ))
                saved += 1

            except Exception:
                continue

    except httpx.RequestError as e:
        print(f"  ❌ {city_display} network error: {e}")
        return 0
    except Exception as e:
        print(f"  ❌ {city_display} error: {e}")
        return 0

    return saved


async def run_all_scrapers():
    print("🔄 AMIS scraping started...")
    today_str = date.today().strftime('%Y-%m-%d')
    total_saved = 0
    db: Session = SessionLocal()

    try:
        for city_key, city_display in SCRAPE_CITIES.items():
            amis_id = CITY_TO_AMIS_ID.get(city_key)
            if not amis_id:
                print(f"  ⚠️  {city_display}: AMIS ID not found, skipping")
                continue

            print(f"  📍 {city_display} (ID={amis_id}) scraping...")
            saved = await scrape_city(city_key, city_display, amis_id, db, today_str)
            total_saved += saved
            print(f"  ✅ {city_display}: {saved} records")
            db.commit()
            await asyncio.sleep(1.5)

        print(f"✅ AMIS scraping completed: {total_saved} total records")

    except Exception as e:
        print(f"❌ Scraping failed: {e}")
        db.rollback()
    finally:
        db.close()