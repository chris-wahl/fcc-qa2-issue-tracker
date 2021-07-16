const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const testProject = 'test-project-name';
const issue_title = 'Liminivourous';
const issue_text = 'A Frank Exchange of Arms';
const created_by = 'Just some guy, you know?';
const assigned_to = 'Zaphod';
const status_text = 'Well, you know, it doesn\'t work, you see?';

const url = `/api/issues/${testProject}`;
const exisitngIssues = [];

suite('Functional Tests', function () {
    test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
        const NOW = new Date();
        chai
            .request(server)
            .post(url)
            .type('json')
            .send({
                issue_title, issue_text, created_by,
                assigned_to, status_text
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, issue_title);
            assert.equal(res.body.issue_text, issue_text);
            assert.equal(res.body.created_by, created_by);
            assert.equal(res.body.assigned_to, assigned_to);
            assert.equal(res.body.status_text, status_text);
            assert.isTrue(res.body.open);
            assert.isDefined(res.body._id);

            assert.isAtLeast(new Date(res.body.created_on), NOW);
            assert.isAtLeast(new Date(res.body.updated_on), NOW);
            exisitngIssues.push(res.body);
            done();
        });

    });
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
        const NOW = new Date();
        chai
            .request(server)
            .post(url)
            .type('json')
            .send({
                issue_title, issue_text, created_by,
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, issue_title);
            assert.equal(res.body.issue_text, issue_text);
            assert.equal(res.body.created_by, created_by);
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.isTrue(res.body.open);
            assert.isDefined(res.body._id);

            assert.isAtLeast(new Date(res.body.created_on), NOW);
            assert.isAtLeast(new Date(res.body.updated_on), NOW);
            done();
        });
    });
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
        chai
            .request(server)
            .post(url)
            .type('json')
            .send({
                issue_title, issue_text,
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'required field(s) missing'
            });
            done();
        });
    });
    test('View issues on a project: GET request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        chai
            .request(server)
            .get(url)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isAtLeast(res.body.length, exisitngIssues.length);
                done();
            });
    });
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        chai
            .request(server)
            .get(url + `?open=${exisitngIssues[0].open}`)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtLeast(res.body.length, 1);
                done();
            });
    });
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        const newUrl = url + '?open=' + exisitngIssues[0].open.toString() + '&assigned_to=' + encodeURI(exisitngIssues[0].assigned_to);
        chai
            .request(server)
            .get(newUrl)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtLeast(res.body.length, 1);
                done();
            });
    });
    test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        const existingIssue = exisitngIssues[0];
        const updatedTitle = existingIssue.issue_title + 'modification';
        chai
            .request(server)
            .put(url)
            .type('json')
            .send({
                _id: existingIssue._id,
                issue_title: updatedTitle
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                result: 'successfully updated',
                _id: existingIssue._id
            });
            done();
        });
    });
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        const existingIssue = exisitngIssues[0];

        const updatedTitle = existingIssue.issue_title + 'modification';
        const updatedText = existingIssue.issue_text + 'other mod';
        chai
            .request(server)
            .put(url)
            .type('json')
            .send({
                _id: existingIssue._id,
                issue_title: updatedTitle,
                issue_text: updatedText
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                result: 'successfully updated',
                _id: existingIssue._id
            });
            done();
        });
    });
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        const existingIssue = exisitngIssues[0];

        const updatedTitle = existingIssue.issue_title + 'modification';
        chai
            .request(server)
            .put(url)
            .type('json')
            .send({
                issue_title: updatedTitle
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'missing _id'
            });
            done();
        });
    });
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        chai
            .request(server)
            .put(url)
            .type('json')
            .send({
                _id: exisitngIssues[0]._id
            }).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'no update field(s) sent',
                _id: exisitngIssues[0]._id
            });
            done();
        });
    });
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
        chai
            .request(server)
            .put(url)
            .type('json')
            .send({_id: '-1', issue_title}).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'could not update',
                _id: '-1'
            });
            done();
        });
    });
    test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        const existingIssue = exisitngIssues[0];
        chai
            .request(server)
            .delete(url)
            .type('json')
            .send({_id: existingIssue._id}).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                result: 'successfully deleted',
                _id: existingIssue._id
            });
            done();
        });
    });
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
        assert.isAtLeast(exisitngIssues.length, 1);
        chai
            .request(server)
            .delete(url)
            .type('json')
            .send({_id: '100'}).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'could not delete',
                _id: '100'
            });
            done();
        });
    });
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
        chai
            .request(server)
            .delete(url)
            .type('json')
            .send({}).end((err, res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {
                error: 'missing _id',
            });
            done();
        });
    });
});
