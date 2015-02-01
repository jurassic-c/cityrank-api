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
	User.findOne({username: req.body.username}, function(err, user) {
		if(err) return next(err);
		if(user) {
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
			res.status(401).json({error: "Username or Password incorrect"});	
		}
	});
});

module.exports = router;
