'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "likes", deps: []
 * createTable "methods", deps: []
 * createTable "moderationReports", deps: []
 * createTable "results", deps: []
 * createTable "submissionMethodRefs", deps: []
 * createTable "submissions", deps: []
 * createTable "submissionTagRefs", deps: []
 * createTable "submissionTaskRefs", deps: []
 * createTable "tags", deps: []
 * createTable "tasks", deps: []
 * createTable "users", deps: []
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2022-02-09T14:47:36.138Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "likes",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "methods",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "moderationReports",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "results",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "submissionMethodRefs",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "submissions",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "submissionTagRefs",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "submissionTaskRefs",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "tags",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "tasks",
            {

            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "users",
            {

            },
            {}
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
