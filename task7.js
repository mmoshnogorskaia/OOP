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

let statistics = {
  hired:0,
  fired:0,
  projectsDone:0,
  increaseHired(){this.hired++;},
  increaseFired(){this.fired++;},
  increaseProjectsDone(){this.projectsDone++;}
}

class Project {
  constructor(projectDifficulty,projectType) {
    this.projectType = (projectType !== undefined) ? projectType : 'web';
    this.projectDifficulty = (projectDifficulty !== undefined) ? projectDifficulty : 1;
  }
}

class Director {
  constructor() {
    this.allProjects = [];
    //this.departments = [];
  }
  addProjects() {
    let amount = util.getRandomInt(0, 4);
    for (let i = 0; i < amount; i++) {
      let type=util.getRandomInt(0, 1) ? "web" : "mobile";
      let difficulty=util.getRandomInt(1, 3);
      this.allProjects.push(new Project(difficulty,type));
    }
    return this.allProjects;
  }
  giveProjects() {
    function giveProjectsToDepartment(department, type) {
      let projectsLeft = [];
      let p = util.getMatchingObjects(
        director.allProjects,
        "projectType",
        type
      );
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
    giveProjectsToDepartment(webDepartment, "web");
    giveProjectsToDepartment(mobDepartment, "mobile");
    this.allProjects = [];
  }

  hire() {
    function hireByDepartment(department) {
      for (let i = 1; i < department.needDevelopers; i++) {
        department.developers.push(new Developer());
        statistics.increaseHired();
      }
    }
    hireByDepartment(webDepartment);
    hireByDepartment(mobDepartment);
    hireByDepartment(qaDepartment);
  }

  fire() {
    function fireByDepartment(department) {
      department.developers.forEach(function(dev, i, devs) {
        if (dev.daysFree > 3) {
          devs.splice(i, 1);
          statistics.increaseFired();
        }
      });
    }
    fireByDepartment(webDepartment);
    fireByDepartment(mobDepartment);
    fireByDepartment(qaDepartment);
  }
}

let director = new Director();

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
          break; //unable to make forEach with break
        }
      }
      this.projects.shift();
    }
  }
  workInProgress() {
    this.developers.forEach(function(dev) {
      dev.works();
      if (dev.busyDuration === 0) {
        qaDepartment.projectsStack.push(new Project());
      }
    });
  }
}

let webDepartment = new Department();

let mobDepartment = new Department();

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
    this.projectsStack = this.projects.concat(projectsLeft);
  }
};

qaDepartment.workInProgress = function() {
  this.developers.forEach(function(dev) {
    dev.works();
    if (dev.busyDuration === 0) {
      statistics.increaseProjectsDone();
    }
  });
};

class Developer {
  constructor() {
    this.busyDuration = 0; //director.projectsDone++
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

////////////////////////////////////////////////


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
  qaDepartment.distributeProjects();
  qaDepartment.workInProgress();
  director.fire();
}

console.log(statistics.hired+' '+statistics.fired+' '+statistics.projectsDone);
