const mongoose = require('mongoose');
const Coach = require('../models/Coach');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

/**
 * @desc    Get all coaches with optional search & specialty filters
 * @route   GET /api/coaches
 * @access  Public
 */
exports.getCoaches = async (req, res) => {
  try {
    const { search, specialty, verified } = req.query;
    const filter = { availableForConsultation: true };

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    if (specialty && specialty !== 'All') {
      filter.specialties = { $in: [new RegExp(specialty, 'i')] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const coaches = await Coach.find(filter).sort({ rating: -1, reviewsCount: -1 });

    return res.status(200).json({
      success: true,
      count: coaches.length,
      data: coaches
    });
  } catch (error) {
    console.error('[Get Coaches Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving coaches'
    });
  }
};

/**
 * @desc    Get coach profile by ID
 * @route   GET /api/coaches/:id
 * @access  Public
 */
exports.getCoachById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found (invalid ID format)'
      });
    }

    const coach = await Coach.findById(id);

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: coach
    });
  } catch (error) {
    console.error('[Get Coach By ID Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving coach profile'
    });
  }
};

/**
 * @desc    Authorize an athlete for coach access
 * @route   POST /api/coaches/:coachId/authorize-athlete
 * @access  Private (Athlete or Admin)
 */
exports.authorizeAthlete = async (req, res) => {
  try {
    const { coachId } = req.params;
    const { athleteId } = req.body;

    const targetAthleteId = athleteId || req.user._id;

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    const athlete = await User.findById(targetAthleteId);
    if (!athlete) {
      return res.status(404).json({
        success: false,
        message: 'Athlete not found'
      });
    }

    // Add to assignedAthletes if not already present
    if (!coach.assignedAthletes.some((id) => id.equals(targetAthleteId))) {
      coach.assignedAthletes.push(targetAthleteId);
      await coach.save();
    }

    return res.status(200).json({
      success: true,
      message: `Athlete '${athlete.name}' successfully authorized for Coach '${coach.name}'`,
      coach
    });
  } catch (error) {
    console.error('[Authorize Athlete Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error authorizing athlete'
    });
  }
};

/**
 * @desc    Get authorized athlete's assessments (Restricted to authorized coach)
 * @route   GET /api/coaches/:coachId/athletes/:athleteId/assessments
 * @access  Private (Authorized Coach)
 */
exports.getCoachAthleteAssessments = async (req, res) => {
  try {
    const { coachId, athleteId } = req.params;

    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: 'Coach not found'
      });
    }

    // Check authorization: requesting user must be the coach (or admin)
    const isOwnerCoach = req.user && req.user._id.equals(coach.userId);
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwnerCoach && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You are not the assigned coach for this portal.'
      });
    }

    // Check if athlete is in coach's assigned list
    const isAssigned = coach.assignedAthletes.some((id) => id.toString() === athleteId.toString());

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. This athlete has not granted access to their biomechanical records.'
      });
    }

    const assessments = await Assessment.find({ athleteId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('[Get Coach Athlete Assessments Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving athlete assessments'
    });
  }
};
