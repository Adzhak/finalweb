const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name_en: {
        type: String,
        required: true
    },
    name_ru: {
        type: String,
        required: true
    },
    description_en: {
        type: String,
        required: true
    },
    description_ru: {
        type: String,
        required: true
    },

        picture1: {
            type: String,
            required: true
        },
        picture2:{
            type: String,
            required: true
        },
        picture3:{
            type: String,
            required: true
        }

    
    ,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
