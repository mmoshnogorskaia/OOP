//generating today's objects

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

function getMatchingObjects(array, property, value) {
  return array.filter(function(object) {
    return object[property] == value;
  });
}

class Project {
  constructor() {
    this.projectType = getRandomInt(0, 1) ? "web" : "mobile";
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
  giveProjects() {
    let webProjects = getMatchingObjects(
      this.allProjects,
      "projectType",
      "web"
    );
    let mobProjects = getMatchingObjects(
      this.allProjects,
      "projectType",
      "mobile"
    );
    this.allProjects = [];
    function giveProjectsToDepartment(department, p) {
      let projectsLeft = [];
      let freeDevs = department.freeDevelopers().length;
      if (p.length <= freeDevs) {
        department.projects = department.projects.concat(p);
      } else {
        department.needDevelopers = p.length - freeDevs;
        department.projects = department.projects.concat(
          p.slice(0, freeDevs)
        );
        projectsLeft = p.slice(freeDevs + 1);
        director.allProjects = director.allProjects.concat(projectsLeft);
      }
    }
    giveProjectsToDepartment(webDepartment, webProjects);
    giveProjectsToDepartment(mobDepartment, mobProjects);
  },

  hire() {
    function hireByDepartment(department) {
      for (let i = 1; i < department.needDevelopers; i++) {
        department.developers.push(new Developer());
      }
    }
    hireByDepartment(webDepartment);
    hireByDepartment(mobDepartment);
    hireByDepartment(qaDepartment);
  },

  fire() {
    function fireByDepartment(department){
      for(let i=0; i<department.developers.length;i++){if(department.developers[i].daysFree>3){department.developers.splice(i,1);}}
    }
    fireByDepartment(webDepartment);
    fireByDepartment(mobDepartment);
    fireByDepartment(qaDepartment);
    
  }
  
};

class Department {
  constructor() {
    this.projects = [];
    this.developers = [];
    this.needDevelopers = 0;
  }
  freeDevelopers() {
    return getMatchingObjects(this.developers, "busyDuration", 0);
  }
  distributeProjects(){
   while(this.projects.length!==0){
   for(let i=0; i<this.developers.length; i++){
  if(this.developers[i].busyDuration===0){
  this.developers[i].busyDuration=this.projects[0].projectDifficulty; this.developers[i].daysFree=0;
  break;
  }}
  this.projects.shift();
}
    
  }
  
    
}

let webDepartment = new Department();

webDepartment.workInProgress=function (){
   for (let i=0; i<this.developers.length; i++){
   this.developers[i].works();
   if (this.developers[i].busyDuration===0){qaDepartment.projects++;}
   }
  };


let mobDepartment = new Department();
mobDepartment.workInProgress=function (){
   for (let i=0; i<this.developers.length; i++){
   this.developers[i].works();
   if (this.developers[i].busyDuration===0){qaDepartment.projects++;}
   }
  };

let qaDepartment = new Department();
qaDepartment.projects=0;
//mobDepartment.workInProgress=0;


class Developer {
  constructor() {
    this.busyDuration = 0;
    this.daysFree=0;
  }
  works(){
    if (this.busyDuration===0){this.daysFree++;}
    else{this.busyDuration--; this.daysFree=0;}
   // if (this.busyDuration===0){/*ready for tests*/}
  }
}


//1 day
director.hire();
director.giveProjects();
webDepartment.distributeProjects(); //yesterday's
mobDepartment.distributeProjects();

director.addProjects();
director.giveProjects();
webDepartment.distributeProjects(); //today's
mobDepartment.distributeProjects();

webDepartment.workInProgress();
mobDepartment.workInProgress();
//testers work on projects
//delete projects
director.fire();




console.log(webDepartment.projects);