const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'Please add a first name'],
			trim: true,
			maxlength: [50, 'First name cannot be more than 50 characters']
		},
		lastName: {
			type: String,
			required: [true, 'Please add a last name'],
			trim: true,
			maxlength: [50, 'Last name cannot be more than 50 characters']
		},
		email: {
			type: String,
			required: [true, 'Please add an email'],
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'Please add a valid email'
			]
		},
		prn: {
			type: String,
			required: [true, 'Please add a PRN'],
			unique: true,
			trim: true
		},
		password: {
			type: String,
			required: [true, 'Please add a password'],
			minlength: [6, 'Password must be at least 6 characters'],
			select: false
		},
		role: {
			type: String,
			enum: ['student', 'admin'],
			default: 'student'
		}
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
	const expiresIn = process.env.JWT_EXPIRE || '30d';
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn
	});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
