"""
FastAPI server — the bridge between the engine (Python brain)
and the React frontend (the face).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import engine

app = FastAPI(title="Astro Engine API")

# allow the React dev server to talk to this API during development
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"],
)

class BirthDetails(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    lat: float
    lon: float
    tz_offset: float   # hours, e.g. Nepal = 5.75

@app.get("/")
def health():
    return {"status": "alive", "message": "Astro engine running"}

@app.post("/chart")
def chart(b: BirthDetails):
    return engine.compute_chart(
        b.year, b.month, b.day, b.hour, b.minute, b.lat, b.lon, b.tz_offset
    )
