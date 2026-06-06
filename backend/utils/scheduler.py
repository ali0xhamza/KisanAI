from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from utils.scraper import run_all_scrapers
from database import SessionLocal
import httpx
import os

scheduler = AsyncIOScheduler()

# ── Weather alert check ──────────────────────────────────────────
async def check_weather_and_notify():
    from routes.notifications import send_push, PushSubscription
    from models import User

    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        print("❌ WEATHER_API_KEY missing")
        return

    db = SessionLocal()
    try:
        subs = db.query(PushSubscription).all()
        if not subs:
            print("No subscribers found")
            return

        async with httpx.AsyncClient() as client:
            for sub in subs:
                user = db.query(User).filter(User.id == sub.user_id).first()

                if not user or not user.city:
                    continue

                try:
                    res = await client.get(
                        "https://api.openweathermap.org/data/2.5/forecast",
                        params={
                            "q": f"{user.city},PK",
                            "appid": api_key,
                            "units": "metric",
                            "cnt": 8,
                        },
                        timeout=10
                    )
                    data = res.json()

                    if data.get("cod") != "200":
                        print(f"Weather API error for {user.city}: {data.get('message')}")
                        continue

                    alert = None
                    for item in data.get("list", []):
                        weather_id = item["weather"][0]["id"]
                        temp       = item["main"]["temp"]
                        rain_prob  = item.get("pop", 0) * 100

                        if rain_prob >= 70:
                            alert = f"🌧️ {user.city}: {int(rain_prob)}% chance of rain — protect your crops!"
                        elif weather_id < 300:
                            alert = f"⛈️ {user.city}: Thunderstorm possible — stop spraying!"
                        elif temp >= 42:
                            alert = f"🌡️ {user.city}: Extreme heat {int(temp)}°C — irrigate your crops!"
                        elif temp <= 5:
                            alert = f"🥶 {user.city}: Extreme cold {int(temp)}°C — protect your crops!"

                        if alert:
                            break

                    if alert:
                        send_push(
                            user_id = sub.user_id,
                            title   = "⚠️ Weather Alert — KisanAI",
                            body    = alert,
                            url     = "/weather",
                            db      = db
                        )
                        print(f"✅ Weather alert sent to {user.name} ({user.city}): {alert}")
                    else:
                        print(f"✅ {user.city} — Normal weather, no alerts")

                except Exception as e:
                    print(f"❌ Weather check failed for {user.city}: {e}")

    finally:
        db.close()

# ── Mandi update + notification ──────────────────────────────────
async def update_prices_and_notify():
    await run_all_scrapers()
    try:
        from routes.notifications import send_push_all
        db = SessionLocal()
        try:
            send_push_all(
                title="💰 Mandi Prices Updated!",
                body="Check today's fresh market prices — wheat, rice, maize and more.",
                url="/mandi",
                db=db
            )
            print("✅ Mandi notification sent")
        finally:
            db.close()
    except Exception as e:
        print(f"❌ Mandi notification error: {e}")

# ── Scheduler start ──────────────────────────────────────────────
def start_scheduler():
    scheduler.add_job(
        update_prices_and_notify,
        CronTrigger(hour=2, minute=0),
        id='daily_scraper',
        replace_existing=True,
        misfire_grace_time=3600
    )
    scheduler.add_job(
        check_weather_and_notify,
        CronTrigger(hour="0,6,12,18", minute=0),
        id='weather_check',
        replace_existing=True,
        misfire_grace_time=3600
    )
    scheduler.start()
    print("✅ Scheduler started — Mandi at 2 AM, Weather every 6 hours")