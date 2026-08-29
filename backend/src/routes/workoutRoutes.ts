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
  importFilePlan,
  getPlanHistory,
  activateHistoricalPlan,
  renamePlan,
  duplicatePlan,
  deletePlan,
  getLibraryTree,
  getAlternatives,
  swapExerciseAI,
  analyzePhysiquePhoto
} from '../controllers/workoutController';
import { protect } from '../middleware/auth';

const router = Router();

// Apply protection to all workout routes
router.use(protect as any);

router.post('/analyze-physique', analyzePhysiquePhoto);

router.post('/generate', generatePlan);
router.post('/manual', createManualPlan);
router.post('/import-bulk', importBulkPlan);
router.post('/import-file', importFilePlan);
router.get('/history', getPlanHistory);
router.post('/:id/activate', activateHistoricalPlan);
router.put('/plan/:id/rename', renamePlan);
router.post('/plan/:id/duplicate', duplicatePlan);
router.delete('/plan/:id', deletePlan);
router.get('/library-tree', getLibraryTree);
router.get('/active', getActivePlan);
router.post('/upgrade', upgradePlan);

router.put('/day/:dayId', updateDayWorkout);
router.post('/day/:dayId/exercise', addCustomExercise);

router.put('/exercise/:id', updateExercise);
router.delete('/exercise/:id', deleteExercise);
router.post('/exercise/:id/log', logProgress);
router.post('/log', logProgress);
router.get('/exercise/:id/alternatives', getAlternatives);
router.post('/exercise/:id/swap-ai', swapExerciseAI);

export default router;
