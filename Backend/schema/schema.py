import strawberry
import typing
import enum
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import timedelta
from strawberry.schema.config import StrawberryConfig
from fastapi_cache.decorator import cache
from db.redis_utils import check_rate_limit, store_user_session, invalidate_user_session

# Import models
from models.models import User as UserModel
from models.models import Item as ItemModel
from models.models import Property as PropertyModel
from models.models import PropertyImage as PropertyImageModel
from models.models import PropertyType as PropertyTypeEnum
from models.models import ListingType as ListingTypeEnum
from models.models import PropertyStatus as PropertyStatusEnum
from models.models import UserRole as UserRoleEnum

# Import database and auth utilities
from db.database import get_db
from auth.auth_utils import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user,
    logout_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Add strawberry context for request information
from strawberry.fastapi import BaseContext
from fastapi import Request, Depends
from fastapi.security import OAuth2PasswordBearer

# Create OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Context class to access request information
class CustomContext(BaseContext):
    def __init__(self, request: Request):
        super().__init__()
        self.request = request
        # Extract authorization header
        self.authorization = request.headers.get("Authorization")
        
    @property
    def token(self) -> Optional[str]:
        """Extract the token from the Authorization header"""
        if self.authorization and self.authorization.startswith("Bearer "):
            return self.authorization.replace("Bearer ", "")
        return None

# Enum types
@strawberry.enum
class PropertyType(enum.Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    COMMERCIAL = "commercial"
    LAND = "land"


@strawberry.enum
class ListingType(enum.Enum):
    SELL = "sell"
    RENT = "rent"


@strawberry.enum
class PropertyStatus(enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    SOLD = "sold"
    RENTED = "rented"


@strawberry.enum
class UserRole(enum.Enum):
    USER = "user"
    AGENT = "agent"
    ADMIN = "admin"


# Helper functions to convert SQLAlchemy enums to Strawberry enums
def convert_property_type(db_property_type):
    """Convert SQLAlchemy PropertyType enum to Strawberry PropertyType enum"""
    if db_property_type is None:
        return None
    value = db_property_type.value
    return PropertyType(value)

def convert_listing_type(db_listing_type):
    """Convert SQLAlchemy ListingType enum to Strawberry ListingType enum"""
    if db_listing_type is None:
        return None
    value = db_listing_type.value
    return ListingType(value)

def convert_property_status(db_property_status):
    """Convert SQLAlchemy PropertyStatus enum to Strawberry PropertyStatus enum"""
    if db_property_status is None:
        return None
    value = db_property_status.value
    return PropertyStatus(value)

def convert_user_role(db_user_role):
    """Convert SQLAlchemy UserRole enum to Strawberry UserRole enum"""
    if db_user_role is None:
        return None
    value = db_user_role.value
    return UserRole(value)


# Output types
@strawberry.type
class User:
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    is_active: bool
    created_at: str
    
    @strawberry.field
    def role(self, root) -> UserRole:
        return convert_user_role(root.role)
        
    @strawberry.field
    def properties(self, root) -> List["Property"]:
        return root.properties
        
    @strawberry.field
    def items(self, root) -> List["Item"]:
        return root.items


@strawberry.type
class Item:
    id: int
    title: str
    description: str
    owner_id: int
    created_at: str
    
    @strawberry.field
    def owner(self, root) -> User:
        return root.owner


@strawberry.type
class PropertyImage:
    id: int
    image_url: str
    is_primary: bool
    property_id: int


@strawberry.type
class Property:
    id: int
    title: str
    price: float
    area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: str
    city: str
    state: str
    zip_code: Optional[str] = None
    featured: bool
    is_published: bool
    created_at: str
    updated_at: str
    owner_id: int
    description: Optional[str] = None
    
    @strawberry.field
    def property_type(self, root) -> PropertyType:
        return convert_property_type(root.property_type)
    
    @strawberry.field
    def listing_type(self, root) -> ListingType:
        return convert_listing_type(root.listing_type)
    
    @strawberry.field
    def status(self, root) -> Optional[PropertyStatus]:
        return convert_property_status(root.status) if root.status else None
    
    @strawberry.field
    def owner(self, root) -> User:
        return root.owner
        
    @strawberry.field
    def images(self, root) -> List[PropertyImage]:
        return root.images


# Response types
@strawberry.type
class UserResponse:
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None


@strawberry.type
class ItemResponse:
    success: bool
    item: Optional[Item] = None
    error: Optional[str] = None


@strawberry.type
class PropertyResponse:
    success: bool
    property: Optional[Property] = None
    error: Optional[str] = None


@strawberry.type
class PropertyImageResponse:
    success: bool
    image: Optional[PropertyImage] = None
    error: Optional[str] = None


@strawberry.type
class AuthResponse:
    success: bool
    token: Optional[str] = None
    user: Optional[User] = None
    error: Optional[str] = None
    message: Optional[str] = None


# Input types
@strawberry.input
class SignupInput:
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None


@strawberry.input
class SigninInput:
    email: str
    password: str


@strawberry.input
class UserInput:
    name: str
    email: str
    age: Optional[int] = None
    address: Optional[str] = None


@strawberry.input
class ItemInput:
    title: str
    description: str
    owner_id: int


@strawberry.input
class PropertyInput:
    title: str
    description: Optional[str] = None
    property_type: PropertyType
    listing_type: ListingType
    price: float
    area: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: str
    city: str
    state: str
    zip_code: Optional[str] = None
    status: Optional[PropertyStatus] = None
    featured: Optional[bool] = None
    is_published: bool


@strawberry.input
class PropertyImageInput:
    image_url: str
    is_primary: bool
    property_id: int


# Database helper functions
def get_db_session():
    """Get a database session safely"""
    try:
        db = next(get_db())
        return db
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


def get_users():
    """Get all users"""
    db = get_db_session()
    if db is None:
        return []
    try:
        return db.query(UserModel).all()
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []


def get_user(id: int):
    """Get user by id"""
    db = get_db_session()
    if db is None:
        return None
    try:
        return db.query(UserModel).filter(UserModel.id == id).first()
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None


def get_items():
    """Get all items"""
    db = get_db_session()
    if db is None:
        return []
    try:
        return db.query(ItemModel).all()
    except Exception as e:
        print(f"Error fetching items: {e}")
        return []


def get_item(id: int):
    """Get item by id"""
    db = get_db_session()
    if db is None:
        return None
    try:
        return db.query(ItemModel).filter(ItemModel.id == id).first()
    except Exception as e:
        print(f"Error fetching item: {e}")
        return None


def get_properties(
    property_type: Optional[PropertyType] = None,
    listing_type: Optional[ListingType] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    min_bathrooms: Optional[float] = None,
    max_bathrooms: Optional[float] = None,
    city: Optional[str] = None
):
    """Get all published properties with optional filters"""
    db = get_db_session()
    if db is None:
        return []
    
    try:
        query = db.query(PropertyModel).filter(PropertyModel.is_published == True)
        
        # Apply filters if provided
        if property_type:
            query = query.filter(PropertyModel.property_type == property_type)
        
        if listing_type:
            query = query.filter(PropertyModel.listing_type == listing_type)
            
        if min_price is not None:
            query = query.filter(PropertyModel.price >= min_price)
            
        if max_price is not None:
            query = query.filter(PropertyModel.price <= max_price)
            
        # Add bedroom filters
        if min_bedrooms is not None:
            query = query.filter(PropertyModel.bedrooms >= min_bedrooms)
            
        if max_bedrooms is not None:
            query = query.filter(PropertyModel.bedrooms <= max_bedrooms)
        
        # Add bathroom filters
        if min_bathrooms is not None:
            query = query.filter(PropertyModel.bathrooms >= min_bathrooms)
            
        if max_bathrooms is not None:
            query = query.filter(PropertyModel.bathrooms <= max_bathrooms)
            
        if city:
            query = query.filter(PropertyModel.city.ilike(f"%{city}%"))
            
        return query.all()
    except Exception as e:
        print(f"Error fetching properties: {e}")
        return []


def get_user_properties(user_id: int):
    """Get all properties for a specific user"""
    db = get_db_session()
    if db is None:
        return []
    
    try:
        return db.query(PropertyModel).filter(PropertyModel.owner_id == user_id).all()
    except Exception as e:
        print(f"Error fetching user properties: {e}")
        return []


def get_property(id: int):
    """Get property by id"""
    db = get_db_session()
    if db is None:
        return None
    
    try:
        return db.query(PropertyModel).filter(PropertyModel.id == id).first()
    except Exception as e:
        print(f"Error fetching property: {e}")
        return None


# GraphQL Query definition
@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[User]:
        return get_users()

    @strawberry.field
    def user(self, id: int) -> Optional[User]:
        return get_user(id)
        
    @strawberry.field
    def me(self, info: strawberry.Info[CustomContext, None]) -> Optional[User]:
        """Get the currently authenticated user"""        # Get the token from the context
        token = info.context.token
        if not token:
            return None
            
        # Get the database session
        db = get_db_session()
        if db is None:
            return None
            
        # Get the current user from the token - token must be first parameter
        return get_current_user(token, db)
    
    @strawberry.field
    def my_properties(self, info: strawberry.Info[CustomContext, None]) -> List[Property]:
        """Get properties for the currently authenticated user"""
        # Get the token from the context
        token = info.context.token
        if not token:
            return []
              # Get the database session
        db = get_db_session()
        if db is None:
            return []
            
        # Get the current user from the token - token must be first parameter
        user = get_current_user(token, db)
        if not user:
            return []
            
        # Get the user's properties
        return get_user_properties(user.id)

    @strawberry.field
    def items(self) -> List[Item]:
        return get_items()    @strawberry.field
    def item(self, id: int) -> Optional[Item]:
        return get_item(id)
        
    @strawberry.field
    def properties(
        self, 
        property_type: Optional[PropertyType] = None,
        listing_type: Optional[ListingType] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_bedrooms: Optional[int] = None,
        max_bedrooms: Optional[int] = None,
        min_bathrooms: Optional[float] = None,
        max_bathrooms: Optional[float] = None,
        city: Optional[str] = None
    ) -> List[Property]:
        """Get all published properties with optional filters"""
        return get_properties(
            property_type=property_type,
            listing_type=listing_type,
            min_price=min_price,
            max_price=max_price,
            min_bedrooms=min_bedrooms,
            max_bedrooms=max_bedrooms,
            min_bathrooms=min_bathrooms,
            max_bathrooms=max_bathrooms,
            city=city
        )
    
    @strawberry.field
    def property(self, id: int) -> Optional[Property]:
        """Get property by id"""
    @strawberry.field
    def property(self, id: int) -> Optional[Property]:
        """Get property by id"""
        return get_property(id)
    
    @strawberry.field
    def user_properties(self, user_id: int) -> List[Property]:
        """Get all properties for a specific user"""
        return get_user_properties(user_id)


# GraphQL Mutation definition
@strawberry.type
class Mutation:
    # Auth mutations
    @strawberry.mutation
    def signup(self, user_data: SignupInput) -> AuthResponse:
        db = get_db_session()
        if db is None:
            return AuthResponse(success=False, error="Database connection error", message="Database connection error")
        
        try:
            # Check if email already exists
            existing_user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
            if existing_user:
                return AuthResponse(success=False, error="Email already exists", message="Email already exists")
            
            # Hash the password
            hashed_password = get_password_hash(user_data.password)
            
            # Create new user
            new_user = UserModel(
                name=user_data.name,
                email=user_data.email,
                hashed_password=hashed_password,
                phone=user_data.phone,
                age=user_data.age,
                address=user_data.address,
                is_active=True,
                role=UserRoleEnum.USER  # Set default role as USER
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Generate access token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": new_user.email, "user_id": new_user.id},
                expires_delta=access_token_expires
            )
            
            return AuthResponse(
                success=True, 
                token=access_token, 
                user=new_user,
                message="Signup successful"
            )
        except Exception as e:
            db.rollback()
            error_message = f"Error creating user: {str(e)}"
            return AuthResponse(success=False, error=error_message, message=error_message)

    @strawberry.mutation
    def signin(self, signin_data: SigninInput) -> AuthResponse:
        db = get_db_session()
        if db is None:
            return AuthResponse(success=False, error="Database connection error", message="Database connection error")
        
        try:
            # Authenticate user
            user = authenticate_user(db, signin_data.email, signin_data.password)
            if not user:
                return AuthResponse(success=False, error="Invalid email or password", message="Invalid email or password")
            
            # Generate access token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "user_id": user.id},
                expires_delta=access_token_expires
            )
            
            return AuthResponse(
                success=True, 
                token=access_token, 
                user=user,
                message="Login successful"
            )
        except Exception as e:
            error_message = f"Login error: {str(e)}"
            return AuthResponse(success=False, error=error_message, message=error_message)

    # Property mutations
    @strawberry.mutation
    def create_property(self, property_data: PropertyInput, owner_id: int) -> PropertyResponse:
        """Create a new property"""
        db = get_db_session()
        if db is None:
            return PropertyResponse(success=False, error="Database connection error")
        
        try:
            # Validate required fields
            required_fields = {
                "title": property_data.title,
                "property_type": property_data.property_type,
                "listing_type": property_data.listing_type,
                "price": property_data.price,
                "address": property_data.address,
                "city": property_data.city,
                "state": property_data.state
            }
            
            missing_fields = [field for field, value in required_fields.items() if value is None]
            if missing_fields:
                return PropertyResponse(
                    success=False, 
                    error=f"Missing required fields: {', '.join(missing_fields)}"
                )
            
            # Check if user exists
            user = db.query(UserModel).filter(UserModel.id == owner_id).first()
            if not user:
                return PropertyResponse(success=False, error=f"User with ID {owner_id} not found")
            
            # Convert GraphQL enum to SQL Alchemy model enum
            try:
                # Get the string value from GraphQL enum and convert to SQLAlchemy enum
                property_type_value = property_data.property_type.value
                listing_type_value = property_data.listing_type.value
                
                # Find matching SQLAlchemy enum values
                sql_property_type = PropertyTypeEnum(property_type_value)
                sql_listing_type = ListingTypeEnum(listing_type_value)
                
                # Create new property with proper enum values
                new_property = PropertyModel(
                    title=property_data.title,
                    description=property_data.description,
                    property_type=sql_property_type,
                    listing_type=sql_listing_type,
                    price=property_data.price,
                    area=property_data.area,
                    bedrooms=property_data.bedrooms,
                    bathrooms=property_data.bathrooms,
                    address=property_data.address,
                    city=property_data.city,
                    state=property_data.state,
                    zip_code=property_data.zip_code,
                    status=PropertyStatusEnum(property_data.status.value) if property_data.status else None,
                    featured=property_data.featured if property_data.featured is not None else False,
                    is_published=property_data.is_published if property_data.is_published is not None else True,
                    owner_id=owner_id
                )
                
                db.add(new_property)
                db.commit()
                db.refresh(new_property)
                
                return PropertyResponse(success=True, property=new_property)
            except ValueError as e:
                db.rollback()
                return PropertyResponse(success=False, error=f"Invalid property or listing type: {str(e)}")
        except Exception as e:
            if 'db' in locals() and db is not None:
                db.rollback()
            return PropertyResponse(success=False, error=f"Error creating property: {str(e)}")

    @strawberry.mutation
    def update_property(self, id: int, property_data: PropertyInput, owner_id: int) -> PropertyResponse:
        """Update a property"""
        db = get_db_session()
        if db is None:
            return PropertyResponse(success=False, error="Database connection error")
        
        try:
            # Get property by id
            property = db.query(PropertyModel).filter(PropertyModel.id == id).first()
            if not property:
                return PropertyResponse(success=False, error="Property not found")
            
            # Check if user is the owner
            if property.owner_id != owner_id:
                return PropertyResponse(success=False, error="Not authorized to update this property")
            
            # Convert GraphQL enum to SQL Alchemy model enum
            try:
                # Get the string value from GraphQL enum and convert to SQLAlchemy enum
                property_type_value = property_data.property_type.value
                listing_type_value = property_data.listing_type.value
                
                # Find matching SQLAlchemy enum values
                sql_property_type = PropertyTypeEnum(property_type_value)
                sql_listing_type = ListingTypeEnum(listing_type_value)
                
                # Update property fields
                property.title = property_data.title
                property.description = property_data.description
                property.property_type = sql_property_type
                property.listing_type = sql_listing_type
                property.price = property_data.price
                property.area = property_data.area
                property.bedrooms = property_data.bedrooms
                property.bathrooms = property_data.bathrooms
                property.address = property_data.address
                property.city = property_data.city
                property.state = property_data.state
                property.zip_code = property_data.zip_code
                if property_data.status is not None:
                    property.status = PropertyStatusEnum(property_data.status.value)
                if property_data.featured is not None:
                    property.featured = property_data.featured
                property.is_published = property_data.is_published
                
                db.commit()
                db.refresh(property)
                
                return PropertyResponse(success=True, property=property)
            except ValueError as e:
                db.rollback()
                return PropertyResponse(success=False, error=f"Invalid property or listing type: {str(e)}")
        except Exception as e:
            if 'db' in locals() and db is not None:
                db.rollback()
            return PropertyResponse(success=False, error=f"Error updating property: {str(e)}")

    @strawberry.mutation
    def delete_property(self, id: int, owner_id: int) -> PropertyResponse:
        """Delete a property"""
        db = get_db_session()
        if db is None:
            return PropertyResponse(success=False, error="Database connection error")
        
        try:
            # Get property by id
            property = db.query(PropertyModel).filter(PropertyModel.id == id).first()
            if not property:
                return PropertyResponse(success=False, error="Property not found")
            
            # Check if user is the owner
            if property.owner_id != owner_id:
                return PropertyResponse(success=False, error="Not authorized to delete this property")
            
            # Delete property
            db.delete(property)
            db.commit()
            
            return PropertyResponse(success=True)
        except Exception as e:
            db.rollback()
            return PropertyResponse(success=False, error=f"Error deleting property: {str(e)}")

    @strawberry.mutation
    def add_property_image(self, image_data: PropertyImageInput, owner_id: int) -> PropertyImageResponse:
        """Add a property image"""
        db = get_db_session()
        if db is None:
            return PropertyImageResponse(success=False, error="Database connection error")
        
        try:
            # Get property by id
            property = db.query(PropertyModel).filter(PropertyModel.id == image_data.property_id).first()
            if not property:
                return PropertyImageResponse(success=False, error="Property not found")
            
            # Check if user is the owner
            if property.owner_id != owner_id:
                return PropertyImageResponse(success=False, error="Not authorized to add images to this property")
            
            # Create new image
            new_image = PropertyImageModel(
                image_url=image_data.image_url,
                is_primary=image_data.is_primary,
                property_id=image_data.property_id
            )
            
            db.add(new_image)
            db.commit()
            db.refresh(new_image)
            
            return PropertyImageResponse(success=True, image=new_image)
        except Exception as e:
            db.rollback()
            return PropertyImageResponse(success=False, error=f"Error adding property image: {str(e)}")

    # Keep existing mutations for backward compatibility
    @strawberry.mutation
    def create_user(self, user_data: UserInput) -> UserResponse:
        db = get_db_session()
        if db is None:
            return UserResponse(success=False, error="Database connection error")
        
        try:
            # Check if email already exists
            existing_user = db.query(UserModel).filter(
                UserModel.email == user_data.email
            ).first()
            
            if existing_user:
                return UserResponse(success=False, error="Email already exists")
            
            # Create new user with updated fields
            new_user = UserModel(
                name=user_data.name,
                email=user_data.email,
                age=user_data.age,
                address=user_data.address,
                hashed_password="placeholder",  # Required field but we're not using it in this legacy function
                role=UserRoleEnum.USER  # Set default role as USER
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            return UserResponse(success=True, user=new_user)
        except Exception as e:
            db.rollback()
            return UserResponse(success=False, error=f"Error creating user: {str(e)}")

    @strawberry.mutation
    def create_item(self, item_data: ItemInput) -> ItemResponse:
        db = get_db_session()
        if db is None:
            return ItemResponse(success=False, error="Database connection error")
        
        try:
            # Check if user exists
            user = db.query(UserModel).filter(UserModel.id == item_data.owner_id).first()
            if not user:
                return ItemResponse(success=False, error="User not found")
            
            new_item = ItemModel(
                title=item_data.title,
                description=item_data.description,
                owner_id=item_data.owner_id
            )
            
            db.add(new_item)
            db.commit()
            db.refresh(new_item)
            
            return ItemResponse(success=True, item=new_item)
        except Exception as e:
            db.rollback()
            return ItemResponse(success=False, error=f"Error creating item: {str(e)}")


# Create GraphQL schema
schema = strawberry.Schema(query=Query, mutation=Mutation, config=StrawberryConfig(auto_camel_case=True))