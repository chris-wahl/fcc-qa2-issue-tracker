/* 2021 Christopher Wahl */
'use strict';
const Issue = require('../model');
const ObjectId = require('mongodb').ObjectId

module.exports = function (app) {

    app.route('/api/issues/:project')

        .get(async function (req, res) {
            const {project} = req.params;
            const {open} = req.query;
            let searchDict = {project};

            Object.keys(req.query).filter(k => k !== 'open').forEach(
                k => searchDict[k] = req.query[k]
            );

            if (!!open) {
                searchDict.open = open === 'true';
            }


            const query = Issue.find(searchDict).sort({created_on: 1}).select({project: 0, __v: 0});


            return res.json(await query);
        })
        .post(async function (req, res) {
            const project = req.params.project;
            const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
            if (!issue_title || !issue_text || !created_by) {
                return res.json({
                    error: 'required field(s) missing'
                });
            }

            const issue = new Issue({
                project,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            });
            await issue.save();
            // Don't want to return these details.
            issue.project = issue.__v = undefined;
            return res.json(issue);
        })
        .put(async function (req, res) {
            const project = req.params.project;
            const {_id} = req.body;
            if (!_id) {
                return res.json({
                    error: 'missing _id'
                })
            }
            if (Object.keys(req.body).length < 2) {
                return res.json({
                    error: 'no update field(s) sent',
                    _id,
                });
            }

            const updateDict = Object.assign({
                    open: req.body.open !== 'false'
                },
                ...Object.keys(req.body).filter(k => k !== '_id' && k !== 'open')
                    .map((k, _) => ({[k]: req.body[k]})),
            );

            const output = {_id, result: 'successfully updated', error: 'could not update'};

            try {
                if (await Issue.findOneAndUpdate({
                    _id: ObjectId(_id),
                    project
                }, updateDict) !== null) {
                    output.error = undefined;
                } else {
                    output.result = undefined;
                }
            } catch (e) {
                output.result = undefined;
            } finally {
                res.json(output);
            }
        })
        .delete(async function (req, res) {
            const project = req.params.project;
            const {_id} = req.body;
            if (!_id) {
                return res.json({
                    error: 'missing _id'
                });
            }
            const output = {_id, result: 'successfully deleted', error: 'could not delete'};
            try {
                if (await Issue.findOneAndDelete({
                    _id: ObjectId(_id),
                    project
                }) !== null) {
                    output.error = undefined;
                } else {
                    output.result = undefined;
                }

            } catch (e) {
                output.result = undefined;
            } finally {
                res.json(output);
            }
        });

};
