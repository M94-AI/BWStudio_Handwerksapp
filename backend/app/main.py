from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health

app = FastAPI(title="Handwerksprojekt API")

# Lokale Dev-Frontends erlauben
origins = [
    "http://localhost:5173",  # Handwerker
    "http://localhost:5174",  # Kunden
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])