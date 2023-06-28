const express = require("express");
const router = express.Router();
const {
  getMindmapDetails,
  addUpdateLicenceKey,
  getMindmapKeys,
  addUpdateMindMap,
  deleteMindmapKey,
  downloadMindmaps,
} = require("../controllers/mindmap.controller");

router.post("/mindmap/upload", addUpdateMindMap);
router.get("/mindmap", getMindmapKeys);
// router.post('/mindmap/image'
router.post("/mindmap/addUpdatekey", addUpdateLicenceKey);
router.get("/mindmap/details/:key", getMindmapDetails);
router.post("/mindmap/delete/:key", deleteMindmapKey);
router.get("/mindmap/download", downloadMindmaps);
// router.put('/mindmap/:key/:imagename', (req, res) => {

router.use("/mindmap", require("./notification.route"));
router.use("/messages", require("./message.route"));
router.use("/appointment", require("./appointment.route"));
router.use("/support", require("./support.route"));

module.exports = router;
