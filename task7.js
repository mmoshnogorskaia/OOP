//generating today's objects

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Project {
  constructor() {
    this.projectType = getRandomInt(0, 1) ? 'web' : 'mobile';
    this.projectDifficulty = getRandomInt(1, 3);
  }
}

const director = {
  allProjects: [],
  addProjects() {
    const amount = getRandomInt(0, 4);
    for (let i = 0; i < amount; i++) {
      this.allProjects.push(new Project());
    }
    return this.allProjects;
  },
  giveProjects(){
    webDepartment.projects = this.allProjects.filter(function(object){return object.projectType=='web';});
    mobDepartment.projects = this.allProjects.filter(function(object){return object.projectType=='mobile';});
  },
    
  hire(){
  function hireByDepartment (department) {
    for(let i=0; i<department.needDevelopers; i++){
   department.developers.push(new Developer());}
  }
  hireByDepartment (webDepartment);
  hireByDepartment (mobDepartment);
  hireByDepartment (qaDepartment);
  },  
  
  fire() {}
};

class Department {
  constructor(){
    this.projects=[];
    this.developers=[];
    this.needDevelopers=0;
  }
  freeDevelopers(){
  return this.developers.filter(function(object){return object.state=='free';});  
  }
}

let webDepartment = new Department();
let mobDepartment = new Department();
let qaDepartment = new Department();

class Developer {
  constructor(){
    this.state='free';
  }
}

//1 day

director.addProjects();
director.giveProjects();
director.hire(webDepartment);
console.log(qaDepartment.freeDevelopers());