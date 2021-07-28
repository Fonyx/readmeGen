// TODO: Include packages needed for this application
const generateMarkdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
var readme;

class Question{
    /* here we use an object pass in with destructuring.
    Constructor will be passed an object with some arguments in it, then the constructor with destructure the
    results and set the internal values. It resorts to defaults for omitted results
    */
    constructor({type, message, qname, choices=null, answer=undefined, required=true, packageValue=undefined, originValue=undefined, userValue=undefined}={}){
        this.type = type;
        this.message = message;
        this.qname = qname;
        this.choices = choices;
        this.answer = answer;
        this.required = required;
        this.packageValue = packageValue;
        this.originValue = originValue;
        this.userValue = userValue;
        this.priorityMessage = '';
    }

    prompt(){
        inquirer.prompt({
            type: this.type,
            message: this.priorityMessage,
            name: this.qname,
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
        this.questions = undefined;
        this.onlyRequired = false;
        this.feelingLucky = false;
    }

    askQuestions(){
        for (var qname in this.questions){
            let currentQuestion = this.questions[qname];
            currentQuestion.prompt();
        }
    }

    buildQuestions(){
        // note the use of undefined as a question constructor default vs the use of null
        // null means this value cannot be determined - for use in downstream processes - whereas undefined means this will be determined
        this.questions = {
            'projectTitle': new Question({type:'input',message:'Project Title?\n',qname:'projectTitle'}),
            'version': new Question({type:'input',message:'Project Version?\n',qname:'version', originValue:null}),
            'profileName': new Question({type:'input',message:'Profile name?\n',qname:'profileName'}),
            'contributors': new Question({type:'input',message:'Add contributors/collaborators More(comma separated)\n',qname:'contributors', packageValue:null}),
            'description': new Question({type:'input',message:'Project Description?\n',qname:'description'}),
            'dependencies': new Question({type:'input',message:'Add Dependencies More(comma separated)\n',qname:'dependencies', originValue : null}),
            'license': new Question({type:'input',message:'license type?',qname:'license', choices:['MIT', 'Unlicense', 'GNU']}),
            'motivation': new Question({type:'editor',message:'What motivated the project, What problem does it solve?',qname:'motivation', originValue : null, packageValue:null, required:false}),
            'installation': new Question({type:'editor',message:'Installation steps',qname:'installation', originValue : null, packageValue:null, required:false}),
            'usage': new Question({type:'editor',message:'Usage',qname:'usage', originValue : null, packageValue:null, required:false}),
            'credits': new Question({type:'input',message:'Add any people, tech or institutes to credit (comma separated)',qname:'credits', originValue : null, packageValue:null, required:false}),
            'features': new Question({type:'editor',message:'What features does the project have?',qname:'features', originValue : null, packageValue:null, required:false}),
            'contributing': new Question({type:'editor',message:'How to contribute to the project?',qname:'contributing', originValue : null, packageValue:null, required:false}),
            'testing': new Question({type:'editor',message:'Project testing structure',qname:'testing', originValue : null, packageValue:null, required:false}),
        }
    }

    comparePackageToOrigin(){
        /*
        A function that compares packageValue and originValue for all questions
        ignores comparison if either value is null - designed in to question construction
        still applies comparison if values are 'undefined' as they should be here regularly
        */
        console.log('bang')
        for (var qname in this.questions){
            // check both values are valid for comparison
            if (this.questions[qname].packageValue !== null && this.questions[qname].originValue !== null){
                if(this.questions[qname].packageValue !== this.questions[qname].originValue){
                    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
                    console.log('\x1b[31m%s\x1b[0m', `${qname} has inconsistent derived values`);
                    console.log('\x1b[31m%s\x1b[0m', `\tOriginRepo: ${this.questions[qname].originValue}`);
                    console.log('\x1b[31m%s\x1b[0m', `\tPackage.json: ${this.questions[qname].packageValue}`);
                    console.log('\x1b[31m%s\x1b[0m', '\tTake better care of your package file, for now, using the originRepo version, consult readme for more details');
                }
            } else {
                // question can't be compared
            }
        }
    }

    createPriorityMessage(){
        for (var qname in this.questions){
            let curQ = this.questions[qname];
            // makes a message out of the origin and package values
            curQ.priorityMessage = (curQ.originValue !== null) ? curQ.originValue : curQ.packageValue;
        }
    }

    deduceValuesFromRepo(){
        /* 
        Function collects values of interest from github repo details contained in this.gitRepoDetails
        */
        // get repo title from origin and set to question originValue
        this.questions.projectTitle.originValue = this.gitRepoDetails.name;
        console.log(`Repo Name: ${this.gitRepoDetails.name}`);
        
        // get owner name and set to owner question originValue
        this.questions.profileName.originValue = this.gitRepoDetails.owner.login;
        console.log(`Owner Name: ${this.gitRepoDetails.owner.login}`);

        // get description and set to owner question originValue
        this.questions.description.originValue = this.gitRepoDetails.description;

        // get contributors
        fetch(this.gitRepoDetails.url+'/contributors')
        .then(res => res.json())
        .then(json => {
            let contributors = json.map(function(currentValue){
                return currentValue.login;
            })
            console.log(`Contributors: ${contributors}`);
            this.questions.contributors.originValue = contributors;
            this.deduceValuesFromPackage();
        })
        .catch(err => console.error(err));
    }

    deduceValuesFromPackage(){
        /* 
        Gets values of concern from package.json file
        specifically: name, version, description, scripts.test, author, license, dependencies
        */
       // get the json object
       try{
           let rawPackage = fs.readFileSync(this.localRepoPath+'/package.json', {encoding:'utf-8', flag:'r'});
           let packageJson = JSON.parse(rawPackage);

            // set the packageValues for the corresponding question elements
            this.questions.projectTitle.packageValue = packageJson.name;
            this.questions.version.packageValue = packageJson.version;
            this.questions.description.packageValue = packageJson.description;
            this.questions.testing.packageValue = packageJson.scripts.test;
            this.questions.profileName.packageValue = packageJson.author;
            this.questions.license.packageValue = packageJson.license;
            this.questions.dependencies.packageValue = packageJson.dependencies;

            this.comparePackageToOrigin();
            this.createPriorityMessage();
            this.log_state();
            this.askQuestions();
            
       }catch(error){
        console.log(error);
       }
    }

    getGitRepoNameAndProfileFromUser(){
        /* function collects a local path string from user, 
        then reads the .git/config file for url = git@github.com:Fonyx/readmeGen.git 
        then splits and strips owner and repoName */
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
        /* 
        Gets github details for repo using originOwnerProfile and originRepoName 
        - derived from getGitRepoNameAndProfileFromUser()
        */
        fetch(`https://api.github.com/repos/${this.originOwnerProfile}/${this.originRepoName}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            this.gitRepoDetails = data;
            readme.deduceValuesFromRepo();
        })
        .catch((err) => {
            console.log(err);
        })
    }  
    
    log_state(){
        console.log(this);
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
            readme.buildQuestions();
            readme.getGitRepoNameAndProfileFromUser();
            readme.getGitRepoDetails();
        })

}

startNewReadmeProcess();


// build question instances - blueprint

// get all details from origin data and fill



