const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const noteSchema = new mongoose.Schema({
    noteId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [50, 'Title must be at most 50 characters long']
    },
    text: {
        type: String,
        required: [true, 'Text is required'],
        maxlength: [300, 'Text must be at most 300 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type:  Date,
        default: Date.now
    }
})

noteSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        return ret
    }
})


module.exports = mongoose.model('Note', noteSchema)