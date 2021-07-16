'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env['DB'], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const issueSchema = new mongoose.Schema({
        project: {
            type: String,
            required: true
        },
        issue_title: {
            type: String,
            required: true
        },
        issue_text: {
            type: String,
            required: true
        },
        created_by: {
            type: String,
            required: true
        },
        assigned_to: {
            type: String,
            default: ''
        },
        status_text: {
            type: String,
            default: ''
        },
        open: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {
            createdAt: 'created_on',
            updatedAt: 'updated_on'
        }
    }
);
const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
