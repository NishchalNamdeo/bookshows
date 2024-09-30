const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/admin-middlewares");
const { createMovie, testing, allMovies, getMovieDetails, showComingSoonPage, showShowtimesPage, releaseMovie } = require("../controllers/movieControllers");
const upload = require("../config/multer-config");



// Route to update movie release status (PATCH)
router.patch('/movie/:id/release', authMiddleware, releaseMovie);// Existing routes
router.get("/", authMiddleware, function (req, res, next) {
  res.send("heelo movie");
});

router.get("/testing", authMiddleware, testing);
router.get("/allmovies", authMiddleware, allMovies);
router.get("/one/:movieid", authMiddleware, getMovieDetails);
router.post(
  "/create",
  upload.fields([
    { name: "poster", maxCount: 1 }, // Single poster upload
    { name: "video", maxCount: 1 }, // Single video upload
  ]),
  authMiddleware,
  createMovie
);

module.exports = router;
