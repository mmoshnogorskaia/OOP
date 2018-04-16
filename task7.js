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
  hireDevs (department) {
    for(let i=0; i<department.needDevelopers; i++){
   department.developers.push(new Developer());}
  },
  fireDevs() {}
};

class Department {
  constructor(){
    this.projects=[];
    this.developers=[];
    this.needDevelopers=0;
  }
}

let webDepartment = new Department();
let mobDepartment = new Department();

class Developer {}

//1 day

director.addProjects();
director.giveProjects();
console.log(mobDepartment.projects);