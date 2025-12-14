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

This will create all the tables in the database.

Then, run the following command:

```bash
python scripts/seed_database.py
```

This will seed the database with the data from the seed_data directory.

## Running the app
