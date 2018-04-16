//generating today's objects

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Project {
  constructor() {
    this.projectType = getRandomInt(0, 1) ? "web" : "mobile";
    this.projectDifficulty = getRandomInt(1, 3);
  }
}

let projectsToday=[];

class Director {
  generateProjects() {
   let amountNewProjects = getRandomInt(0, 4);
    for (let i = 0; i < amountNewProjects; i++) {
    projectsToday[i] = new Project();
  }
  return projectsToday;
}
}

let director= new Director();
console.log(director.generateProjects());