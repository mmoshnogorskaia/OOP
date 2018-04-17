//generating today's objects

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function getMatchingObjects (array, property, value){
  return array.filter(function(object){return object[property]==value;});
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
    let projectsLeft=[];
    let freeWebDevs=webDepartment.freeDevelopers().length;
    let webProjects = getMatchingObjects (this.allProjects, 'projectType', 'web');
    if (webProjects.length<=freeWebDevs){webDepartment.projects=webDepartment.projects.concat(webProjects);
       }else{webDepartment.needDevelopers=webProjects.length-freeWebDevs;
        webDepartment.projects=webDepartment.projects.concat(webProjects.slice(0,freeWebDevs));
        projectsLeft=webProjects.slice(freeWebDevs+1);
        this.allProjects=this.allProjects.concat(projectsLeft);
       }
    
    let mobProjects = getMatchingObjects (this.allProjects, 'projectType', 'mobile');
    this.allProjects=[];
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
  return getMatchingObjects (this.developers, 'state', 'free');
  }
}

let webDepartment = new Department();
webDepartment.needDevelopers=6;
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
console.log(webDepartment.projects);