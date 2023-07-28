const mongoose = require('mongoose');
const { marked } = require('marked')
const slugify = require('slugify');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { hash } = require('bcrypt');
const dompurify = createDomPurify(new JSDOM().window);

const userSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('User', userSchema);