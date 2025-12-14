from db.engine import create_sqlalchemy_engine

app_engine = create_sqlalchemy_engine()

# Test the connection
try:
    with app_engine.connect() as connection:
        print("Connection successful!")
except Exception as e:
    print(f"Failed to connect: {e}")
