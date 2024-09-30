const { Theater,  validateTheater} = require('../models/theater-model');

// Create a new Theater
const createTheater = async (req, res) => {
    const { name, location, seats, seatPrices, movies, showtimes } = req.body;
    
    // Validate the incoming request data using Joi validation
    const  error  = validateTheater({
        name,
        location,
        seats,
        seatPrices,
        movies,
        showtimes
    });
    
    if (error) return res.status(400).send(error.details[0].message); // Return 400 if validation fails
    
    try {
        // Check if a theater with the same name already exists
        const existingTheater = await Theater.findOne({ name });
        if (existingTheater) {
            return res.status(409).json({ msg: "Theater already exists" }); // Conflict (409) status
        }

        // Create a new Theater instance
        const theater = new Theater({
            name,
            location,
            seats,
            seatPrices,
            movies,
            showtimes
        });

        await theater.save();

        // Send the saved theater object in the response
        res.status(201).json(theater);
    } catch (err) {
        // Handle server or database errors
        res.status(500).send("Error creating the theater: " + err.message);
    }
};

// Get all Theaters with pagination
const getTheaters = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Get pagination parameters

    try {
        const theaters = await Theater.find()
            .populate('movies', 'title') // Populate movie titles
            .skip((page - 1) * limit)
            .limit(Number(limit));

        if (theaters.length === 0) return res.status(404).send('No theaters found');
        res.status(200).json(theaters);
    } catch (err) {
        res.status(500).send("Error fetching theaters: " + err.message);
    }
};

// Get Theater by ID
const getTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id).populate('movies', 'title');
        if (!theater) return res.status(404).send('Theater with the given ID not found');
        res.status(200).json(theater);
    } catch (err) {
        res.status(500).send("Error fetching theater: " + err.message);
    }
};

// Update Theater by ID
const updateTheater = async (req, res) => {
    const { name, location, seats, seatPrices, movies, showtimes } = req.body;

    // Validate request data using Joi schema
    const { error } = validateTheater({
        name,
        location,
        seats,
        seatPrices,
        movies,
        showtimes
    });

    if (error) return res.status(400).send(error.details[0].message);

    try {
        const theater = await Theater.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!theater) return res.status(404).send('Theater with the given ID not found');
        res.status(200).json(theater);
    } catch (err) {
        res.status(500).send("Error updating theater: " + err.message);
    }
};

// Soft Delete Theater by ID
const deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!theater) return res.status(404).send('Theater with the given ID not found');
        res.status(200).send('Theater marked as deleted successfully');
    } catch (err) {
        res.status(500).send("Error deleting theater: " + err.message);
    }
};

// Get Theaters by Location with pagination
const getTheatersByLocation = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const location = req.params.location;
    if (!location || typeof location !== 'string') {
        return res.status(400).send('Invalid location parameter.');
    }

    try {
        const theaters = await Theater.find({ location })
            .populate('movies', 'title')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        if (theaters.length === 0) return res.status(404).send('No theaters found in the given location');
        res.status(200).json(theaters);
    } catch (err) {
        res.status(500).send("Error fetching theaters by location: " + err.message);
    }
};
const testTheaters = async (req, res) => {
    res.send("hellooo");
};
// Search Movies by Title
// const searchMoviesByTitle = async (req, res) => {
//     const { title } = req.query;

//     if (!title || typeof title !== 'string') {
//         return res.status(400).send('Invalid or missing title parameter.');
//     }

//     try {
//         // Search for theaters that are playing the specified movie
//         const theaters = await Theater.find({ 'movies.title': { $regex: title, $options: 'i' } })
//             .populate('movies', 'title'); // Populate the movie titles

//         if (theaters.length === 0) {
//             return res.status(404).send('No theaters found for the specified movie title.');
//         }

//         res.status(200).json(theaters);
//     } catch (err) {
//         res.status(500).send("Error searching for movie: " + err.message);
//     }
// };

module.exports = {
    createTheater,
    getTheaters,
    getTheater,
    updateTheater,
    deleteTheater,
    getTheatersByLocation,
    testTheaters,
    // searchMoviesByTitle,
    
};
