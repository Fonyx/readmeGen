// TODO: Include packages needed for this application
const generateMarkdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
var readme;

class Prompt{
    constructor (type, message, name, choices){
        this.type = type;
        this.message = message;
        this.name = name;
        this.choices = choices;
        this.answer = '';
    }

    prompt(){
        inquirer.prompt({
            type: this.type,
            message: this.message,
            name: this.name
        }).then((answer) => {
            this.answer = answer;
        }).catch((err) => {
            console.error(err)
        })
    }
}

class Question{
    constructor(prompt, required, packageValue, originValue, userValue){
        this.prompt = prompt;
        this.required = required;
        this.packageValue = packageValue;
        this.originValue = originValue;
        this.userValue = userValue;
    }

    inquire() {
        inquirer.prompt([
            this.question
        ])
    }
}

class Readme{
    constructor(localRepoPath){
        this.localRepoPath = localRepoPath;
        this.originRepoName;
        this.originOwnerProfile;
        this.gitRepoDetails;
        this.questions = [];
    }

    getGitRepoNameAndProfile(){

        let data = fs.readFileSync(this.localRepoPath+'/.git/config', {encoding:'utf-8', flag:'r'});
        let regex = new RegExp('\turl.*');
        let urlString = regex.exec(data)[0];
        // this returns a string like: 	url = git@github.com:Fonyx/readmeGen.git
    
        let repoDetails = urlString.split(':')[1].split('/');
        // form: [Fonyx, readmeGen.git]
        this.originOwnerProfile = repoDetails[0];
        // strips the .git off the repo name
        this.originRepoName = repoDetails[1].split('.')[0];
    }

    getGitRepoDetails(){
        fetch(`https://api.github.com/repos/${this.originOwnerProfile}/${this.originRepoName}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            this.gitRepoDetails = data
        })
        .catch((err) => {
            console.log(err);
        })
    }    
}


function startNewReadmeProcess() {


    inquirer.prompt([
        {
            type: 'input',
            message: 'local repository path',
            name: 'localRepoPath',
        },
        ])
        .then((answers) => {
            console.log(answers.localRepoPath);
            if(answers.localRepoPath.trim() != ''){
                readme = new Readme(answers.localRepoPath.replace(/\\/g, '/'));
            } else {
                readme = new Readme('C://Users//nicka//Documents//readmeGen');
            }
            readme.getGitRepoNameAndProfile();
            readme.getGitRepoDetails();
        })

}

startNewReadmeProcess();



