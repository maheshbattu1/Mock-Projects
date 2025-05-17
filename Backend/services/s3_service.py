import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import logging
from typing import Optional, Tuple, Dict, Any, BinaryIO

# Load environment variables
load_dotenv()

# S3 configuration
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_URL_EXPIRATION = int(os.getenv("S3_URL_EXPIRATION", "3600"))  # Default 1 hour

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_s3_client():
    """
    Create and return an S3 client using credentials from environment variables
    """
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=AWS_REGION
        )
        # Test connection
        s3_client.list_buckets()
        logger.info("S3 connection successful")
        return s3_client
    except ClientError as e:
        logger.error(f"Error connecting to S3: {e}")
        return None

async def upload_file(file: BinaryIO, file_name: str, content_type: Optional[str] = None) -> Tuple[bool, str]:
    """
    Upload a file to S3
    
    Args:
        file: File-like object to upload
        file_name: Name to give the file in S3
        content_type: MIME type of the file (optional)

    Returns:
        Tuple of (success, url or error message)
    """
    try:
        # Since boto3 is not async-compatible, we'll use it synchronously
        s3_client = get_s3_client()
        if not s3_client:
            return False, "S3 client not available"
        
        # Prepare upload parameters
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
            
        # Set ACL to public-read for property images to be publicly accessible
        extra_args["ACL"] = "public-read"
        
        # Upload the file
        s3_client.upload_fileobj(
            file,
            S3_BUCKET_NAME,
            file_name,
            ExtraArgs=extra_args
        )
        
        # Generate the URL for the uploaded file
        url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_name}"
        return True, url
    except ClientError as e:
        error_message = f"Error uploading file to S3: {e}"
        logger.error(error_message)
        return False, error_message

def generate_presigned_url(file_name: str, expiration: int = S3_URL_EXPIRATION) -> Optional[str]:
    """
    Generate a presigned URL for a file in S3
    
    Args:
        file_name: Name of the file in S3
        expiration: Expiration time in seconds

    Returns:
        Presigned URL or None if error
    """
    try:
        s3_client = get_s3_client()
        if not s3_client:
            return None
            
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': file_name
            },
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        logger.error(f"Error generating presigned URL: {e}")
        return None

async def delete_file(file_name: str) -> bool:
    """
    Delete a file from S3
    
    Args:
        file_name: Name of the file in S3

    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        s3_client = get_s3_client()
        if not s3_client:
            return False
            
        s3_client.delete_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_name
        )
        return True
    except ClientError as e:
        logger.error(f"Error deleting file from S3: {e}")
        return False

def list_files(prefix: str = "") -> Optional[Dict[str, Any]]:
    """
    List files in the S3 bucket with optional prefix
    
    Args:
        prefix: Optional prefix to filter files

    Returns:
        Dictionary of S3 list objects response or None if error
    """
    try:
        s3_client = get_s3_client()
        if not s3_client:
            return None
            
        response = s3_client.list_objects_v2(
            Bucket=S3_BUCKET_NAME,
            Prefix=prefix
        )
        return response
    except ClientError as e:
        logger.error(f"Error listing files in S3: {e}")
        return None
