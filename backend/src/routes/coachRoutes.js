const express = require('express');
const router = express.Router();
const {
  getCoaches,
  getCoachById,
  authorizeAthlete,
  getCoachAthleteAssessments
} = require('../controllers/coachController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getCoaches);
router.get('/:id', getCoachById);
router.post('/:coachId/authorize-athlete', protect, authorizeAthlete);
router.get('/:coachId/athletes/:athleteId/assessments', protect, getCoachAthleteAssessments);

module.exports = router;
