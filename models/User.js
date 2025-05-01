const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    notes: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }
    ]
})

// Clean up
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        delete ret.password 
        return ret
    }
})

module.exports = mongoose.model('User', userSchema)