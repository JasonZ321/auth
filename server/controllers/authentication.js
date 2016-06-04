const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	// sub stand for subject, it's a jwt convention
	return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
	// User has already had their email and password authenticated
	// we just need give him token
	res.send({ token: tokenForUser(req.user) });
}
exports.singup = function(req, res, next) {
	const email = req.body.email;
	const password = req.body.password;

	if (!email || !password) {
		return res.status(422).send({error: 'You mush provide email and password'});
	}

	User.findOne({ email: email }, function(error, existingUser) {
		if (error) {
			return next(error);
		}

		if (existingUser) {
			return res.status(422).send({error: 'Email is in use'});
		}

		const user = new User({
			email: email,
			password: password
		});

		user.save(function(error) {
			if (error) {
				return next(error);
			}

			res.json({ token: tokenForUser(user) });
		});

	});
}
