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
    constructor({type, initMessage, name, choices=null, answer=undefined, required=true, packageValue=undefined, originValue=undefined, userValue=undefined}={}){
        this.type = type;
        this.initMessage = initMessage;
        this.message = '';
        this.name = name;
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
            name: this.name,
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
        // for (var name in this.questions){
        //     let currentQuestion = this.questions[name];
        //     currentQuestion.prompt();
        // }
        // for (let {name, question} in self.questions){

        // }
        let questionObjs = this.questions.map(function(currentValue){
            return this.questions[currentValue.name];
        })
        inquirer.prompt(questionObjs)
        .then((answers) => {
            console.log(answers);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    buildQuestions(){
        // note the use of undefined as a question constructor default vs the use of null
        // null means this value cannot be determined - for use in downstream processes - whereas undefined means this will be determined
        this.questions = {
            'projectTitle': new Question({type:'input',initMessage:'Project Title?\n',name:'projectTitle'}),
            'version': new Question({type:'input',initmessage:'Project Version?\n',name:'version', originValue:null}),
            'profileName': new Question({type:'input',initmessage:'Profile name?\n',name:'profileName'}),
            'contributors': new Question({type:'input',initmessage:'Add contributors/collaborators More(comma separated)\n',name:'contributors', packageValue:null}),
            'description': new Question({type:'input',initmessage:'Project Description?\n',name:'description'}),
            'dependencies': new Question({type:'input',initmessage:'Add Dependencies More(comma separated)\n',name:'dependencies', originValue : null}),
            'license': new Question({type:'input',initmessage:'license type?\n',name:'license', choices:['MIT', 'Unlicense', 'GNU']}),
            'motivation': new Question({type:'editor',initmessage:'What motivated the project, What problem does it solve?\n',name:'motivation', originValue : null, packageValue:null, required:false}),
            'installation': new Question({type:'editor',initmessage:'Installation steps\n',name:'installation', originValue : null, packageValue:null, required:false}),
            'usage': new Question({type:'editor',initmessage:'Usage\n',name:'usage', originValue : null, packageValue:null, required:false}),
            'credits': new Question({type:'input',initmessage:'Add any people, tech or institutes to credit (comma separated)\n',name:'credits', originValue : null, packageValue:null, required:false}),
            'features': new Question({type:'editor',initmessage:'What features does the project have?\n',name:'features', originValue : null, packageValue:null, required:false}),
            'contributing': new Question({type:'editor',initmessage:'How to contribute to the project?\n',name:'contributing', originValue : null, packageValue:null, required:false}),
            'testing': new Question({type:'editor',initmessage:'Project testing structure\n',name:'testing', originValue : null, packageValue:null, required:false}),
        }
    }

    comparePackageToOrigin(){
        /*
        A function that compares packageValue and originValue for all questions
        ignores comparison if either value is null - designed in to question construction
        still applies comparison if values are 'undefined' as they should be here regularly
        */
        for (var name in this.questions){
            // check both values are valid for comparison
            if (this.questions[name].packageValue !== null && this.questions[name].originValue !== null){
                if(this.questions[name].packageValue !== this.questions[name].originValue){
                    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
                    console.log('\x1b[31m%s\x1b[0m', `${name} has inconsistent derived values`);
                    console.log('\x1b[31m%s\x1b[0m', `\tOriginRepo: ${this.questions[name].originValue}`);
                    console.log('\x1b[31m%s\x1b[0m', `\tPackage.json: ${this.questions[name].packageValue}`);
                    console.log('\x1b[31m%s\x1b[0m', '\tTake better care of your package file, for now, using the originRepo version, consult readme for more details');
                }
            } else {
                // question can't be compared
            }
        }
    }

    createPriorityMessage(){
        for (var name in this.questions){
            let curQ = this.questions[name];
            // makes a message out of the origin and package values
            if(curQ.originValue !== null){
                curQ.message = curQ.initmessage + 'Auto Read Found\n\t' + curQ.originValue;
            }else {
                curQ.message = curQ.initmessage + 'Auto Read Found\n\t' + curQ.packageValue;
            }
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
            this.questions.contributors.originValue = contributors.toString();
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
            // removing "" and {} from stringified array then switch comma for new line and tab
            this.questions.dependencies.packageValue = JSON.stringify(packageJson.dependencies)
                .replace(/["}]/g, '')
                .replace(/,/g,'\n\t')
                .replace(/{/, '\t')

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
        console.log(`${this.localRepoPath}`);
        console.log(`${this.gitRepoDetails}`);
        for (let name in this.questions){
            let curQ = this.questions[name];
            console.log(`${name}`);
            console.log(curQ);
        }
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



