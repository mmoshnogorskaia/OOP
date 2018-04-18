let util = {
  getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
},
 getMatchingObjects(array, property, value) {
  return array.filter(function(object) {
    return object[property] == value;
  });
}  
};



class Project {
  constructor(projectDifficulty) {
    this.projectType = util.getRandomInt(0, 1) ? "web" : "mobile";
    this.projectDifficulty = projectDifficulty;
  }
}

const director = {
  allProjects: [],
  projectsDone: 0,
  addProjects() {
    const amount = util.getRandomInt(0, 4);
    for (let i = 0; i < amount; i++) {
      this.allProjects.push(new Project(util.getRandomInt(1, 3)));
    }
    return this.allProjects;
  },
  giveProjects() {
    function giveProjectsToDepartment(department, type) {
      let projectsLeft = [];
      let p=util.getMatchingObjects(director.allProjects,"projectType",type);
      let freeDevs = department.freeDevelopers().length;
      if (p.length <= freeDevs) {
        department.projects = department.projects.concat(p);
      } else {
        department.needDevelopers = p.length - freeDevs;
        department.projects = department.projects.concat(
          p.slice(0, freeDevs - 1)
        );
        projectsLeft = p.slice(freeDevs);
        director.allProjects = director.allProjects.concat(projectsLeft);
      }
    }
    giveProjectsToDepartment(webDepartment, 'web');
    giveProjectsToDepartment(mobDepartment, 'mobile');
    this.allProjects = [];
  },
  hired: 0,
  hire() {
    function hireByDepartment(department) {
      for (let i = 1; i < department.needDevelopers; i++) {
        department.developers.push(new Developer());
        director.hired++;
      }
    }
    hireByDepartment(webDepartment);
    hireByDepartment(mobDepartment);
    hireByDepartment(qaDepartment);
  },
  fired: 0,
  fire() {
    function fireByDepartment(department) {
      for (let i = 0; i < department.developers.length; i++) {
        if (department.developers[i].daysFree > 3) {
          department.developers.splice(i, 1);
          director.fired++;
        }
      }
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
    return util.getMatchingObjects(this.developers, "busyDuration", 0);
  }
  distributeProjects() {
    while (this.projects.length !== 0) {
      for (let i = 0; i < this.developers.length; i++) {
        if (this.developers[i].busyDuration === 0) {
          this.developers[i].busyDuration = this.projects[0].projectDifficulty;
          this.developers[i].daysFree = 0;
          break;
        }
      }
      this.projects.shift();
    }
  }
}

let webDepartment = new Department();

webDepartment.workInProgress = function() {
  for (let i = 0; i < this.developers.length; i++) {
    this.developers[i].works();
    if (this.developers[i].busyDuration === 0) {
      qaDepartment.projectsStack.push(new Project(1));
    }
  }
};

let mobDepartment = new Department();
mobDepartment.workInProgress = function() {
  for (let i = 0; i < this.developers.length; i++) {
    this.developers[i].works();
    if (this.developers[i].busyDuration === 0) {
      qaDepartment.projectsStack.push(new Project(1));
    }
  }
};

let qaDepartment = new Department(); //has its own stack of Projects and takeProjects method and modofied workInProgress
qaDepartment.projectsStack = [];
qaDepartment.takeProjects = function() {
  let projectsLeft = [];
  let freeDevs = this.freeDevelopers().length;
  if (this.projectsStack.length <= freeDevs) {
    this.projects = this.projects.concat(this.projectsStack);
  } else {
    this.needDevelopers = this.projectsStack.length - freeDevs;
    this.projects = this.projects.concat(
      this.projectsStack.slice(0, freeDevs - 1)
    );
    projectsLeft = this.projectsStack.slice(freeDevs);
    this.projects = this.projects.concat(projectsLeft);
  }
};

qaDepartment.workInProgress = function() {
  for (let i = 0; i < this.developers.length; i++) {
    this.developers[i].works();
    if (this.developers[i].busyDuration === 0) {
      director.projectsDone++;
    }
  }
};

class Developer {
  constructor() {
    this.busyDuration = 0;
    this.daysFree = 0;
  }
  works() {
    if (this.busyDuration === 0) {
      this.daysFree++;
    } else {
      this.busyDuration--;
      this.daysFree = 0;
    }
  }
}

let days = 10;
for (let k = 0; k < days; k++) {
  director.hire();
  director.giveProjects(); //yesterday's

  director.addProjects();
  director.giveProjects(); //today's
  webDepartment.distributeProjects();
  mobDepartment.distributeProjects();

  webDepartment.workInProgress();
  mobDepartment.workInProgress();
  qaDepartment.takeProjects();
  qaDepartment.workInProgress();
  director.fire();
}

console.log(
  director.hired + " " + director.fired + " " + director.projectsDone
);
