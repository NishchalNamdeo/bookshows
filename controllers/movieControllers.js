const { movieModel, movievalidation } = require("../models/movie-models")

// Controller to create a new movie
module.exports.createMovie = async function (req, res, next) {
  try {
    const {
      title,
      genre,
      duration,
      releaseDate,
      description,
      comingsoon,
      isReleased,
    } = req.body // Added comingsoon and isReleased
    let poster, posterMimeType, video, videoMimeType

    // Handle file uploads
    if (req.files) {
      if (req.files.poster && req.files.poster.length > 0) {
        poster = req.files.poster[0].buffer
        posterMimeType = req.files.poster[0].mimetype
      }

      if (req.files.video && req.files.video.length > 0) {
        video = req.files.video[0].buffer
        videoMimeType = req.files.video[0].mimetype
      }
    }

    // Validate movie input using Joi validation
    const error = movievalidation({
      title,
      genre,
      duration,
      releaseDate,
      description,
      poster,
      video,
    })
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    // Check if the movie already exists (by title and description)
    const existMovie = await movieModel.findOne({ title, description })
    if (existMovie) {
      return res.status(400).json({ message: "Movie already exists" })
    }

    // Check if the provided theaters exist in the database

    // Set comingsoon and isReleased based on releaseDate
    let isComingSoon = comingsoon !== undefined ? comingsoon : true
    let movieReleased = isReleased !== undefined ? isReleased : false

    // Create a new movie entry
    const newMovie = await movieModel.create({
      title,
      genre,
      duration,
      releaseDate,
      description,
      poster,
      posterMimeType,
      video,
      videoMimeType,
      comingsoon: isComingSoon,
      isReleased: movieReleased,
    })

    res
      .status(201)
      .json({ message: "Movie created successfully!", movie: newMovie })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message })
  }
}

// Controller to get movie details and redirect based on release status
module.exports.getMovieDetails = async function (req, res, next) {
  try {
    const movie = await movieModel.findById(req.params.id)
    if (!movie) return res.status(404).send("Movie not found")

    if (movie.isReleased) {
      res.redirect(`/movie/${movie._id}/showtimes`)
    } else {
      res.redirect(`/movie/${movie._id}/coming-soon`)
    }
  } catch (error) {
    next(error.message)
  }
}

module.exports.releaseMovie = async function (req, res, next) {
  try {
    // Find the movie by its ID
    const movie = await movieModel.findById(req.params.id)
    if (!movie) {
      return res.status(404).send("Movie not found")
    }

    // Check if the movie is already released
    if (movie.isReleased) {
      return res.status(400).send("Movie is already released")
    }

    // Update movie properties to reflect its release
    movie.isReleased = true // Mark movie as released
    movie.comingsoon = false // Mark coming soon as false
    movie.releaseDate = new Date() // Set release date to current date

    // Save the updated movie document
    await movie.save()

    // Respond with a success message and the updated movie status
    res.status(200).json({
      message: `Movie '${movie.title}' has been successfully released!`,
      comingsoon: false,
      isReleased: "Released", // Format response as "Released"
      releaseDate: movie.releaseDate,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send("Internal server error")
  }
}

module.exports.testing = function (req, res, next) {
  res.render("test")
}

module.exports.allMovies = async function (req, res, next) {
  try {
    const allMovies = await movieModel.find()
    res.status(200).json({ movies: allMovies })
  } catch (error) {
    next(error.message)
  }
}
