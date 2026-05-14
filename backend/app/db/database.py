from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import re
from urllib.parse import quote_plus

def _fix_db_url(url: str) -> str:
    """
    Re-encode only the password portion of the DATABASE_URL so that
    special characters like @, #, $, % don't confuse SQLAlchemy's URL parser.
    This is needed when the .env file contains a partially-encoded or raw password.
    """
    # Match postgresql://user:password@host…
    m = re.match(r'^(postgresql(?:\+\w+)?://[^:]+:)(.+?)(@.+)$', url)
    if not m:
        return url  # Can't parse — return as-is and let SQLAlchemy try
    prefix, raw_password, suffix = m.group(1), m.group(2), m.group(3)
    # Decode any already-encoded % sequences first, then re-encode cleanly
    from urllib.parse import unquote
    decoded_password = unquote(raw_password)
    safe_password = quote_plus(decoded_password)
    return f"{prefix}{safe_password}{suffix}"

_db_url = _fix_db_url(settings.DATABASE_URL)

engine = create_engine(
    _db_url,
    pool_pre_ping=True,       # detect stale Supabase connections automatically
    pool_recycle=300,         # recycle connections every 5 min
    connect_args={"connect_timeout": 10},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
