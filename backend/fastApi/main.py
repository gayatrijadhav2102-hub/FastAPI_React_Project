from fastapi import Depends, FastAPI
from models import Product  # Pydantic model
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
from database_models import Base, ProductDB  # SQLAlchemy model
from sqlalchemy.orm import Session

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def greet():
    return {"message": "welcome to fastapi"}


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/products")
def get_all_products(db: Session = Depends(get_db)):
    return db.query(ProductDB).all()


@app.get("/product/{id}")
def get_product_by_id(id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == id).first()
    if product:
        return product
    return {"error": "Product not found"}


@app.post("/product")
def add_product(product: Product, db: Session = Depends(get_db)):
    new_product = ProductDB(name=product.name, description=product.description)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@app.put("/product/{id}")
def update_product(id: int, product: Product, db: Session = Depends(get_db)):
    db_product = db.query(ProductDB).filter(ProductDB.id == id).first()
    if db_product:
        db_product.name = product.name
        db_product.description = product.description
        db.commit()
        return {"message": "Product Updated"}
    return {"error": "Product not found"}


@app.delete("/product/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(ProductDB).filter(ProductDB.id == id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return {"message": "product deleted successfully"}
    return {"error": "Product not found"}
