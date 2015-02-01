module.exports = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;
	var bcrypt = require('bcrypt');
	var salt_factor = 10;

	var UserSchema = new Schema({
		name: { type: String, required: true},
		username: { type: String, required: true, index: { unique: true }},
		email: { type: String, required: true, index: { unique: true }},
		password: { type: String, required: true}
	});

	UserSchema.pre('save', function(next) {
		var user = this;
		if(!user.isModified('password')) return next();
		bcrypt.genSalt(salt_factor, function(err, salt) {
			if(err) return next(err);
			bcrypt.hash(user.password, salt, function(err, hash) {
				if(err) return next(err);
				user.password = hash;
				next();
			});
		})
	})

	return mongoose.model('User', UserSchema);
}