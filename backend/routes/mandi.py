# backend/routes/mandi.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import MandiPrice
from auth import get_admin_user, get_current_user
from models import User
import csv
import io
from datetime import date, timedelta

# ── City → AMIS ID Mapping ─────────────────────────────────────────
CITY_TO_AMIS_ID = {
    'lahore':1,'faisalabad':2,'gujranwala':3,'okara':4,'sargodha':5,
    'rawalpindi':6,'multan':7,'rahimyarkhan':8,'bhakhar':9,'bhalwal':10,
    'kasur':11,'sahiwal':13,'vehari':14,'burewala':15,'layyah':16,
    'gujrat':17,'khanewal':18,'muzafargarh':19,'bahawalpur':20,'ttsingh':21,
    'kabirwala':22,'patoki':23,'arifwala':24,'jaranwala':25,'pakpattan':26,
    'bahawalnagar':27,'lodhran':28,'haroonabad':29,'chistian':30,'gujarkhan':31,
    'mailsi':32,'kahrorpacca':33,'chichawatni':34,'dunyapur':35,'dgkhan':36,
    'chunian':37,'phoolnagar':38,'lalaamusa':39,'mandibahaudin':41,'jalalpurjattan':42,
    'daska':43,'gojra':44,'kamalia':45,'pirmahal':46,'shujaabad':47,
    'jalalpurpirwala':48,'jahanian':49,'mianchhannu':50,'kachakhu':51,
    'ahmadpureast':52,'hasalpur':53,'kotchutta':54,'shahrsultan':55,'jampur':56,
    'sialkot':57,'narowal':58,'chakwal':59,'jhelum':60,'khushab':61,
    'mianwali':62,'rajanpur':63,'jhang':64,'quetta':65,'sadiqabad':66,
    'khanpur':67,'kotadu':68,'renalakhurd':69,'nankana':70,'liaqatpur':71,
    'chackjhumra':72,'summandri':73,'tandlianwala':74,'mamunkanjan':75,
    'yazman':76,'fatehpur':77,'sheikhupura':78,'depalpur':79,'kamoke':80,
    'chiniot':81,'shorkot':82,'muridke':83,'kalurkot':84,'fortabas':85,
    'karachi':86,'talagang':87,'alipurchatta':88,'chuasaidanshah':89,
    'farooqabad':90,'eminabad':91,'hujrashahmuqeem':92,'hyderabad':93,
    'sillanwali':94,'abdulhakim':95,'pasroor':96,'sanglahill':97,'raiwind':98,
    'hasanabdal':99,'warberten':100,'lalian':101,'havelilakha':102,
    'basirpur':103,'hafizabad':104,'wazirabad':105,'pindibhattian':106,
    'sukheke':107,'narangmandi':108,'multanroadlahore':109,'lahoresinghpura':110,
    'katchalahore':111,'khankahdogran':112,'safdarabad':113,'mananwala':114,
    'kotradhakishan':115,'kanganpur':116,'khudian':117,'ghakhar':118,
    'qiladedarsingh':119,'noshehrawirkan':120,'malakwal':121,'dinga':122,
    'sambrial':123,'badomalhi':124,'shakargarh':125,'hazro':126,
    'sraialamgir':127,'pinanwal':128,'phularwan':129,'jauharabad':131,
    'mithatiwana':132,'quaidabad':133,'piplan':134,'shahjewana':135,
    'qadirpurrawan':136,'kassowal':137,'khairpurtamewali':138,'minchanabad':139,
    'taunsasharif':140,'alipur':141,'kotmoman':142,'gwadar':143,'attock':144,
    'rujhan':145,'murree':146,
}

def get_amis_id(city: str) -> int | None:
    """Normalize city name and return AMIS ID, or None if not found."""
    key = city.lower().replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    return CITY_TO_AMIS_ID.get(key)


router = APIRouter(prefix="/api/mandi", tags=["Mandi"])

# ── Schemas ────────────────────────────────────────────────────────
class MandiSchema(BaseModel):
    fasal_urdu: str
    fasal_eng:  str
    city:       str
    price:      float
    unit:       Optional[str]   = "40 kg"
    change:     Optional[float] = 0
    price_date: str

class MandiUpdateSchema(BaseModel):
    price:      Optional[float] = None
    change:     Optional[float] = None
    price_date: Optional[str]   = None
    city:       Optional[str]   = None

# ── Get All Prices ─────────────────────────────────────────────────
@router.get("/")
def get_prices(city: Optional[str] = None, fasal: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MandiPrice)
    if city:
        query = query.filter(MandiPrice.city.ilike(f"%{city}%"))
    if fasal:
        query = query.filter(
            (MandiPrice.fasal_eng.ilike(f"%{fasal}%")) |
            (MandiPrice.fasal_urdu.contains(fasal))
        )
    prices = query.order_by(MandiPrice.price_date.desc()).all()
    return [_format(p) for p in prices]

# ── Price History (for graph) ──────────────────────────────────────
@router.get("/history")
def get_price_history(
    city:  str,
    fasal: str,
    days:  int = 30,
    db:    Session = Depends(get_db)
):
    cutoff = (date.today() - timedelta(days=days)).strftime('%Y-%m-%d')

    records = db.query(MandiPrice).filter(
        MandiPrice.city.ilike(f"%{city}%"),
        MandiPrice.fasal_eng.ilike(f"%{fasal}%"),
        MandiPrice.price_date >= cutoff,
    ).order_by(MandiPrice.price_date.asc()).all()

    if not records:
        return {"city": city, "fasal": fasal, "history": [], "stats": None}

    prices = [float(r.price) for r in records]
    return {
        "city":    city,
        "fasal":   fasal,
        "history": [
            {
                "date":  r.price_date,
                "price": float(r.price),
                "change": float(r.change or 0),
            }
            for r in records
        ],
        "stats": {
            "min":     min(prices),
            "max":     max(prices),
            "avg":     round(sum(prices) / len(prices), 2),
            "latest":  prices[-1],
            "oldest":  prices[0],
            "trend":   "up" if prices[-1] > prices[0] else "down" if prices[-1] < prices[0] else "stable",
            "change_pct": round(((prices[-1] - prices[0]) / prices[0]) * 100, 1) if prices[0] else 0,
        }
    }

# ── Available Commodities for a City ───────────────────────────────
@router.get("/faslen")
def get_available_faslen(city: str, db: Session = Depends(get_db)):
    results = db.query(MandiPrice.fasal_eng, MandiPrice.fasal_urdu)\
        .filter(MandiPrice.city.ilike(f"%{city}%"))\
        .distinct().all()
    return [{"fasal_eng": r.fasal_eng, "fasal_urdu": r.fasal_urdu} for r in results]

# ── AMIS ID Lookup (for a city) ───────────────────────────────────
@router.get("/amis-id")
def get_city_amis_id(city: str):
    """
    Returns the AMIS ID for the given city.
    Can be used by both scraper and frontend.
    """
    amis_id = get_amis_id(city)
    if amis_id is None:
        raise HTTPException(
            status_code=404,
            detail=f"AMIS ID for '{city}' not found. Please check supported cities."
        )
    return {"city": city, "amis_id": amis_id}

# ── Supported Cities List ──────────────────────────────────────────
@router.get("/cities")
def list_supported_cities():
    """Returns all supported cities and their AMIS IDs."""
    return [
        {"city": city, "amis_id": amis_id}
        for city, amis_id in sorted(CITY_TO_AMIS_ID.items(), key=lambda x: x[1])
    ]

# ── CSV Template ───────────────────────────────────────────────────
@router.get("/csv-template")
def csv_template(admin: User = Depends(get_admin_user)):
    from fastapi.responses import StreamingResponse
    sample = """fasal_urdu,fasal_eng,city,price,unit,change,price_date
گندم,Wheat,Lahore,4200,40 kg,50,2025-05-09
چاول,Rice,Faisalabad,3800,40 kg,-20,2025-05-09
گنا,Sugarcane,Multan,450,40 kg,0,2025-05-09
کپاس,Cotton,Bahawalpur,8500,40 kg,100,2025-05-09
مکئی,Maize,Gujranwala,2200,40 kg,-30,2025-05-09"""
    return StreamingResponse(
        io.StringIO(sample),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mandi_template.csv"}
    )

# ── Add Single (admin) ─────────────────────────────────────────────
@router.post("/", status_code=201)
def add_price(data: MandiSchema, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    entry = MandiPrice(**data.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Price added successfully!", "data": _format(entry)}

# ── CSV Bulk Upload (admin) ────────────────────────────────────────
@router.post("/bulk-upload", status_code=201)
async def bulk_upload(
    file:  UploadFile = File(...),
    db:    Session    = Depends(get_db),
    admin: User       = Depends(get_admin_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Please upload a CSV file only")

    contents = await file.read()
    decoded  = contents.decode('utf-8-sig')
    reader   = csv.DictReader(io.StringIO(decoded))

    required = {'fasal_urdu', 'fasal_eng', 'city', 'price', 'price_date'}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(status_code=400, detail=f"CSV must contain these columns: {', '.join(required)}")

    added = 0; updated = 0; errors = []

    for i, row in enumerate(reader, start=2):
        try:
            fasal_eng  = row['fasal_eng'].strip()
            city       = row['city'].strip()
            price_date = row['price_date'].strip()
            price      = float(row['price'])

            existing = db.query(MandiPrice).filter(
                MandiPrice.fasal_eng  == fasal_eng,
                MandiPrice.city       == city,
                MandiPrice.price_date == price_date
            ).first()

            if existing:
                existing.price      = price
                existing.change     = float(row.get('change', 0) or 0)
                existing.fasal_urdu = row['fasal_urdu'].strip()
                existing.unit       = row.get('unit', '40 kg') or '40 kg'
                updated += 1
            else:
                db.add(MandiPrice(
                    fasal_urdu = row['fasal_urdu'].strip(),
                    fasal_eng  = fasal_eng,
                    city       = city,
                    price      = price,
                    unit       = row.get('unit', '40 kg') or '40 kg',
                    change     = float(row.get('change', 0) or 0),
                    price_date = price_date,
                ))
                added += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")
            continue

    db.commit()
    return {"message": f"✅ {added} new records added, {updated} updated", "added": added, "updated": updated, "errors": errors[:10]}

# ── Manual Scrape (admin) ──────────────────────────────────────────
@router.post("/scrape-now")
async def trigger_scrape(admin: User = Depends(get_admin_user)):
    from utils.scraper import run_all_scrapers
    import asyncio
    asyncio.create_task(run_all_scrapers())
    return {"message": "✅ Scraping started — prices will be updated shortly"}

# ── Get Single (must be after specific routes) ─────────────────────
@router.get("/{price_id}")
def get_price(price_id: int, db: Session = Depends(get_db)):
    p = db.query(MandiPrice).filter(MandiPrice.id == price_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _format(p)

# ── Update (admin) ─────────────────────────────────────────────────
@router.put("/{price_id}")
def update_price(price_id: int, data: MandiUpdateSchema, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    entry = db.query(MandiPrice).filter(MandiPrice.id == price_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if data.price      is not None: entry.price      = data.price
    if data.change     is not None: entry.change     = data.change
    if data.price_date is not None: entry.price_date = data.price_date
    if data.city       is not None: entry.city       = data.city
    db.commit()
    db.refresh(entry)
    return {"message": "Price updated successfully!", "data": _format(entry)}

# ── Delete (admin) ─────────────────────────────────────────────────
@router.delete("/{price_id}")
def delete_price(price_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    entry = db.query(MandiPrice).filter(MandiPrice.id == price_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully!"}

# ── Helper ─────────────────────────────────────────────────────────
def _format(p: MandiPrice) -> dict:
    return {
        "id":         p.id,
        "fasal_urdu": p.fasal_urdu,
        "fasal_eng":  p.fasal_eng,
        "city":       p.city,
        "price":      p.price,
        "unit":       p.unit,
        "change":     p.change,
        "price_date": p.price_date,
        "updated_at": p.updated_at,
    }