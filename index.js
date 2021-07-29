// TODO: Include packages needed for this application
const generateMarkdown = require('./utils/generateMarkdown');
const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
var readme;
var licenseChoices = [
        new inquirer.Separator(' = Simple and Permissive: Can make closed source versions = '),
        {
            name: '\tMIT License',
        },
        new inquirer.Separator(' = Sharing improvements: Cannot make closed source versions = '),
        {
            name: '\tGNU General Purpose License v3.0',
        },
        new inquirer.Separator(' = Other Common Licenses on Github = '),
        {
            name: '\tApache License 2.0',
        },{
            name: '\tBSD 2-Clause "Simplified" License',
        },{
            name: '\tBSD 3-Clause "New" or "Revised" License',
        },{
            name: '\tBoost Software License 1.0',
        },{
            name: '\tCreative Commons Zero v1.0 Universal',
        },{
            name: '\tEclipse Public License 2.0',
        },{
            name: '\tGNU Affero General Public License v3.0',
        },{
            name: '\tGNU General Public License v2.0',
        },{
            name: '\tGNU Lesser General Public License v2.1',
        },{
            name: '\tMozilla Public License 2.0',
        },{
            name: '\tThe Unlicense',
        },{
            name: '\tMore: https://choosealicense.com/licenses/',
        },{
            name: '\tNone: https://choosealicense.com/no-permission/',
        },
]


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
        // answer is the user input value after prompt runs
        this.answer = answer;
        this.required = required;
        this.packageValue = packageValue;
        this.originValue = originValue;
    }

    async prompt(){
        await inquirer.prompt({
            type: this.type,
            message: this.message,
            name: this.name,
            choices: this.choices,
        }).then((answer) => {
            /* note: answer returned is a key/value hash so we need to get the value out by using the name
            eg. answer = {'projectTitle': ''} => answer['projectTitle] */
            this.answer = answer[this.name];
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
        this.docContent = '';
        this.questions = undefined;
        this.onlyRequired = false;
        this.feelingLucky = false;
    }

    async askQuestions(){
        for (let name in this.questions){
            let currQ = this.questions[name];
            await currQ.prompt();
        }
        this.constructDocument();
        this.saveDocument()
    }

    buildQuestions(){
        // note the use of undefined as a question constructor default vs the use of null
        // null means this value cannot be determined - for use in downstream processes - whereas undefined means this will be determined
        this.questions = {
            'projectTitle': new Question({type:'input',initMessage:'Project Title?\n',name:'projectTitle'}),
            'version': new Question({type:'input',initMessage:'Project Version?\n',name:'version', originValue:null}),
            'profileName': new Question({type:'input',initMessage:'Profile name?\n',name:'profileName'}),
            'contributors': new Question({type:'input',initMessage:'Add contributors/collaborators More(comma separated)\n',name:'contributors', packageValue:null}),
            'description': new Question({type:'input',initMessage:'Project Description?\n',name:'description'}),
            'dependencies': new Question({type:'input',initMessage:'Add Dependencies More(comma separated)\n',name:'dependencies', originValue : null}),
            'license': new Question({type:'list',initMessage:'license type?\n',name:'license', choices:licenseChoices}),
            'motivation': new Question({type:'editor',initMessage:'What motivated the project, What problem does it solve?\n',name:'motivation', originValue : null, packageValue:null, required:false}),
            'installation': new Question({type:'editor',initMessage:'Installation steps\n',name:'installation', originValue : null, packageValue:null, required:false}),
            'usage': new Question({type:'editor',initMessage:'Usage\n',name:'usage', originValue : null, packageValue:null, required:false}),
            'credits': new Question({type:'input',initMessage:'Add any people, tech or institutes to credit (comma separated)\n',name:'credits', originValue : null, packageValue:null, required:false}),
            'features': new Question({type:'editor',initMessage:'What features does the project have?\n',name:'features', originValue : null, packageValue:null, required:false}),
            'contributing': new Question({type:'editor',initMessage:'How to contribute to the project?\n',name:'contributing', originValue : null, packageValue:null, required:false}),
            'testing': new Question({type:'editor',initMessage:'Project testing structure\n',name:'testing', originValue : null, packageValue:null, required:false}),
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

    constructDocument(){
        for (let qname in this.questions){
            let currQ = this.questions[qname];
            this.docContent += qname;
            // case where user didn't specify anything
            if(currQ.answer !== ''){
                this.docContent += currQ.answer
            } else if(currQ.originValue !== null){
                this.docContent += currQ.originValue
            } else if (currQ.packageValue !== null){
                this.docContent += currQ.packageValue
            } else {
                this.docContent += 'No value found or entered for this section';
            }
        }
    }

    createMsgFromInitMsg(){
        /*
        Function that takes the intial message string (eg project title?) and appends any values from
        origin or package in appropriate priority so that the user can keep it or override it;
        */
        for (var name in this.questions){
            let curQ = this.questions[name];
            let startMessage = curQ.initMessage + 'Auto Read Found: ';
            // makes a message out of the origin and package values
            if(curQ.originValue !== null){
                curQ.message = startMessage + curQ.originValue + '\n';
            }else {
                curQ.message = startMessage + curQ.packageValue + '\n';
            }
        }
    }

    deduceValuesFromRepo(){
        /* 
        Function collects values of interest from github repo details contained in this.gitRepoDetails
        */
        // get repo title from origin and set to question originValue
        this.questions.projectTitle.originValue = this.gitRepoDetails.name;
        
        // get owner name and set to owner question originValue
        this.questions.profileName.originValue = this.gitRepoDetails.owner.login;

        // get description and set to owner question originValue
        this.questions.description.originValue = this.gitRepoDetails.description;

        // get contributors
        fetch(this.gitRepoDetails.url+'/contributors')
        .then(res => res.json())
        .then(json => {
            let contributors = json.map(function(currentValue){
                return currentValue.login;
            })
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
                .replace(/"/g, '')
                .replace(/}/, '\n')
                .replace(/,/g,'\n\t')
                .replace(/{/, '\n\t')

            this.comparePackageToOrigin();
            this.createMsgFromInitMsg();
            // this.log_state();
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

    saveDocument(){
        fs.writeFileSync('README.md', this.docContent, {encoding: 'utf-8', flag: 'w'});
        console.log('Written to file successfully');
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



