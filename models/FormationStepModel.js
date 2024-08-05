const mongoose = require('mongoose');

const FormationStepSchema = new mongoose.Schema({
    formationId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String
    },
    imagePath: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    edited_at: Date,
    created_at: Date,
})

const formationStep = mongoose.model('formationSteps', FormationStepSchema);
module.exports = formationStep;
