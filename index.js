// TODO: Include packages needed for this application
const generateMarkdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
var readme;

class Question{
    constructor(type, message, qname, choices=null, answer=undefined, required=true, packageValue=undefined, originValue=undefined, userValue=undefined){
        this.type = type;
        this.message = message;
        this.qname = qname;
        this.choices = choices;
        this.answer = answer;
        this.required = required;
        this.packageValue = packageValue;
        this.originValue = originValue;
        this.userValue = userValue;
    }

    prompt(){
        inquirer.prompt({
            type: this.type,
            message: this.message,
            name: this.qname
        }).then((answer) => {
            this.answer = answer;
        }).catch((err) => {
            console.error(err)
        })
    }
}

class Readme{
    constructor(localRepoPath){
        this.localRepoPath = localRepoPath;
        this.originRepoName;
        this.originOwnerProfile;
        this.gitRepoDetails;
        this.questions = [];
        this.onlyRequired = false;
        this.feelingLucky = false;
    }

    askQuestions(){
        for(let i = 0; i < this.questions.length; i++){
            let currentQuestion = this.questions[i];
            currentQuestion.prompt();
        }
    }

    // note the use of undefined as a question constructor default vs the use of null
    // null means this value cannot be determined - for use in downstream processes - whereas undefined means this will be determined
    buildQuestions(){
        this.questions = {
            'projectTitle': new Question(type='input',message='Project Title?\n',qname='projectTitle'),
            'version': new Question(type='input',message='Project Version?\n',qname='version'),
            'profileName': new Question(type='input',message='Profile name?\n',qname='profileName'),
            'collaborators': new Question(type='input',message='Add collaborators More(comma separated)\n',qname='collaborators', packageValue=null),
            'description': new Question(type='input',message='Project Description?\n',qname='description'),
            'dependencies': new Question(type='input',message='Add Dependencies More(comma separated)\n',qname='dependencies', originValue = null),
            'license': new Question(type='input',message='license type?',qname='license', choices=['MIT', 'Unlicense', 'GNU']),
            'motivation': new Question(type='editor',message='What motivated the project, What problem does it solve?',qname='motivation', originValue = null, packageValue=null, required=false),
            'installation': new Question(type='editor',message='Installation steps',qname='installation', originValue = null, packageValue=null, required=false),
            'usage': new Question(type='editor',message='Usage',qname='usage', originValue = null, packageValue=null, required=false),
            'credits': new Question(type='input',message='Add any people, tech or institutes to credit (comma separated)',qname='credits', originValue = null, packageValue=null, required=false),
            'features': new Question(type='editor',message='What features does the project have?',qname='features', originValue = null, packageValue=null, required=false),
            'contributing': new Question(type='editor',message='How to contribute to the project?',qname='contributing', originValue = null, packageValue=null, required=false),
            'testing': new Question(type='editor',message='Project testing structure',qname='testing', originValue = null, packageValue=null, required=false),
        }
    }

    deduceValuesFromRepo(){

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
            this.gitRepoDetails = data;
        })
        .catch((err) => {
            console.log(err);
        })

        this.buildQuestions();
        this.askQuestions();
    }   
    
    getQuestionWithName(name){
        for(let i = 0; i < this.questions.length; i++){
            let currentQuestion = this.questions[i];
            if (currentQuestion.name === name){
                return currentQuestion
            }
        }
        return false;
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


// build question instances - blueprint

// get all details from origin data and fill



