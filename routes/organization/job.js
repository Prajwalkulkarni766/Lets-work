const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const JobAdvertisement = require("../../models/organization/JobAdvertisement");
const Organization = require("../../models/organization/organization");
const fetchJobAdvertisement = require("../../middleware/organization/fetchJobAdvertisement");
const getOrganizationId = require("../../utils/getOrganizationId");
const fetchOrganization = require("../../middleware/organization/fetchOrganization");

router.use(fetchOrganization);

// get job advertisement information
router.get("/job/:id", async (req, res) => {
  try {

    const jobAdvertisementId = req.params.id;

    const findJobAdvertisement = await JobAdvertisement.findById(jobAdvertisementId);

    if (findJobAdvertisement) {
      res.status(200).json(findJobAdvertisement);
    }
    else {
      res.status(400).json({ message: "Job advertisement not found" });
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// new job advertisement
router.post("/job",
  body("jobTitle", "Enter valid job name").notEmpty(),
  body("jobDescription", "Enter valid job description").notEmpty(),
  body("jobRequirements", "Enter valid job requirements").notEmpty(),
  body("jobSalary", "Enter valid job salary").isInt(),
  body("jobLocation", "Enter valid job location").notEmpty(),
  body("jobType", "Enter valid job type").notEmpty(),
  async (req, res) => {
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const organizationId = await getOrganizationId(req.header("token"));

      const organizationName = await Organization.findById(organizationId).select("name");

      const { jobTitle, jobDescription, jobRequirements, jobSalary, jobLocation, jobType } = req.body;

      const newJob = await JobAdvertisement({
        organization: organizationId,
        organizationName: organizationName.name,
        title: jobTitle,
        description: jobDescription,
        requirements: jobRequirements,
        salary: jobSalary,
        location: jobLocation,
        type: jobType,
        isDisabled: false,
      });

      await newJob.save();

      if (newJob._id) {
        res.status(200).json({ message: "Job saved", id: newJob._id });
      }
      else {
        res.status(400).json({ message: "Problem while saving job" });
      }

    } catch (e) {
      console.log("Error:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  });

router.use(fetchJobAdvertisement);

// update the job advertisement
router.put("/job", async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const organizationId = await getOrganizationId(req.header("token"));

    const { jobAdvertisementId, jobTitle, jobDescription, jobRequirements, jobSalary, jobLocation, jobType } = req.body;


    const filter = { _id: jobAdvertisementId, organization: organizationId };

    const update = {
      title: jobTitle || undefined,
      description: jobDescription || undefined,
      requirements: jobRequirements || undefined,
      salary: jobSalary || undefined,
      jobLocation: jobLocation || undefined,
      jobType: jobType || undefined,
    };

    const updateJob = await JobAdvertisement.updateOne(filter, update);

    if (updateJob.modifiedCount == 1) {
      res.status(200).json({ message: "Job updated successfully" });
    }
    else {
      res.status(400).json({ message: "Problem while updating job" })
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// to disable active job advertisement
router.put("/jobDisabled", async (req, res) => {
  try {

    const organizationId = await getOrganizationId(req.header("token"));

    const { jobAdvertisementId } = req.body;

    const filter = { _id: jobAdvertisementId, organization: organizationId };

    const update = { isDisabled: true };

    const updateJob = await JobAdvertisement.updateOne(filter, update);

    if (updateJob.modifiedCount == 1) {
      res.status(200).json({ message: "Successfully disabled job advertisement" });
    }
    else {
      res.status(400).json({ message: "Problem while disabling job advertisement or already disabled job advertisement" });
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete the job advertisement
router.delete("/job", async (req, res) => {
  try {

    const organizationId = await getOrganizationId(req.header("token"));

    const { jobAdvertisementId } = req.body;

    const filter = { _id: jobAdvertisementId, organization: organizationId };

    const deleteJob = await JobAdvertisement.findOneAndDelete(filter);

    if (deleteJob._id) {
      res.status(200).json({ message: "Successfully deleted" });
    }
    else {
      res.status(400).json({ message: "Problem while deleting job" });
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
