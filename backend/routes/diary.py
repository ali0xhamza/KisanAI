from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv
import json, os

load_dotenv()
router = APIRouter()

# Simple JSON file storage — DB mein move karna ho toh easy hai
DIARY_FILE = os.path.join(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))), 'data', 'diary.json')

def load_entries():
    os.makedirs(os.path.dirname(DIARY_FILE), exist_ok=True)
    if not os.path.exists(DIARY_FILE):
        return []
    with open(DIARY_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_entries(entries):
    os.makedirs(os.path.dirname(DIARY_FILE), exist_ok=True)
    with open(DIARY_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

class DiaryEntry(BaseModel):
    crop:     str
    activity: str
    note:     str          = ''
    weather:  str          = ''
    mood:     str          = 'good'   # good | bad | neutral
    date:     Optional[str] = None

@router.get("/entries")
async def get_entries(crop: str = '', limit: int = 50):
    entries = load_entries()
    if crop:
        entries = [e for e in entries if e.get('crop','').lower() == crop.lower()]
    entries.sort(key=lambda x: x.get('date',''), reverse=True)
    return {'entries': entries[:limit], 'total': len(entries)}

@router.post("/entries")
async def add_entry(data: DiaryEntry):
    entries = load_entries()
    entry = {
        'id':       len(entries) + 1,
        'crop':     data.crop,
        'activity': data.activity,
        'note':     data.note,
        'weather':  data.weather,
        'mood':     data.mood,
        'date':     data.date or datetime.now().strftime('%Y-%m-%d'),
        'time':     datetime.now().strftime('%H:%M'),
        'created':  datetime.now().isoformat(),
    }
    entries.append(entry)
    save_entries(entries)
    return {'success': True, 'entry': entry}

@router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: int):
    entries = load_entries()
    before  = len(entries)
    entries = [e for e in entries if e.get('id') != entry_id]
    if len(entries) == before:
        raise HTTPException(404, "Entry not found")
    save_entries(entries)
    return {'success': True}

@router.get("/stats")
async def get_stats():
    entries = load_entries()
    if not entries:
        return {'total': 0, 'crops': [], 'activities': [], 'this_month': 0}

    from collections import Counter
    crops      = Counter(e.get('crop','') for e in entries)
    activities = Counter(e.get('activity','') for e in entries)
    this_month = sum(1 for e in entries
                     if e.get('date','').startswith(datetime.now().strftime('%Y-%m')))
    return {
        'total':       len(entries),
        'this_month':  this_month,
        'crops':       [{'name':k,'count':v} for k,v in crops.most_common(5)],
        'activities':  [{'name':k,'count':v} for k,v in activities.most_common(5)],
    }