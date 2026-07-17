const fs = require('fs');

const newFunc = `

// @desc    Search for exercises in the local database
// @route   GET /api/workout/library/search
export const searchLibraryExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  const queryParam = req.query.q as string;
  
  if (!queryParam || queryParam.trim() === '') {
    res.status(400).json({ error: 'Please provide a search query.' });
    return;
  }

  const searchTerm = \`%\${queryParam.trim()}%\`;

  try {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../../../workout_generator_python/database/exercises.db');

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err: any) => {
      if (err) {
        console.error('[Search] Database connection error:', err);
        res.status(500).json({ error: 'Failed to connect to the exercise database.' });
        return;
      }
    });

    const query = \`
      SELECT id, name_en, name_ar, muscle_en, muscle_ar, equipment_en, equipment_ar, category, image_url, instructions_ar, instructions_en
      FROM exercises
      WHERE name_en LIKE ? OR name_ar LIKE ? OR muscle_en LIKE ? OR muscle_ar LIKE ?
      ORDER BY rating DESC
      LIMIT 20
    \`;

    db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err: any, rows: any[]) => {
      db.close();
      if (err) {
        console.error('[Search] Query error:', err);
        res.status(500).json({ error: 'Failed to search exercises.' });
        return;
      }

      const results = rows.map((row) => ({
        id: row.id,
        name_en: row.name_en,
        name_ar: row.name_ar || row.name_en,
        equipment_en: row.equipment_en || 'None',
        equipment_ar: row.equipment_ar || 'بدون أدوات',
        category: row.category || 'IRON',
        muscle_en: row.muscle_en || 'General',
        muscle_ar: row.muscle_ar || 'عامة',
        image_url: row.image_url,
        instructions_en: row.instructions_en || '',
        instructions_ar: row.instructions_ar || row.instructions_en || '',
      }));

      res.status(200).json(results);
    });
  } catch (error) {
    console.error('[Search] Execution error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during search.' });
  }
};
`;

fs.appendFileSync('backend/src/controllers/workoutController.ts', newFunc);
console.log('Appended to workoutController.ts');
