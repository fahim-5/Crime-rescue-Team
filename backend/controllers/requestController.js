const RequestModel = require("../models/requestModel");

const requestController = {
  getAllPoliceRequests: async (req, res) => {
    try {
      const requests = await RequestModel.getAllPoliceRequests();
      res.status(200).json(requests);
    } catch (error) {
      console.error('Error in getAllPoliceRequests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve police requests',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getPoliceRequestByPoliceId: async (req, res) => {
    try {
      const { policeId } = req.params;
      
      if (!policeId) {
        return res.status(400).json({
          success: false,
          message: "Missing police ID parameter"
        });
      }

      const request = await RequestModel.getPoliceRequestByPoliceId(policeId);
      
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Police request not found for the given police ID"
        });
      }

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      console.error("Error fetching police request by police ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch police request",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  approvePoliceRequest: async (req, res) => {
    try {
      const { policeId } = req.params;
      
      if (!policeId) {
        return res.status(400).json({
          success: false,
          message: "Missing police ID parameter"
        });
      }

      await RequestModel.approvePoliceRequest(policeId);
      
      res.status(200).json({
        success: true,
        message: "Police request approved successfully"
      });
    } catch (error) {
      console.error("Error approving police request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve police request",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  rejectPoliceRequest: async (req, res) => {
    try {
      const { policeId } = req.params;
      
      if (!policeId) {
        return res.status(400).json({
          success: false,
          message: "Missing police ID parameter"
        });
      }

      await RequestModel.rejectPoliceRequest(policeId);
      
      res.status(200).json({
        success: true,
        message: "Police request rejected and removed successfully"
      });
    } catch (error) {
      console.error("Error rejecting police request:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject police request",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = requestController;