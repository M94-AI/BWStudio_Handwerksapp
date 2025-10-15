from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health():
    return {"status": "ok"}



####uvicorn app.main:app --reload --port 8000  (sobald eugens db steht)