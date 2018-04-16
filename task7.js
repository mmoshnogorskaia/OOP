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

const director = {
  allProjects: [],
  addProjects() {
    const amount = getRandomInt(0, 4);
    for (let i = 0; i < amount; i++) {
      this.allProjects.push(new Project());
    }
    return this.allProjects;
  },
  hireDevs: function() {},
  fireDevs: function() {}
};

//1 day

director.addProjects();
console.log(director.allProjects);