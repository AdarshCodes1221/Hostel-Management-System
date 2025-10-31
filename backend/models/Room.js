const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
    trim: true
  },
  floor: {
    type: Number,
    min: 0
  },
  type: {
    type: String,
    required: [true, 'Please add a room type'],
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Dormitory']
  },
  capacity: {
    type: Number,
    required: [true, 'Please add room capacity'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'Please add room price'],
    min: 0
  },
  amenities: {
    type: [String],
    default: []
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

RoomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', RoomSchema);