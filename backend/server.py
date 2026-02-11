from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import pandas as pd
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection (supports both local and Atlas URLs)
mongo_url = os.environ.get('MONGO_URL') or os.environ.get('MONGODB_URI')

# Debug : afficher ce qui est lu (temporaire)
print(f"🔍 Raw MONGO_URL from env: [{mongo_url}]")

# Nettoyer guillemets/espaces si présents
if mongo_url:
    mongo_url = mongo_url.strip().strip('"').strip("'")
    print(f"🔍 Cleaned MONGO_URL: [{mongo_url[:60]}...]")

# Valider le format
if not mongo_url or not (mongo_url.startswith('mongodb://') or mongo_url.startswith('mongodb+srv://')):
    raise ValueError(f"❌ Invalid or missing MONGO_URL. Got: {mongo_url}")

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'trouve_ton_dossard')]

# Test connexion au démarrage
try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")


# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'trail-france-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# SendGrid Configuration
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@trailfrancapp.com')

# Create the main app
app = FastAPI(title="Trouve Ton Dossard API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

 CORS Configuration - DOIT être configuré AVANT les routes
cors_origins = os.environ.get('CORS_ORIGINS', '').split(',')
allowed_origins = [
    "https://trouvetontrail.vercel.app",
    "https://trouvetontrail-git-main-*.vercel.app",  # Preview deployments
    "http://localhost:3000",
    "http://localhost:5173",
]

# Add from environment variable
for origin in cors_origins:
    if origin.strip() and origin.strip() != '*':
        allowed_origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["*"],
)

api_router = APIRouter(prefix="/api")
security = HTTPBearer()


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== ENUMS ====================
class RaceStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class RegistrationStatus(str, Enum):
    NOT_OPEN = "not_open"
    OPEN = "open"
    CLOSED = "closed"

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

# ==================== MODELS ====================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: str
    email_notifications: bool = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RaceCreate(BaseModel):
    name: str
    description: str
    location: str
    region: str
    department: str
    latitude: float
    longitude: float
    distance_km: float
    elevation_gain: int
    race_date: str
    registration_open_date: str
    registration_close_date: Optional[str] = None
    is_utmb: bool = False
    website_url: Optional[str] = None
    image_url: Optional[str] = None

class RaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    region: Optional[str] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    elevation_gain: Optional[int] = None
    race_date: Optional[str] = None
    registration_open_date: Optional[str] = None
    registration_close_date: Optional[str] = None
    is_utmb: Optional[bool] = None
    website_url: Optional[str] = None
    image_url: Optional[str] = None

class RaceResponse(BaseModel):
    id: str
    name: str
    description: str
    location: str
    region: str
    department: str
    latitude: float
    longitude: float
    distance_km: float
    elevation_gain: int
    race_date: str
    registration_open_date: str
    registration_close_date: Optional[str] = None
    registration_status: str
    is_utmb: bool
    website_url: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    submitted_by: Optional[str] = None
    created_at: str
    auto_closed_by_reports: Optional[bool] = None

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    race_id: str
    notify_on_registration: bool
    created_at: str

class ModerateAction(BaseModel):
    action: str  # "approve" or "reject"
    reason: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if user.get('role') != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def calculate_registration_status(open_date: str, close_date: Optional[str]) -> str:
    now = datetime.now(timezone.utc)
    try:
        # Handle dates without timezone (YYYY-MM-DD format)
        if 'T' not in open_date and '+' not in open_date:
            open_dt = datetime.strptime(open_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        else:
            open_dt = datetime.fromisoformat(open_date.replace('Z', '+00:00'))
        
        if now < open_dt:
            return RegistrationStatus.NOT_OPEN
        if close_date:
            if 'T' not in close_date and '+' not in close_date:
                close_dt = datetime.strptime(close_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
            else:
                close_dt = datetime.fromisoformat(close_date.replace('Z', '+00:00'))
            if now > close_dt:
                return RegistrationStatus.CLOSED
        return RegistrationStatus.OPEN
    except:
        return RegistrationStatus.NOT_OPEN

def send_email(to_email: str, subject: str, html_content: str):
    if not SENDGRID_API_KEY:
        logger.warning("SendGrid API key not configured, skipping email")
        return False
    try:
        message = Mail(from_email=SENDER_EMAIL, to_emails=to_email, subject=subject, html_content=html_content)
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        sg.send(message)
        return True
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return False

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "role": UserRole.USER,
        "email_notifications": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id, UserRole.USER)
    
    user_response = UserResponse(
        id=user_id, email=user_data.email, name=user_data.name,
        role=UserRole.USER, created_at=user["created_at"], email_notifications=True
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    user_response = UserResponse(
        id=user['id'], email=user['email'], name=user['name'],
        role=user['role'], created_at=user['created_at'],
        email_notifications=user.get('email_notifications', True)
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user['id'], email=user['email'], name=user['name'],
        role=user['role'], created_at=user['created_at'],
        email_notifications=user.get('email_notifications', True)
    )

# ==================== PASSWORD RESET ====================
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """Send password reset email"""
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    # Always return success for security (don't reveal if email exists)
    if not user:
        return {"message": "Si un compte existe, un email a été envoyé"}
    
    # Generate reset token (valid for 1 hour)
    reset_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token
    await db.password_resets.delete_many({"user_id": user['id']})  # Remove old tokens
    await db.password_resets.insert_one({
        "user_id": user['id'],
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Send email (in background)
    reset_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
    
    if SENDGRID_API_KEY:
        html_content = f"""
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour {user['name']},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur Trouve Ton Dossard.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p><a href="{reset_url}" style="background-color: #d9f99d; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        <p>L'équipe Trouve Ton Dossard</p>
        """
        background_tasks.add_task(send_email, user['email'], "Réinitialisation de votre mot de passe", html_content)
    else:
        logger.info(f"Password reset link for {user['email']}: {reset_url}")
    
    return {"message": "Si un compte existe, un email a été envoyé"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    # Find reset token
    reset_doc = await db.password_resets.find_one({"token": request.token}, {"_id": 0})
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Lien invalide ou expiré")
    
    # Check expiration
    expires_at = datetime.fromisoformat(reset_doc['expires_at'].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(status_code=400, detail="Lien expiré")
    
    # Update password
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"id": reset_doc['user_id']},
        {"$set": {"password": new_hash}}
    )
    
    # Delete reset token
    await db.password_resets.delete_one({"token": request.token})
    
    return {"message": "Mot de passe modifié avec succès"}

# ==================== RACES ROUTES ====================
@api_router.get("/races", response_model=List[RaceResponse])
async def get_races(
    region: Optional[str] = None,
    department: Optional[str] = None,
    min_distance: Optional[float] = None,
    max_distance: Optional[float] = None,
    is_utmb: Optional[bool] = None,
    registration_status: Optional[str] = None,
    search: Optional[str] = None
):
    query = {"status": RaceStatus.APPROVED}
    
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    if department:
        query["department"] = {"$regex": department, "$options": "i"}
    if is_utmb is not None:
        query["is_utmb"] = is_utmb
    if min_distance is not None:
        query["distance_km"] = {"$gte": min_distance}
    if max_distance is not None:
        query.setdefault("distance_km", {})["$lte"] = max_distance
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    
    races = await db.races.find(query, {"_id": 0}).sort("race_date", 1).to_list(500)
    
    result = []
    for race in races:
        reg_status = calculate_registration_status(
            race.get('registration_open_date', ''),
            race.get('registration_close_date')
        )
        if registration_status and reg_status != registration_status:
            continue
        race['registration_status'] = reg_status
        result.append(RaceResponse(**race))
    
    return result

@api_router.get("/races/{race_id}", response_model=RaceResponse)
async def get_race(race_id: str):
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    race['registration_status'] = calculate_registration_status(
        race.get('registration_open_date', ''),
        race.get('registration_close_date')
    )
    return RaceResponse(**race)

@api_router.post("/races", response_model=RaceResponse)
async def create_race(race_data: RaceCreate, user: dict = Depends(get_current_user)):
    race_id = str(uuid.uuid4())
    status = RaceStatus.APPROVED if user['role'] == UserRole.ADMIN else RaceStatus.PENDING
    
    race = {
        "id": race_id,
        **race_data.model_dump(),
        "status": status,
        "submitted_by": user['id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.races.insert_one(race)
    race['registration_status'] = calculate_registration_status(
        race.get('registration_open_date', ''),
        race.get('registration_close_date')
    )
    return RaceResponse(**race)

@api_router.put("/races/{race_id}", response_model=RaceResponse)
async def update_race(race_id: str, race_data: RaceUpdate, user: dict = Depends(get_current_user)):
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    
    if user['role'] != UserRole.ADMIN and race.get('submitted_by') != user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in race_data.model_dump().items() if v is not None}
    if update_data:
        await db.races.update_one({"id": race_id}, {"$set": update_data})
    
    updated = await db.races.find_one({"id": race_id}, {"_id": 0})
    updated['registration_status'] = calculate_registration_status(
        updated.get('registration_open_date', ''),
        updated.get('registration_close_date')
    )
    return RaceResponse(**updated)

@api_router.delete("/races/{race_id}")
async def delete_race(race_id: str, user: dict = Depends(get_admin_user)):
    result = await db.races.delete_one({"id": race_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Race not found")
    return {"message": "Race deleted"}

# ==================== ADMIN ROUTES ====================
@api_router.get("/admin/pending", response_model=List[RaceResponse])
async def get_pending_races(user: dict = Depends(get_admin_user)):
    races = await db.races.find({"status": RaceStatus.PENDING}, {"_id": 0}).to_list(100)
    result = []
    for race in races:
        race['registration_status'] = calculate_registration_status(
            race.get('registration_open_date', ''),
            race.get('registration_close_date')
        )
        result.append(RaceResponse(**race))
    return result

@api_router.post("/admin/moderate/{race_id}")
async def moderate_race(race_id: str, action: ModerateAction, background_tasks: BackgroundTasks, user: dict = Depends(get_admin_user)):
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    
    new_status = RaceStatus.APPROVED if action.action == "approve" else RaceStatus.REJECTED
    await db.races.update_one({"id": race_id}, {"$set": {"status": new_status}})
    
    # Notify subscribers if approved
    if new_status == RaceStatus.APPROVED:
        background_tasks.add_task(notify_race_approved, race)
    
    return {"message": f"Race {action.action}d successfully"}

async def notify_race_approved(race: dict):
    # Notify all users who have notifications enabled
    logger.info(f"Race approved: {race['name']}")

# ==================== IMPORT ROUTES ====================
@api_router.post("/admin/import")
async def import_races_from_excel(file: UploadFile = File(...), user: dict = Depends(get_admin_user)):
    """Import races from Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Le fichier doit être au format Excel (.xlsx ou .xls)")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents), sheet_name='Courses')
        
        # Remove empty rows
        df = df.dropna(subset=['name'])
        df = df[df['name'].str.strip() != '']
        
        # Filter out example rows
        df = df[~df['name'].str.contains('EXEMPLE', case=False, na=False)]
        
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="Aucune course valide trouvée dans le fichier")
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        required_fields = ['name', 'description', 'location', 'region', 'department', 
                          'latitude', 'longitude', 'distance_km', 'elevation_gain',
                          'race_date', 'registration_open_date', 'is_utmb']
        
        for idx, row in df.iterrows():
            try:
                # Check required fields
                missing_fields = []
                for field in required_fields:
                    if field not in row or pd.isna(row[field]) or str(row[field]).strip() == '':
                        missing_fields.append(field)
                
                if missing_fields:
                    errors.append(f"Ligne {idx + 2}: Champs manquants: {', '.join(missing_fields)}")
                    skipped_count += 1
                    continue
                
                # Check if race already exists
                existing = await db.races.find_one({"name": str(row['name']).strip()})
                if existing:
                    errors.append(f"Ligne {idx + 2}: Course '{row['name']}' existe déjà")
                    skipped_count += 1
                    continue
                
                # Parse dates
                def parse_date(val):
                    if pd.isna(val) or val == '':
                        return None
                    if isinstance(val, datetime):
                        return val.strftime('%Y-%m-%d')
                    return str(val).strip()
                
                # Parse is_utmb
                is_utmb_val = row.get('is_utmb', False)
                if isinstance(is_utmb_val, str):
                    is_utmb = is_utmb_val.lower() in ['true', 'oui', 'yes', '1']
                else:
                    is_utmb = bool(is_utmb_val)
                
                race = {
                    "id": str(uuid.uuid4()),
                    "name": str(row['name']).strip(),
                    "description": str(row['description']).strip(),
                    "location": str(row['location']).strip(),
                    "region": str(row['region']).strip(),
                    "department": str(row['department']).strip(),
                    "latitude": float(row['latitude']),
                    "longitude": float(row['longitude']),
                    "distance_km": float(row['distance_km']),
                    "elevation_gain": int(float(row['elevation_gain'])),
                    "race_date": parse_date(row['race_date']),
                    "registration_open_date": parse_date(row['registration_open_date']),
                    "registration_close_date": parse_date(row.get('registration_close_date')),
                    "is_utmb": is_utmb,
                    "website_url": str(row.get('website_url', '')).strip() if pd.notna(row.get('website_url')) else None,
                    "image_url": str(row.get('image_url', '')).strip() if pd.notna(row.get('image_url')) else None,
                    "status": RaceStatus.APPROVED,  # Admin import = auto-approved
                    "submitted_by": user['id'],
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.races.insert_one(race)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Ligne {idx + 2}: Erreur - {str(e)}")
                skipped_count += 1
        
        return {
            "message": f"Import terminé: {imported_count} course(s) importée(s), {skipped_count} ignorée(s)",
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors[:20]  # Limit errors shown
        }
        
    except Exception as e:
        logger.error(f"Import error: {e}")
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'import: {str(e)}")

@api_router.delete("/admin/races/all")
async def delete_all_races(user: dict = Depends(get_admin_user)):
    """Delete all races (use with caution)"""
    result = await db.races.delete_many({})
    return {"message": f"{result.deleted_count} course(s) supprimée(s)"}

# ==================== FAVORITES ROUTES ====================
@api_router.get("/favorites", response_model=List[dict])
async def get_favorites(user: dict = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    
    # Collect all race IDs for bulk query (avoid N+1)
    race_ids = [fav['race_id'] for fav in favorites]
    
    # Single bulk query for all races
    races = await db.races.find({"id": {"$in": race_ids}}, {"_id": 0}).to_list(100)
    races_dict = {race['id']: race for race in races}
    
    result = []
    for fav in favorites:
        race = races_dict.get(fav['race_id'])
        if race:
            race['registration_status'] = calculate_registration_status(
                race.get('registration_open_date', ''),
                race.get('registration_close_date')
            )
            result.append({
                "favorite": fav,
                "race": race
            })
    return result

@api_router.post("/favorites/{race_id}")
async def add_favorite(race_id: str, notify: bool = True, user: dict = Depends(get_current_user)):
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    
    existing = await db.favorites.find_one({"user_id": user['id'], "race_id": race_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")
    
    favorite = {
        "id": str(uuid.uuid4()),
        "user_id": user['id'],
        "race_id": race_id,
        "notify_on_registration": notify,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.favorites.insert_one(favorite)
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{race_id}")
async def remove_favorite(race_id: str, user: dict = Depends(get_current_user)):
    result = await db.favorites.delete_one({"user_id": user['id'], "race_id": race_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Removed from favorites"}

@api_router.put("/favorites/{race_id}/notify")
async def toggle_favorite_notify(race_id: str, notify: bool, user: dict = Depends(get_current_user)):
    result = await db.favorites.update_one(
        {"user_id": user['id'], "race_id": race_id},
        {"$set": {"notify_on_registration": notify}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Notification preference updated"}

# ==================== USER SETTINGS ====================
@api_router.put("/users/settings")
async def update_user_settings(email_notifications: bool, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"email_notifications": email_notifications}}
    )
    return {"message": "Settings updated"}

# ==================== FILTERS DATA ====================
@api_router.get("/filters/regions")
async def get_regions():
    regions = await db.races.distinct("region", {"status": RaceStatus.APPROVED})
    return sorted([r for r in regions if r])

@api_router.get("/filters/departments")
async def get_departments(region: Optional[str] = None):
    query = {"status": RaceStatus.APPROVED}
    if region:
        query["region"] = region
    departments = await db.races.distinct("department", query)
    return sorted([d for d in departments if d])

# ==================== SEED DATA ====================
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    count = await db.races.count_documents({})
    if count > 0:
        return {"message": "Database already seeded"}
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@trailfrance.com",
        "password": hash_password("admin123"),
        "name": "Admin",
        "role": UserRole.ADMIN,
        "email_notifications": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin)
    
    # Sample races
    races = [
        {
            "id": str(uuid.uuid4()),
            "name": "UTMB Mont-Blanc",
            "description": "L'Ultra-Trail du Mont-Blanc est une course de trail de 171 km autour du Mont-Blanc, traversant la France, l'Italie et la Suisse.",
            "location": "Chamonix",
            "region": "Auvergne-Rhône-Alpes",
            "department": "Haute-Savoie",
            "latitude": 45.9237,
            "longitude": 6.8694,
            "distance_km": 171,
            "elevation_gain": 10000,
            "race_date": "2025-08-29",
            "registration_open_date": "2025-01-15",
            "registration_close_date": "2025-03-01",
            "is_utmb": True,
            "website_url": "https://utmbmontblanc.com",
            "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Grand Trail des Templiers",
            "description": "Course mythique dans les Causses et les gorges de la Dourbie, un parcours technique et exigeant.",
            "location": "Millau",
            "region": "Occitanie",
            "department": "Aveyron",
            "latitude": 44.0986,
            "longitude": 3.0778,
            "distance_km": 75,
            "elevation_gain": 3500,
            "race_date": "2025-10-19",
            "registration_open_date": "2025-02-01",
            "registration_close_date": "2025-09-15",
            "is_utmb": False,
            "website_url": "https://www.festivaldestempliers.com",
            "image_url": "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=2072&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Trail de la Côte d'Opale",
            "description": "Trail côtier avec des paysages magnifiques entre dunes et falaises.",
            "location": "Boulogne-sur-Mer",
            "region": "Hauts-de-France",
            "department": "Pas-de-Calais",
            "latitude": 50.7264,
            "longitude": 1.6147,
            "distance_km": 50,
            "elevation_gain": 1200,
            "race_date": "2025-06-14",
            "registration_open_date": "2024-12-01",
            "registration_close_date": "2025-06-01",
            "is_utmb": False,
            "website_url": None,
            "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Éco-Trail de Paris",
            "description": "Un trail urbain traversant les bois et parcs de la région parisienne.",
            "location": "Paris",
            "region": "Île-de-France",
            "department": "Paris",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "distance_km": 80,
            "elevation_gain": 1500,
            "race_date": "2025-03-15",
            "registration_open_date": "2024-10-01",
            "registration_close_date": "2025-03-01",
            "is_utmb": True,
            "website_url": "https://www.ecotraildeparis.com",
            "image_url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ultra Trail du Vercors",
            "description": "Un ultra trail sauvage au cœur du massif du Vercors.",
            "location": "Villard-de-Lans",
            "region": "Auvergne-Rhône-Alpes",
            "department": "Isère",
            "latitude": 45.0714,
            "longitude": 5.5514,
            "distance_km": 100,
            "elevation_gain": 5500,
            "race_date": "2025-07-12",
            "registration_open_date": "2025-01-01",
            "registration_close_date": "2025-06-30",
            "is_utmb": False,
            "website_url": None,
            "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2074&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Trail des Sangliers",
            "description": "Course dans les forêts bretonnes avec un parcours vallonné.",
            "location": "Rennes",
            "region": "Bretagne",
            "department": "Ille-et-Vilaine",
            "latitude": 48.1173,
            "longitude": -1.6778,
            "distance_km": 42,
            "elevation_gain": 800,
            "race_date": "2025-04-20",
            "registration_open_date": "2025-01-10",
            "registration_close_date": "2025-04-10",
            "is_utmb": False,
            "website_url": None,
            "image_url": "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=2072&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Grand Raid des Pyrénées",
            "description": "Un des plus grands trails des Pyrénées, traversant des paysages montagnards exceptionnels.",
            "location": "Vielle-Aure",
            "region": "Occitanie",
            "department": "Hautes-Pyrénées",
            "latitude": 42.8167,
            "longitude": 0.3167,
            "distance_km": 160,
            "elevation_gain": 10500,
            "race_date": "2025-08-22",
            "registration_open_date": "2025-02-15",
            "registration_close_date": "2025-07-31",
            "is_utmb": True,
            "website_url": "https://www.grandraidpyrenees.com",
            "image_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Trail des Calanques",
            "description": "Un trail magnifique le long des calanques de Marseille à Cassis.",
            "location": "Marseille",
            "region": "Provence-Alpes-Côte d'Azur",
            "department": "Bouches-du-Rhône",
            "latitude": 43.2125,
            "longitude": 5.4363,
            "distance_km": 35,
            "elevation_gain": 1800,
            "race_date": "2025-05-11",
            "registration_open_date": "2025-01-05",
            "registration_close_date": "2025-05-01",
            "is_utmb": False,
            "website_url": None,
            "image_url": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2074&auto=format&fit=crop",
            "status": RaceStatus.APPROVED,
            "submitted_by": admin_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.races.insert_many(races)
    return {"message": f"Seeded {len(races)} races and 1 admin user"}

# ==================== ROOT ====================
@api_router.get("/")
async def root():
    return {"message": "Trouve Ton Dossard API"}

# ==================== REPORTS (Signalements) ====================
class ReportCreate(BaseModel):
    reason: Optional[str] = "Inscriptions closes"

REPORTS_THRESHOLD = 3  # Nombre de signalements pour validation automatique
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'trouvetontrail.run@gmail.com')

@api_router.post("/races/{race_id}/report-closed")
async def report_registration_closed(
    race_id: str, 
    report: ReportCreate,
    background_tasks: BackgroundTasks,
    request_ip: Optional[str] = None
):
    """Signaler qu'une course a ses inscriptions closes"""
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    # Générer un identifiant unique pour ce visiteur (basé sur IP ou session)
    # Pour simplicité, on utilise un hash de l'heure + race_id pour limiter les abus
    visitor_id = str(uuid.uuid4())  # En prod, utiliser IP ou fingerprint
    
    # Vérifier si déjà signalé récemment (dans les dernières 24h)
    existing_report = await db.reports.find_one({
        "race_id": race_id,
        "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()}
    })
    
    # Créer le signalement
    report_doc = {
        "id": str(uuid.uuid4()),
        "race_id": race_id,
        "race_name": race['name'],
        "visitor_id": visitor_id,
        "reason": report.reason,
        "status": "pending",  # pending, validated, rejected
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reports.insert_one(report_doc)
    
    # Compter les signalements uniques pour cette course (dernières 7 jours)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    report_count = await db.reports.count_documents({
        "race_id": race_id,
        "status": "pending",
        "created_at": {"$gte": week_ago}
    })
    
    # Si 3 signalements ou plus → validation automatique
    if report_count >= REPORTS_THRESHOLD:
        # Mettre à jour la course pour fermer les inscriptions
        await db.races.update_one(
            {"id": race_id},
            {"$set": {
                "registration_close_date": datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                "auto_closed_by_reports": True,
                "auto_closed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Marquer tous les signalements comme validés
        await db.reports.update_many(
            {"race_id": race_id, "status": "pending"},
            {"$set": {"status": "validated"}}
        )
        
        # Envoyer email de notification
        if SENDGRID_API_KEY:
            html_content = f"""
            <h2>🔴 Inscriptions fermées automatiquement</h2>
            <p><strong>{REPORTS_THRESHOLD} signalements</strong> ont été reçus pour la course :</p>
            <p style="font-size: 18px; font-weight: bold;">{race['name']}</p>
            <p>📍 {race['location']}, {race['region']}</p>
            <p>Les inscriptions ont été automatiquement marquées comme fermées.</p>
            <p><a href="{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/races/{race_id}">Voir la course</a></p>
            """
            background_tasks.add_task(send_email, ADMIN_EMAIL, f"[AUTO] Inscriptions fermées - {race['name']}", html_content)
        
        logger.info(f"Auto-closed registration for race {race['name']} after {report_count} reports")
        return {
            "message": "Merci ! Les inscriptions ont été automatiquement marquées comme fermées.",
            "auto_closed": True,
            "report_count": report_count
        }
    
    # Sinon, envoyer un email de notification à l'admin
    if SENDGRID_API_KEY:
        html_content = f"""
        <h2>⚠️ Nouveau signalement d'inscriptions closes</h2>
        <p>Un visiteur a signalé que les inscriptions sont closes pour :</p>
        <p style="font-size: 18px; font-weight: bold;">{race['name']}</p>
        <p>📍 {race['location']}, {race['region']}</p>
        <p>📊 <strong>{report_count}/{REPORTS_THRESHOLD}</strong> signalement(s) reçu(s)</p>
        <p>Raison : {report.reason}</p>
        <hr>
        <p>
            <a href="{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/admin" 
               style="background-color: #d9f99d; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                Gérer dans l'admin
            </a>
        </p>
        """
        background_tasks.add_task(send_email, ADMIN_EMAIL, f"[Signalement] {race['name']} - Inscriptions closes", html_content)
    
    logger.info(f"Report received for race {race['name']}: {report_count}/{REPORTS_THRESHOLD}")
    return {
        "message": "Merci pour votre signalement ! L'équipe va vérifier.",
        "auto_closed": False,
        "report_count": report_count
    }

@api_router.get("/admin/reports")
async def get_pending_reports(user: dict = Depends(get_admin_user)):
    """Récupérer tous les signalements en attente"""
    reports = await db.reports.find({"status": "pending"}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Grouper par course
    grouped = {}
    for report in reports:
        race_id = report['race_id']
        if race_id not in grouped:
            grouped[race_id] = {
                "race_id": race_id,
                "race_name": report['race_name'],
                "reports": [],
                "count": 0
            }
        grouped[race_id]["reports"].append(report)
        grouped[race_id]["count"] += 1
    
    return list(grouped.values())

@api_router.post("/admin/reports/{race_id}/validate")
async def validate_report(race_id: str, user: dict = Depends(get_admin_user)):
    """Valider un signalement et fermer les inscriptions"""
    race = await db.races.find_one({"id": race_id}, {"_id": 0})
    if not race:
        raise HTTPException(status_code=404, detail="Course non trouvée")
    
    # Fermer les inscriptions
    await db.races.update_one(
        {"id": race_id},
        {"$set": {
            "registration_close_date": datetime.now(timezone.utc).strftime('%Y-%m-%d'),
            "manually_closed": True,
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "closed_by": user['id']
        }}
    )
    
    # Marquer les signalements comme validés
    await db.reports.update_many(
        {"race_id": race_id, "status": "pending"},
        {"$set": {"status": "validated", "validated_by": user['id']}}
    )
    
    return {"message": f"Inscriptions fermées pour {race['name']}"}

@api_router.post("/admin/reports/{race_id}/reject")
async def reject_report(race_id: str, user: dict = Depends(get_admin_user)):
    """Rejeter les signalements (inscriptions toujours ouvertes)"""
    # Marquer les signalements comme rejetés
    result = await db.reports.update_many(
        {"race_id": race_id, "status": "pending"},
        {"$set": {"status": "rejected", "rejected_by": user['id']}}
    )
    
    return {"message": f"{result.modified_count} signalement(s) rejeté(s)"}

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
