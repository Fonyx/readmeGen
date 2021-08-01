const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require('node-fetch');
const PrettyError = require('pretty-error');
var pe = new PrettyError();
pe.start();


var licenseChoices = [
        new inquirer.Separator(' = Simple and Permissive: Can make closed source versions = '),
        {
            name: 'MIT License',
        },
        new inquirer.Separator(' = Sharing improvements: Cannot make closed source versions = '),
        {
            name: 'GNU General Public License v3.0',
        },
        new inquirer.Separator(' = Other Common Licenses on Github = '),
        {
            name: 'Apache License 2.0',
        },{
            name: 'BSD 2-Clause "Simplified" License',
        },{
            name: 'BSD 3-Clause "New" or "Revised" License',
        },{
            name: 'Boost Software License 1.0',
        },{
            name: 'Creative Commons Zero v1.0 Universal',
        },{
            name: 'Eclipse Public License 2.0',
        },{
            name: 'GNU Affero General Public License v3.0',
        },{
            name: 'GNU General Public License v2.0',
        },{
            name: 'GNU Lesser General Public License v2.1',
        },{
            name: 'Mozilla Public License 2.0',
        },{
            name: 'The Unlicense',
        },{
            name: 'More: https://choosealicense.com/licenses/',
        },{
            name: 'None: https://choosealicense.com/no-permission/',
        },
]

function noPackageError(){

}
noPackageError.prototype = new Error();

class Question{
    /* here we use an object pass in with destructuring.
    Constructor will be passed an object with some arguments in it, then the constructor with destructure the
    results and set the internal values. It resorts to defaults for omitted results
    */
    constructor({type, initMessage, name, choices=null, answer=undefined, automatic=true, packageValue=undefined, originValue=undefined}={}){
        this.type = type;
        this.initMessage = initMessage;
        this.message = '';
        this.name = name;
        this.choices = choices;
        this.content = undefined;
        // answer is the user input value after prompt runs
        this.answer = answer;
        this.automatic = automatic;
        this.packageValue = packageValue;
        this.originValue = originValue;
    }

    determineContent(){
        // case where user didn't specify anything
        if(this.answer !== '' && this.answer !== undefined){
            this.content = this.answer;
        } else if(this.originValue !== null){
            this.content = this.originValue;
        } else if (this.packageValue !== null){
            this.content = this.packageValue;
        } else if(!this.required){
            console.log("\x1b[35m%s\x1b[0m" ,`No value for ${this.name} but not required`)
        } else {
            throw new Error('No value for this required question')
        }
    }

    buildMessage(){
        // function that builds the message for the prompt. If the mode is automatic, does not render automatic questions
        if(!this.automatic){
            this.message = this.initMessage;
        } else {
            // makes a message out of the origin and package values
            if(this.originValue !== null){
                this.message = this.initMessage + 'Auto Read Found: ' + this.originValue + '\n';
            }else {
                this.message = this.initMessage + 'Auto Read Found: ' + this.packageValue + '\n';
            }
        }
        // if(mode === "manual"){
        //     // makes a message out of the origin and package values
        //     if(this.originValue !== null){
        //         this.message = this.initMessage + 'Auto Read Found: ' + this.originValue + '\n';
        //     }else {
        //         this.message = this.initMessage + 'Auto Read Found: ' + this.packageValue + '\n';
        //     }
        // // if the field is a manual field
        // } else if(!this.automatic){
        //     this.message = this.initMessage;
        // }
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
    constructor(localRepoPath, mode, inputMethod){
        this.localRepoPath = localRepoPath;
        this.mode = mode;
        this.inputMethod = inputMethod;
        this.originRepoName;
        this.originOwnerProfile;
        this.gitRepoDetails;
        this.contributors = undefined;
        this.licenses = undefined;
        this.licenseDescription = undefined;
        this.licensePermissions = undefined;
        this.docContent = '';
        this.questions = undefined;
        this.usageScreencapPath = undefined;
        this.projectScreenshotPath = undefined;
    }

    async askQuestions(){
        for (let name in this.questions){
            let currQ = this.questions[name];
            
            // automatic mode, only prompt questions that are automatic false otherwise log automatic result
            if(this.mode === 'automatic'){
                if(currQ.automatic) {
                    if(currQ.originValue !== null){
                        console.log(`Automatically assuming value: ${currQ.originValue} for ${currQ.name} from origin`);
                    }else if(currQ.packageValue !== null){
                        console.log(`Automatically assuming value: ${currQ.packageValue} for ${currQ.name} from package`);
                    }
                } else if(!currQ.automatic) {
                    await currQ.prompt();
                }
            // manual mode: prompt every question
            } else {
                await currQ.prompt()
            }            
        }
        this.decideQuestionContent();
        await this.getLicensePermissionsFromLicenseName();
        this.constructDocument();
        this.saveDocument();
    }

    buildQuestions(){
        // note the use of undefined as a question constructor default vs the use of null
        // null means this value cannot be determined - for use in downstream processes - whereas undefined means this will be determined
        this.questions = {
            projectTitle: new Question({type:'input',initMessage:'Project Title?\n',name:'Project Title'}),
            profileName: new Question({type:'input',initMessage:'Github profile name?\n',name:'Profile Name'}),
            version: new Question({type:'input',initMessage:'Project Version?\n',name:'Version', originValue:null}),
            license: new Question({type:'list',initMessage:'license type?\n',name:'License', choices:licenseChoices}),
            description: new Question({type:this.inputMethod,initMessage:'Project Description?\n',name:'Description'}),
            // dependencies: new Question({type:this.inputMethod,initMessage:'Add Dependencies More(comma separated)\n',name:'Dependencies', originValue : null}),
            usage: new Question({type:this.inputMethod,initMessage:'Usage\n',name:'Usage', originValue : null, packageValue:null, automatic:false}),
            installation: new Question({type:this.inputMethod,initMessage:'Installation steps\n',name:'Installation', originValue : null, packageValue:null, automatic:false}),
            credits: new Question({type:this.inputMethod,initMessage:'Add any people, tech or institutes to credit\n',name:'Credits', originValue : null, packageValue:null, automatic:false}),
            features: new Question({type:this.inputMethod,initMessage:'What features does the project have?\n',name:'Features', originValue : null, packageValue:null, automatic:false}),
            contributing: new Question({type:this.inputMethod,initMessage:'How to contribute to the project?\n',name:'Contributing', originValue : null, packageValue:null, automatic:false}),
            testing: new Question({type:this.inputMethod,initMessage:'Project testing structure\n',name:'Testing', originValue : null, packageValue:null, automatic:false}),
            questions: new Question({type:this.inputMethod,initMessage:'How to contact you?\n',name:'Questions', originValue : null, packageValue:null, automatic:false}),
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

        // some questions need to be skipped in the contents section, they are in a list
        let skippedContent = ['projectTitle','profileName', 'version', 'description', 'usage'];

        // start with title
        this.docContent += `# Project: [${this.questions.projectTitle.content}](https://github.com/${this.questions.profileName.content}/${this.questions.projectTitle.content})`;
        this.docContent += '\n\n';
        
        // version
        this.constructSection(null, this.questions.version);
        
        // make and show badges,show license, show languages used, show commit frequency, show contributors
        this.docContent += `![badmath](https://img.shields.io/github/license/${this.questions.profileName.content}/${this.originRepoName})  `;
        this.docContent += `![badmath](https://img.shields.io/github/languages/count/${this.originOwnerProfile}/${this.originRepoName})  `;
        this.docContent += `![badmath](https://img.shields.io/github/commit-activity/m/${this.originOwnerProfile}/${this.originRepoName})  `;
        this.docContent += `![badmath](https://img.shields.io/github/contributors/${this.originOwnerProfile}/${this.originRepoName})  `;
        this.docContent += '\n\n';
        
        // Description
        this.constructSection(null, this.questions.description);
        if(this.projectScreenshotPath){
            this.docContent += `![Alt text](https://github.com/${this.questions.profileName.content}/${this.originRepoName}/blob/main/assets/images/screenshot.PNG?raw=true "project screenshot")  `;
            this.docContent += '\n\n';
        }

        // License
        this.constructSection(null, this.questions.license); 
        if(this.licenseDescription && this.licensePermissions){
            this.docContent += '\n\n';
            this.docContent += '### Details  \n\n';
            this.docContent += '```';
            this.docContent += this.licenseDescription+'  ';
            this.docContent += '```';
            this.docContent += '\n\n';
            this.docContent += '### Permissions  \n\n';
            this.docContent += '```';
            this.docContent += this.licensePermissions.toString()+'  ';
            this.docContent += '```';
            this.docContent += '\n\n';
        }           

        // Make Contents and add
        this.docContent +='## Content \n\n';
        // add dependencies as they aren't a question but part of the readme
        if(this.dependencies){
            this.docContent += `- [Dependencies](#dependencies)`;
            this.docContent += '\n';
        }
        // add usageVideo as they aren't a question but part of the readme
        if(this.usageScreencapPath){
            this.docContent += `- [Usage](#usage)`;
            this.docContent += '\n';
        }
        // add contributors as they aren't a question but part of the readme
        if(this.contributors){
            this.docContent += `- [Contributors](#contributors)`;
            this.docContent += '\n';
        }
        for (let qname in this.questions){
            let question = this.questions[qname];
            // if question has content
            if (question.content){
                // if the question needs to be in the contents section
                if(!skippedContent.includes(qname)){
                    let contentString = `- [${question.name}](#${question.name.toLowerCase()})`;
                    this.docContent += contentString;
                    this.docContent += '\n';
                }
            }
        }
        this.docContent += '\n\n';
        // Dependencies
        if(this.dependencies){
            this.docContent += '\n\n';
            this.docContent += '## Dependencies  \n\n';
            for(let dependencyName in this.dependencies){
                let dependency = this.dependencies[dependencyName];
                this.docContent += `[${dependencyName}:${dependency}](https://www.npmjs.com/package/${dependencyName})`;
                this.docContent += '\n\n';
            }
            this.docContent += '\n\n';
        }  
        // Usage
        this.constructSection(null, this.questions.usage);
        if(this.usageScreencapPath){
            this.docContent += `![Screenshot](https://github.com/${this.questions.profileName.content}/${this.originRepoName}/blob/main/assets/images/screencap.gif?raw=true "usage screencap")  `;
            this.docContent += '\n\n';
        }

        // Contributors
        if(this.contributors){
            this.docContent +='## Contributors \n\n';
            // this.constructSection(null, this.questions.contributors);
            for( let contributor of this.contributors.trim().split(',')){
                this.docContent += `[${contributor}](https://github.com/${contributor})` 
                this.docContent += '\n\n';
            }
        }
        
        // Installation
        this.constructSection(null, this.questions.installation);

        // Credits
        this.constructSection(null, this.questions.credits);

        // Features
        this.constructSection(null, this.questions.features);

        // Contribute
        this.constructSection(null, this.questions.contributing);
        
        // Testing details
        this.constructSection(null, this.questions.testing);

        // Contact and profile github link
        this.constructSection(null, this.questions.questions);
        this.docContent += '\n\n';
        this.docContent += '## Checkout my github account '+`[${this.questions.profileName.content}](https://github.com/${this.questions.profileName.content})` 
        this.docContent += '\n\n';
        this.docContent += '\n\n';
    }

    constructSection(title, question){
        // if title is specified, will treat section as document title section, otherwise just a normal section ##
        if (question.content){
            if(title){
                this.docContent += `# title`;
            } else {
                this.docContent += `## ${question.name}`;
            }
            this.docContent += '\n\n';
            this.docContent += '```';
            this.docContent += question.content+'  ';
            this.docContent += '```';
            this.docContent += '\n\n';
        }
    }

    createMsgFromInitMsg(){
        /*
        Function that takes the intial message string (eg project title?) and appends any values from
        origin or package in appropriate priority so that the user can keep it or override it;
        */
        for (var name in this.questions){
            let currQ = this.questions[name];
            currQ.buildMessage();
        }
    }

    decideQuestionContent(){
        for (let qname in this.questions){
            let currQ = this.questions[qname];
            currQ.determineContent();
        }
    }

    deduceValuesFromRepo(){
        /* 
        Function collects values of interest from github repo details contained in this.gitRepoDetails
        */
        // get repo title from origin and set to question originValue
        if(this.gitRepoDetails.name){
            this.questions.projectTitle.originValue = this.gitRepoDetails.name;
            console.log("\x1b[32m%s\x1b[32m", `Found github repo name ${this.gitRepoDetails.name}`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `No github repo name for ${this.localRepoPath}`);
        }

        // get owner name and set to owner question originValue
        if(this.gitRepoDetails.owner.login){
            this.questions.profileName.originValue = this.gitRepoDetails.owner.login;
            console.log("\x1b[32m%s\x1b[32m", `Found github owner ${this.gitRepoDetails.owner.login}`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `No github owner for ${this.localRepoPath}`);
        }

        // get description and set to owner question originValue
        if(this.gitRepoDetails.description){
            this.questions.description.originValue = this.gitRepoDetails.description;
            console.log("\x1b[32m%s\x1b[32m", `Found github description ${this.gitRepoDetails.description}`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `No github description for ${this.localRepoPath}`);
        }

        // get license and set to owner question originValue
        if(this.gitRepoDetails.license){
            this.questions.license.originValue = this.gitRepoDetails.license.name;
            console.log("\x1b[32m%s\x1b[32m", `Found github license ${this.gitRepoDetails.license.name}`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `No github license for ${this.localRepoPath}`);
        }

        // get contributors
        fetch(this.gitRepoDetails.url+'/contributors')
        .then(res => res.json())
        .then(json => {
            let contributors = json.map(function(currentValue){
                return currentValue.login;
            })
            if(contributors){
                this.contributors = contributors.toString();
                console.log("\x1b[32m%s\x1b[32m", `Found github contributors ${contributors.toString()}`);
            } else {
                // log in red
                console.log('\x1b[31m%s\x1b[0m', `No github contributors for ${this.localRepoPath}`);
            }
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
            if(fs.existsSync(this.localRepoPath+'/package.json')){
                let rawPackage = fs.readFileSync(this.localRepoPath+'/package.json', {encoding:'utf-8', flag:'r'});
                let packageJson = JSON.parse(rawPackage);
                // set the packageValues for the corresponding question elements
                this.questions.projectTitle.packageValue = packageJson.name;
                this.questions.version.packageValue = packageJson.version;
                this.questions.description.packageValue = packageJson.description;
                this.questions.testing.packageValue = packageJson.scripts.test;
                this.questions.profileName.packageValue = packageJson.author;
                this.questions.license.packageValue = packageJson.license;
                // dependencies are no longer a question but automatically determined
                if(packageJson.dependencies){
                    this.dependencies = packageJson.dependencies;
                    // removing "" and {} from stringified array then switch comma for new line and tab
                    this.dependenciesStr = JSON.stringify(packageJson.dependencies).replace(/"/g, '').replace(/}/, '\n').replace(/,/g,'\n\t').replace(/{/, '\n\t')
                    console.log("\x1b[32m%s\x1b[32m", `Found package dependencies ${this.dependenciesStr}`);
                } else {
                    // log in red
                    console.log('\x1b[31m%s\x1b[0m', `No package dependencies found for ${this.localRepoPath}`);
                }
                    
        
                this.comparePackageToOrigin();
            } else {
                throw new noPackageError();
            }

            
        }catch(err){

            if(err instanceof noPackageError){
                console.log("\x1b[35m%s\x1b[35m",`Package.json file is absent from repo`);
            } else {
                console.log('\x1b[31m%s\x1b[0m', 'Error processing package values but package file does exist')
            }
        }

        this.createMsgFromInitMsg();
        this.askQuestions();
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
        .then(function(res) {
            if(res.ok){
                return res.json()
            } else {
                console.log(`Readme process failed due to Github api call error - likely too many requests per hour`);
                console.error(res.message);
                throw new Error('Github Repo call failed')
            }
        })
        .then(data => {
            this.gitRepoDetails = data;
            this.getUsageScreencap();
            this.getProjectScreenshot();
            // in case the call to the repo failed, just leave details undefined
            if(this.gitRepoDetails){
                this.deduceValuesFromRepo();
            }
        })
    }  

    async getLicenses(){
        this.licenses = await fetch('https://api.github.com/licenses').then(res => res.json());
    }

    async getLicensePermissionsFromLicenseName(){
        for (let license of this.licenses){
            if (license.name === this.questions.license.content){
                
                let licenseDetails = await fetch(license.url).then(res => res.json());
                this.licenseDescription = licenseDetails.description;
                this.licensePermissions = licenseDetails.permissions;
            }
        }
    }

    getUsageScreencap(){
        let usageScreencapPath = this.localRepoPath+'//assets//images//screencap.gif';
        if(fs.existsSync(usageScreencapPath)){
            this.usageScreencapPath = usageScreencapPath;
            // log in green
            console.log("\x1b[32m%s\x1b[32m", `screen capture path found`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `screen capture path ${usageScreencapPath} is empty, no usage gif available`)
        }
    }
    
    getProjectScreenshot(){
        let projectScreenshot = this.localRepoPath+'//assets//images//screenshot.png';
        if(fs.existsSync(projectScreenshot)){
            this.projectScreenshotPath = projectScreenshot;
            // log in green
            console.log("\x1b[32m%s\x1b[32m", `screenshot path found`);
        } else {
            // log in red
            console.log('\x1b[31m%s\x1b[0m', `screen capture path ${projectScreenshot} is empty, no usage gif available`)
        }
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

   async saveDocument(){
        if(fs.existsSync('README.md')){
            await inquirer.prompt({
                type: 'confirm',
                message: 'override existing readme?',
                name: 'override',
                default: true,
            }).then((answers) => {
                if (answers.override){
                    fs.writeFileSync('README.md', this.docContent, {encoding: 'utf-8', flag: 'w'});
                    console.log('Written to file successfully');
                } else {
                    console.log('\x1b[31m%s\x1b[0m', 'File abandoned by user')
                }
            }).catch((err) => {
                console.error(err)
            })
        } else{
            fs.writeFileSync('README.md', this.docContent, {encoding: 'utf-8', flag: 'w'});
            console.log('Written to file successfully');
        }
    }
}

function startNewReadmeProcess() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'local repository path',
            name: 'localRepoPath',
        },{
            type: 'list',
            message: 'Manual mode or Automatic-node projects only?',
            name: 'mode',
            choices: ['manual', 'automatic'],
            default: 0,
        }, {
            type: 'list',
            message: 'Use Inputs (tiny readme) or Editors (sophisticated readme)',
            name: 'inputMethod',
            choices: ['input', 'editor'],
            default: 0,
        }
        ])
        .then((answers) => {
            console.log(answers.localRepoPath);
            if(answers.localRepoPath.trim() != ''){
                var readme = new Readme(answers.localRepoPath.replace(/\\/g, '/'), answers.mode, answers.inputMethod);
            } else {
                console.log('\x1b[31m%s\x1b[0m', 'Using default path for testing')
                var readme = new Readme('C://Users//nicka//Documents//readmeGen', answers.mode, answers.inputMethod);
            }

            readme.buildQuestions();
            readme.getGitRepoNameAndProfileFromUser();
            readme.getLicenses();
            readme.getGitRepoDetails();
        })

}

startNewReadmeProcess();