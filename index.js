// TODO: Include packages needed for this application
const markdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquire = require('inquirer');
const repoName = require('git-repo-name');

// TODO: Create an array of questions for user input
const questions = [
    
];

// TODO: Create a function to write README file
function writeToFile(fileName, data) {}

// TODO: Create a function to initialize app
function init() {

    inquirer.prompt(questions)
    .then((answers) => {
        let { name, location, bio, linkedin, github} = answers;
    })
    .then((err) => {
        (err) ? console.error(err) : console.log('Successfully ran program');
    })

}

// Function call to initialize app
init();
