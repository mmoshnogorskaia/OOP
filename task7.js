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

  fire() {}
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
   while(this.projects.length!=0){
   for(let i=0; i<this.developers.length; i++){
  if(this.developers[i].busyDuration==0){
  this.developers[i].busyDuration=this.projects[0].projectDifficulty;
  break;
  }}
  this.projects.shift();
}
  }
}

let webDepartment = new Department();
let mobDepartment = new Department();
let qaDepartment = new Department();

class Developer {
  constructor() {
    this.busyDuration = 0;
  }
}


//1 day
director.hire();
director.giveProjects();
webDepartment.distributeProjects(); //yesterday's

director.addProjects();
director.giveProjects();
webDepartment.distributeProjects(); //today's
//devs work on projects
//testers work on projects
//delete projects
//fire




console.log(webDepartment.projects);