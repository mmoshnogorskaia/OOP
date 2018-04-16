//generating today's objects

function getRandomInt(min,max) {
  return Math.floor(Math.random() * (max-min))+min;
}

function getProjectType(string){
  let type;
  if (+string[0]==1){ type= 'web';}else{ type = 'mobile';}
  return type;
}

function getProjectDifficulty(string){
let difficulty = Math.ceil(+string[1]/3);
  return difficulty;
}

class Project {
  constructor(paramString){
  this.projectType=getProjectType(paramString);
  this.projectDifficulty= getProjectDifficulty(paramString);}
}


let amountNewProjects = getRandomInt(0,5);

function generateProjects () {
  let projectsToday=[];
  for (i=0; i<amountNewProjects;i++)
    {
      projectsToday[i] = new Project ((getRandomInt(10,30)).toString());
    }
  return projectsToday;
}

console.log(generateProjects ());