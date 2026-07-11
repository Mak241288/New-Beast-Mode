import { Router } from 'express';
import {
  generatePlan,
  getActivePlan,
  updateExercise,
  deleteExercise,
  addCustomExercise,
  logProgress,
  createManualPlan,
  updateDayWorkout,
  upgradePlan,
  importBulkPlan,
  getPlanHistory,
  activateHistoricalPlan,
  getLibraryTree
} from '../controllers/workoutController';
import { protect } from '../middleware/auth';

const router = Router();

// Apply protection to all workout routes
router.use(protect as any);

router.post('/generate', generatePlan);
router.post('/manual', createManualPlan);
router.post('/import-bulk', importBulkPlan);
router.get('/history', getPlanHistory);
router.post('/:id/activate', activateHistoricalPlan);
router.get('/library-tree', getLibraryTree);
router.get('/active', getActivePlan);
router.post('/upgrade', upgradePlan);

router.put('/day/:dayId', updateDayWorkout);
router.post('/day/:dayId/exercise', addCustomExercise);

router.put('/exercise/:id', updateExercise);
router.delete('/exercise/:id', deleteExercise);
router.post('/exercise/:id/log', logProgress);

export default router;
