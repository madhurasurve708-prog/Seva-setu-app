from supabase import create_client, Client
from app.core.config import settings

# Bucket names
COMPLAINT_IMAGES_BUCKET = "complaint-images"
PROFILE_PHOTOS_BUCKET = "profile-photos"

# Singleton Supabase client initialised with the service role key so the
# backend can write to Storage without being blocked by RLS policies.
_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_client


def get_supabase_anon_client() -> Client:
    """Create a client used only to verify a caller's Supabase access token."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def upload_image_to_storage(
    file_bytes: bytes,
    content_type: str,
    object_path: str,
    bucket_name: str = COMPLAINT_IMAGES_BUCKET,
) -> str:
    """
    Upload raw bytes to a Supabase Storage bucket and return the public URL.

    object_path  — path within the bucket, e.g. "complaints/42.jpg"
    bucket_name  — target bucket; defaults to complaint-images so existing
                   complaint upload calls require no changes.
    upsert=true  — overwrites an existing object at the same path (replacement).
    """
    client = get_supabase_client()

    client.storage.from_(bucket_name).upload(
        path=object_path,
        file=file_bytes,
        file_options={
            "content-type": content_type,
            "upsert": "true",
        },
    )

    public_url: str = client.storage.from_(bucket_name).get_public_url(object_path)
    return public_url
