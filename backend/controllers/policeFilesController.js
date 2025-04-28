const PoliceFile = require("../models/policeFileModel");
const asyncHandler = require("express-async-handler");

// @desc    Get police officer by ID
// @route   GET /api/police-files/:id
// @access  Private (Admin/Police)
const getPoliceOfficerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate input
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Police ID is required",
    });
  }

  try {
    // Find officer by police_id
    const officer = await PoliceFile.findOne({ where: { police_id: id } });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Police officer not found",
      });
    }

    // Prepare response data
    const officerData = {
      full_name: officer.full_name,
      police_id: officer.police_id,
      badge_number: officer.badge_number,
      station: officer.station,
      rank: officer.rank,
      joining_date: officer.joining_date,
      status: officer.status,
    };

    // Log the access
    console.log(
      `User ${req.user.id} (${req.user.role}) accessed police file ${id}`
    );

    res.status(200).json({
      success: true,
      data: officerData,
    });
  } catch (error) {
    console.error("Error fetching police officer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = {
  getPoliceOfficerById,
};