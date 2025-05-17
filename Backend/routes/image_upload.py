from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Dict, Any
from services.s3_service import upload_file, delete_file
from auth.auth_utils import get_current_user
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import PropertyImage as PropertyImageModel, User, Property as PropertyModel
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/upload/{property_id}", response_model=Dict[str, Any])
async def upload_property_image(
    property_id: int,
    is_primary: bool = False,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a property image to S3 and store metadata in the database
    
    Args:
        property_id: ID of the property to associate with the image
        is_primary: Whether this is the primary image for the property
        file: Image file to upload
        db: Database session
        token: Authentication token
        
    Returns:
        Image metadata including URL
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    unique_filename = f"properties/{property_id}/{uuid.uuid4()}.{file_ext}"
    
    # Upload file to S3
    success, result = await upload_file(
        file.file, 
        unique_filename,
        file.content_type
    )
    
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {result}")
    
    # Save image metadata in database
    try:
        new_image = PropertyImageModel(
            image_url=result,
            is_primary=is_primary,
            property_id=property_id
        )
        
        # If this is primary, set all other images for this property as non-primary
        if is_primary:
            db.query(PropertyImageModel).filter(
                PropertyImageModel.property_id == property_id,
                PropertyImageModel.is_primary == True
            ).update({PropertyImageModel.is_primary: False})
            
        db.add(new_image)
        db.commit()
        db.refresh(new_image)
        
        return {
            "success": True,
            "image": {
                "id": new_image.id,
                "url": new_image.image_url,
                "is_primary": new_image.is_primary,
                "property_id": new_image.property_id
            }
        }
    except Exception as e:
        # If database operation fails, try to delete the uploaded file
        await delete_file(unique_filename)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/{image_id}", response_model=Dict[str, Any])
async def delete_property_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a property image from S3 and database
    
    Args:
        image_id: ID of the image to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Success message
    """
    # Get image from database
    image = db.query(PropertyImageModel).filter(PropertyImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Check if user owns the property (should be extracted to a utility function)
    property = image.property
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if property.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")
    
    # Extract filename from URL
    # Assuming URL format: https://{bucket}.s3.{region}.amazonaws.com/{filename}
    try:
        file_path = image.image_url.split(".amazonaws.com/")[1]
    except (IndexError, AttributeError):
        file_path = None
    
    # Delete from S3 if file path extracted successfully
    if file_path:
        delete_result = await delete_file(file_path)
        if not delete_result:
            # Continue anyway even if S3 deletion fails, to at least clean database
            pass
      # Delete from database
    db.delete(image)
    db.commit()
    
    return {"success": True, "message": "Image deleted successfully"}

@router.get("/{property_id}", response_model=Dict[str, Any])
async def get_property_images(
    property_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all images for a property
    
    Args:
        property_id: ID of the property
        db: Database session
        
    Returns:
        List of images for the property
    """
    images = db.query(PropertyImageModel).filter(
        PropertyImageModel.property_id == property_id
    ).all()
    
    return {
        "success": True,
        "images": [
            {
                "id": img.id,
                "url": img.image_url,
                "is_primary": img.is_primary,
                "property_id": img.property_id
            } for img in images
        ]
    }
