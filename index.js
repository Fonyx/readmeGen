// TODO: Include packages needed for this application
const markdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquirer = require('inquirer');
const Question = require('./utils/classes');
const fetch = require('node-fetch');



function getOriginDetails(projectRoot){
    console.log('received ',projectRoot,' as an argument')
    let data = fs.readFileSync(projectRoot+'/.git/config', {encoding:'utf-8', flag:'r'});

    let regex = new RegExp('\turl.*');

    let urlString = regex.exec(data)[0];
    // this returns a string like: 	url = git@github.com:Fonyx/readmeGen.git

    let repoDetails = urlString.split(':')[1].split('/');
    // form: [Fonyx, readmeGen.git]
    var username = repoDetails[0];
    // strips the .git off the repo name
    var repoName = repoDetails[1].split('.')[0];
    
    return {'repoName': repoName, 'username': username};
}


function fetchRepoDetails(queryString){
    return fetch(queryString).then(res => res.json())
}

// TODO: Create a function to initialize app
function getRepoFromUser() {


    inquirer.prompt([
        {
            type: 'input',
            message: 'local repository path',
            name: 'localRepoPath',
        },
        ])
        .then((answers) => {
            let userTestFolder = '';
            if(answers.localRepoPath){
                userTestFolder = answers.localRepoPath.replace(/\\/g, '/');
            } else {
                userTestFolder = 'C://Users//nicka//Documents//readmeGen';
            }
            let originDetails = getOriginDetails(userTestFolder);
            console.log(originDetails);

            let repoData = fetchRepoDetails(`https://api.github.com/repos/${originDetails.username}/${originDetails.repoName}`).then(json => json);
            console.log(repoData);
        })

}

// Function call to initialize app
getRepoFromUser();


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
    constructor(localRepoPath, originRepoName, originOwnerProfile, gitRepoDetails){
        this.localRepoPath = localRepoPath;
        this.originRepoName = originRepoName;
        this.originOwnerProfile = originOwnerProfile;
        this.gitRepoDetails = gitRepoDetails;
        this.questions = [];
    }

    
}
