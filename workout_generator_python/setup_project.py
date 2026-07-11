import os
import sys

def setup_project():
    print("=========================================")
    print("   BeastMode Workout Generator Setup     ")
    print("=========================================")

    # Define directory structure
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    directories = [
        os.path.join(base_dir, "data", "raw"),
        os.path.join(base_dir, "data", "processed"),
        os.path.join(base_dir, "database"),
        os.path.join(base_dir, "src"),
    ]

    print("\n[1/3] Creating directory structure...")
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"  [CREATED] {os.path.relpath(directory, base_dir)}")
        else:
            print(f"  [EXISTS]  {os.path.relpath(directory, base_dir)}")

    # Create empty __init__.py inside src
    init_py_path = os.path.join(base_dir, "src", "__init__.py")
    if not os.path.exists(init_py_path):
        with open(init_py_path, "w", encoding="utf-8") as f:
            f.write("# Initialize src package\n")
        print("  [CREATED] src/__init__.py")

    # Create requirements.txt
    print("\n[2/3] Generating requirements.txt...")
    requirements_path = os.path.join(base_dir, "requirements.txt")
    requirements_content = """pandas>=2.0.0
requests>=2.31.0
python-dotenv>=1.0.1
"""
    with open(requirements_path, "w", encoding="utf-8") as f:
        f.write(requirements_content.strip() + "\n")
    print("  [CREATED] requirements.txt")

    # Create README.md with download checklist
    print("\n[3/3] Generating README.md with download checklist...")
    readme_path = os.path.join(base_dir, "README.md")
    readme_content = """# BeastMode Workout Generator (Python & SQLite)

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
"""
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content.strip() + "\n")
    print("  [CREATED] README.md")

    print("\n=========================================")
    print(" Setup Completed Successfully!           ")
    print(" Place your raw files in: data/raw/      ")
    print("=========================================")

if __name__ == "__main__":
    setup_project()
