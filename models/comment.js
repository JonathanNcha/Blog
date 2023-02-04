const mongoose = require('mongoose');
const { marked } = require('marked')
const slugify = require('slugify');
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const { hash } = require('bcrypt');
const dompurify = createDomPurify(new JSDOM().window);


const commentSchema = new mongoose.Schema({
    // articleId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Article',
        
    // },
    slug: {
        type: mongoose.Schema.Types.String,
        ref: 'Article',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', commentSchema);

