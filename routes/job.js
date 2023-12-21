const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fetchUser = require("../middleware/fetchUser");
const getUserId = require("../getUserId");
const Job = require("../models/job");
const fetchJob = require("../middleware/fetchJob");

router.use(fetchUser);

// get job information or get job list
router.get("/job/:query", async (req, res) => {
  try {
    res.send(req.params.query);
  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: e.message || "Internal server error" });
  }
});

// new job
router.post("/job",
  body("jobName", "Enter valid job name").isLength({ min: 1 }),
  body("jobLocation", "Enter valid job location").isLength({ min: 1 }),
  body("jobDescription", "Enter valid job description").isLength({ min: 1 }),
  body("companyName", "Enter valid company name").isLength({ min: 1 }),
  body("jobPackage", "Enter valid job package").isInt(),
  body("jobType", "Enter valid job type").isLength({ min: 1 }),
  body("jobPost", "Enter valid job post").isLength({ min: 1 }),
  async (req, res) => {
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = await getUserId(req.header("token"));

      const { jobName, jobLocation, jobDescription, companyName, jobPackage, jobType, jobPost } = req.body;

      const newJob = await Job({
        user: userId,
        jobName: jobName,
        jobLocation: jobLocation,
        jobDescription: jobDescription,
        companyName: companyName,
        jobPackage: jobPackage,
        jobType: jobType,
        jobPost: jobPost,
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
      res.status(500).json({ message: e.message || "Internal server error" });
    }
  });

router.use(fetchJob);

// update the job information
router.put("/job", async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, jobName, jobLocation, jobDescription, companyName, jobPackage, jobType, jobPost } = req.body;

    const userId = await getUserId(req.header("token"));

    const filter = { _id: jobId, user: userId };

    const update = {
      jobName: jobName || undefined,
      jobLocation: jobLocation || undefined,
      jobDescription: jobDescription || undefined,
      companyName: companyName || undefined,
      jobPackage: jobPackage || undefined,
      jobType: jobType || undefined,
      jobPost: jobPost || undefined,
    };

    const updateJob = await Job.updateOne(filter, update);

    if (updateJob.modifiedCount == 1) {
      res.status(200).json({ message: "Job updated successfully" });
    }
    else {
      res.status(400).json({ message: "Problem while updating job" })
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: e.message || "Internal server error" });
  }
});

// delete the job
router.delete("/job", async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = await getUserId(req.header("token"));

    const { jobId } = req.body;

    const filter = { _id: jobId, user: userId };

    const deleteJob = await Job.findOneAndDelete(filter);

    if (deleteJob._id) {
      res.status(200).json({ message: "Successfully deleted" });
    }
    else {
      res.status(400).json({ message: "Problem while deleting job" });
    }

  } catch (e) {
    console.log("Error:", e);
    res.status(500).json({ message: e.message || "Internal server error" });
  }
});

module.exports = router;
