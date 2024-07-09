const mongoose = require('mongoose');
const Movie = require("../models/Movie");


module.exports.addMovie = (req, res) => {
    let newMovie = new Movie({
        title: req.body.title,
        director: req.body.director,
        year: req.body.year,
        description: req.body.description,
        genre: req.body.genre
    });

    newMovie.save()
        .then(savedMovie => res.status(201).send(savedMovie))
        .catch(saveErr => {
            console.error("Error in adding the movie: ", saveErr);
            return res.status(500).send({ error: 'Failed to save the movie' });
        });
};

module.exports.getMovies = (req, res) => {
    Movie.find()
        .then(movies => {
            if (movies.length > 0) {
                return res.status(200).json({ movies });
            } else {
                return res.status(200).json({ message: 'No movies found.' });
            }
        })
        .catch(err => res.status(500).json({ error: 'Error finding movies.' }));
};

module.exports.getMovie = (req, res) => {
    Movie.findById(req.params.id)
        .then(movie => {
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            } else {
                return res.status(200).json({ movie });
            }
        })
        .catch(err => {
            console.error('Error finding movie:', err);
            return res.status(500).json({ error: 'Error finding movie' });
        });
};

module.exports.updateMovie = (req, res) => {
    let movieId = req.params.id;

    let updatedMovie = {
        title: req.body.title,
        director: req.body.director,
        year: req.body.year,
        description: req.body.description,
        genre: req.body.genre
    };

    Movie.findByIdAndUpdate(movieId, updatedMovie, { new: true })
        .then(updatedMovie => {
            if (!updatedMovie) {
                return res.status(404).json({ error: 'Movie not found' });
            } else {
                return res.status(200).json({ message: 'Movie updated successfully', updatedMovie });
            }
        })
        .catch(err => {
            console.error('Error updating movie:', err);
            return res.status(500).json({ error: 'Error updating movie' });
        });
};

module.exports.deleteMovie = (req, res) => {
    let movieId = req.params.id;

    Movie.findByIdAndDelete(movieId)
        .then(deletedMovie => {
            if (!deletedMovie) {
                return res.status(404).json({ error: 'Movie not found' });
            } else {
                return res.status(200).json({ message: 'Movie deleted successfully' });
            }
        })
        .catch(err => {
            console.error('Error deleting movie:', err);
            return res.status(500).json({ error: 'Error deleting movie' });
        });
};


module.exports.addComment = (req, res) => {
    const movieId = req.params.id;
    const userId = req.user.id; 
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).json({ error: 'Comment is required' });
    }

    Movie.findById(movieId)
        .then(movie => {
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }

            const newComment = {
                userId: userId,
                comment: comment,
                _id: new mongoose.Types.ObjectId()
            };
            movie.comments.push(newComment);

            return movie.save();
        })
        .then(updatedMovie => { 
            res.status(200).json({ 
                message: 'Comment added successfully',
                updatedMovie: updatedMovie 
            });
        })
        .catch(err => {
            console.error('Error adding comment:', err);
            res.status(500).json({ error: 'Failed to add comment' });
        });
};

module.exports.getComments = (req, res) => {
    const movieId = req.params.id;

    // Find the movie by ID
    Movie.findById(movieId)
        .then(movie => {
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }

            // Respond with the comments of the movie
            res.status(200).json({
                comments: movie.comments
            });
        })
        .catch(err => {
            console.error('Error fetching comments:', err);
            res.status(500).json({ error: 'Failed to fetch comments' });
        });
};

