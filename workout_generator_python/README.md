# BeastMode Workout Generator (Python & SQLite)

This service manages, translates, and structures fitness exercises from multiple open datasets into a single SQLite database.

## Step-by-Step Setup Guide

### 1. Download Raw Datasets
Please download the following free datasets and place them exactly inside the `data/raw/` directory:

1. **Mega Gym Dataset (CSV)**:
   - URL: https://www.kaggle.com/datasets/niharika41298/gym-exercise-data
   - Save as: `data/raw/mega-gym-dataset.csv`

2. **Free Exercise DB (JSON)**:
   - URL: https://github.com/yuhonas/free-exercise-db (Download the `dist/exercises.json`)
   - Save as: `data/raw/exercises.json`

3. **Yoga Poses Dataset (JSON)**:
   - URL: https://raw.githubusercontent.com/priyangsubanerjee/yogism/master/yogism-api.json
   - Save as: `data/raw/yoga-poses.json`

4. **Wger Fixtures (JSON)**:
   - URL: https://github.com/wger-project/wger/tree/master/wger/exercises/fixtures
   - Download the files: `exercise.json`, `muscle.json`, and `equipment.json`
   - Save inside: `data/raw/`

### 2. Install Python Dependencies
Run the following command to install the required libraries:
```bash
pip install -r requirements.txt
```

### 3. Run Importer (Step 2)
Once all datasets are placed, we will execute the importer script to merge, translate into sports Arabic, and import into SQLite.
