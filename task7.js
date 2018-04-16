//generating today's objects

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Project {
  constructor(paramString) {
    this.projectType = getRandomInt(0, 1) ? "web" : "mobile";
    this.projectDifficulty = getRandomInt(1, 3);
  }
}

function generateProjects() {
  let projectsToday = [];
  let amountNewProjects = getRandomInt(0, 4);
  for (i = 0; i < amountNewProjects; i++) {
    projectsToday[i] = new Project();
  }
  return projectsToday;
}

console.log(generateProjects());