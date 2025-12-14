# Beauty Med Spa Patient Dashboard Backend

## Getting Started

To get started, run the following command:

```bash
pip install -r requirements.txt
```

Fill out and create a .env file, matching the .env.example file.

Then, run the following command:

```bash
python main.py
```

If all goes well, you should see a message saying "Connection successful!"

## Constructing the database

To construct the database, run the following command:

```bash
python scripts/create_tables.py
```

This will create all the tables in the database with all indexes defined in the models.

**Important:** If tables already exist, `create_tables.py` will not modify them. To ensure all indexes from your models are present in existing tables, run:

```bash
python scripts/add_indexes.py
```

This script will check for missing indexes and create any that are defined in your models but missing from the database.

Then, run the following command:

```bash
python scripts/seed_database.py
```

This will seed the database with the data from the seed_data directory.

## Running the app

To run the FastAPI server, use one of the following methods:

### Method 1: Using the run script (recommended)

```bash
python run_server.py
```

### Method 2: Using python -m uvicorn

```bash
python -m uvicorn main:app --reload --port 8000
```

### Method 3: Using uvicorn directly (if installed correctly)

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
