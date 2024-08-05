const mongoose = require('mongoose');

const FormationSchema = new mongoose.Schema({
   name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    public: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    edited_at: Date,
    created_at: Date,
})

const formation = mongoose.model('formations', FormationSchema);
module.exports = formation;
