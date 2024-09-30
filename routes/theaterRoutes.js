const express = require('express');
const router = express.Router();
const { createTheater, getTheaters, getTheater, updateTheater, deleteTheater, getTheatersByLocation, testTheaters, searchMoviesByTitle} = require('../controllers/theaterControllers');
const {authMiddleware} = require("../middlewares/admin-middlewares")



router.post('/create',authMiddleware, createTheater);
router.get('/get',authMiddleware, getTheaters);
router.get('/', testTheaters);
router.get('/get/:id',authMiddleware, getTheater);
router.put('/update/:id',authMiddleware, updateTheater);
router.delete('/delete/:id',authMiddleware, deleteTheater);
router.get('/location/:location',authMiddleware, getTheatersByLocation);
// router.get('/search/movies', searchMoviesByTitle);

module.exports = router;






module.exports = router


