const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');

module.exports.registerUser = async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ error: 'Email already exists' });
        }

        // Validate inputs
        if (!req.body.email.includes("@")) {
            return res.status(400).send({ error: 'Email invalid' });
        } else if (req.body.mobileNo.length !== 11) {
            return res.status(400).send({ error: 'Mobile number invalid' });
        } else if (req.body.password.length < 8) {
            return res.status(400).send({ error: 'Password must be at least 8 characters' });
        }

        // Create a new user
        let newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            mobileNo: req.body.mobileNo
        });

        // Save the new user
        const savedUser = await newUser.save();
        res.status(201).send({ message: 'Registered Successfully' });
    } catch (error) {
        console.error('Error in saving the user: ', error);
        res.status(500).send({ error: 'Error in Save' });
    }
};

module.exports.loginUser = (req, res) => {

	if(req.body.email.includes('@')) {
		
		return User.findOne({ email: req.body.email }).then(user => {

			if(user == null) {

				return res.status(401).send({ error: 'No Email Found'});

			} else {

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

				if(isPasswordCorrect) {

					return res.status(200).send({ access: auth.createAccessToken(user)})

				} else {

					return res.status(401).send({ error: 'Email and password do not match'});
				}
			}
		}).catch(findErr => {

			console.error('Error in finding the user: ', findErr);

			return res.status(500).send({ error: 'Error in find' });
		})

	} else {

		return res.status(400).send({ error: 'Invalid in email'});
	}
}


module.exports.userDetails = (req, res) => {

	return User.findById(req.user.id).then(user => {

		if(!user) {
			return res.status(404).send('User not found');
		}
		user.password = "";
		return res.status(200).send({ user });

	}).catch(findErr => {

		console.error('Error in finding the user: ', findErr);	

		return res.status(500).send({error: 'Failed to fetch user profile'});
	})
};

