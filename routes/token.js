var express = require('express');
var router = express.Router();
var ex_jwt = require('express-jwt');
var jwt = require('jwt-simple');
var UserModule = require('../models/user');
var bcrypt = require('bcrypt');
var config = require('../config');

/* GET users listing. */
router.post('/', function(req, res) {
	var User = req.mongoose.models.User;
	console.log(req.mongoose.models);

	var search_params = null;
	var phone_or_email = req.body.phone_or_email;
	var email_pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
	if(email_pattern.test(phone_or_email))
		search_params = {email: phone_or_email};
	phone_or_email = req.body.phone_or_email.replace(/[\s\(\)-\.]+/g, '')
	var phone_pattern = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
	if(phone_pattern.test(phone_or_email))
		search_params = {phone: phone_or_email};

	if(search_params != null) {
		User.findOne(search_params, function(err, user) {
			if(err) return next(err);
			if(user) {
				console.log("USER FOUND!");
				bcrypt.compare(req.body.password, user.password, function(err, valid) {
					if(err) return next(err);
					console.log("VALID: " + valid);
					if(valid) {
						var payload = {user_id: user._id, username: user.username};
						var token = jwt.encode(payload, config.jwt_key);
						res.status(200).json({user: user, token: token});
					} else {
						res.status(401).json({error: "Username or Password incorrect"});
					}
				});
			} else {
				console.log("USER NOT FOUND!");
				res.status(401).json({error: "Username or Password incorrect"});
			}
		});
	} else {
		res.status(401).json({error: "Username and Password required"});
	}
});

module.exports = router;
