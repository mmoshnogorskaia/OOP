function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Statistics {
  constructor() {
    this.hired = 0;
    this.projectsDone = 0;
  }
  incHired(amount) {
    this.hired += amount;
  }
  calcFired(currentAmount) {
    this.fired = this.hired - currentAmount; //LAZY INITIALIZATION
  }
  incProjectsDone(currentAmount) {
    this.projectsDone += currentAmount;
  }
}

class Company {  //BUILDER, FACADE
  constructor() {
    this.director = null;
    this.departments = null; //MULTITON
    this.statistics = new Statistics();
    this.client = new Client();
  }
  addDirector(name = "") {
    this.director = new Director(name, this);
    return this.director;
  }
  addDepartments(departmentNames) {
    let departmentType = {
      web: WebDepartment,
      mob: MobDepartment,
      qa: QaDepartment
    };
    this.departments = departmentNames.map(name => new departmentType[name]());
    return this.departments;
  }
  startDay() {
    let needToHireToday = this.departments.reduce(
      (previous, current) => previous + current.needDevs,
      0
    );
    this.statistics.incHired(needToHireToday);
    this.director.hire();
    this.director.getProjects(this.client.createProjects());
    this.director.tryToGiveProjects();
  }

  workInProcess() {
    this.departments.forEach(department => {
      department.assignProjects();
      department.work(); //из всех проектов вычитается 1 день работы
    });
  }
  endDay() {
    let generalDepartments = this.departments.filter(
      department => !(department instanceof QaDepartment)
    );
    generalDepartments.forEach(department =>
      this.director.getProjects(department.sendForTests())
    ); //основные отделы копируют готовые проекты директору для тестирования на следующий день

    let qaDepartment = this.departments.filter(
      department => department instanceof QaDepartment
    )[0];
    this.statistics.incProjectsDone(qaDepartment.projectsDone().length);
    this.departments.forEach(department => department.deleteProjects());
    this.director.fire();
  }
}

class Client {
  //FACTORY
  constructor() {}
  createProjects() {
    //FACTORY METHOD
    let projects = [];
    let projectsAmount = getRandomInt(0, 4);
    while (projectsAmount--) {
      let projectType = getRandomInt(0, 1);
      if (projectType) {
        this.projects.push(new WebProject(getRandomInt(1, 3)));
      } else {
        this.projects.push(new MobProject(getRandomInt(1, 3)));
      }
    }
    return projects;
  }
}

class Project {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.daysLeft = difficulty; //сложность=количество дней работы над проектом
    this.done = false;
    this.devs = [];
  }
  assignDev(dev) {
    dev.getProject();
    this.devs.push(dev);
  }

  work() {
    this.daysLeft--;
    this.devs.forEach(dev => dev.work());
    if (!this.daysLeft) {
      this.devs.forEach(dev => dev.finishWork());
      this.done = true;
    }
  }
  transformForTests() {
    return new QaProject();
  }
}

class WebProject extends Project {}

class MobProject extends Project {}

class QaProject extends Project {
  constructor() {
    super();
    this.daysLeft = 1;
  }
}

class Director { //MEDIATOR
  constructor(name, company) {
    this.name = name;
    this.company = company;
    this.projects = [];
  }
  getProjects(newProjects) {
    this.projects = this.projects.concat(newProjects);
  }
  tryToGiveProjects() {
    let projectsToGive = this.projects;
    this.projects = this.company.departments.reduce(
      //CHAIN OF RESPONSIBILITY
      (prevDep, currDep) => currDep.takeProjects(prevDep),
      projectsToGive
    );
  }
  hire() {
    this.company.departments.forEach(department => department.hire());
  }
  fire() {
    this.company.departments.forEach(department => department.fire());
  }
}

class Department {
  constructor() {
    this.projects = [];
    this.projectsToTest = [];
    this.needDevs = 0;
    this.devs = [];
  }
  freeDevs() {
    return this.devs.filter(dev => dev.free); //массив свободных разработчиков (ресурсы)
  }
  takeProjects(projects) {
    let freeDevsAmount = this.freeDevs().length;
    let matchingProjects = projects.filter(
      project => project instanceof this.typeOfProjects
    );
    let unmatchingProjects = projects.filter(
      project => !(project instanceof this.typeOfProjects)
    );
    let extraProjects = unmatchingProjects.concat(
      matchingProjects.slice(freeDevsAmount)
    ); //лишние проекты, которые возвратим обратно
    this.needDevs =
      matchingProjects.length > freeDevsAmount
        ? matchingProjects.length - freeDevsAmount
        : 0;
    this.projects = this.projects.concat(
      matchingProjects.slice(0, freeDevsAmount)
    ); //берем проекты, на реализацию которых есть ресурсы
    return extraProjects;
  }
  assignProjects() {
    let freeProjects = this.projects.filter(project => !project.devs.length);
    let freeDevs = this.freeDevs();
    freeProjects.forEach((project, i) => {
      //ITERATOR
      project.assignDev(freeDevs[i]);
      freeDevs[i].getProject();
    });
  }
  work() {
    this.projects.forEach(project => project.work());
    this.freeDevs().forEach(dev => dev.beLazy());
  }
  sendForTests() { //ADAPTER
    this.projectsToTest = this.projects.filter(project => project.done);
    this.projects = this.projects.filter(project => !project.done); //неготовые проекты остаются
    this.projectsToTest = this.projectsToTest.map(project =>
      project.transformForTests()
    );
    return this.projectsToTest;
  }
  deleteProjects() {
    this.projects = this.projects.filter(project => !project.done);
  }
  fire() {
    let candidatesForFire = this.devs.filter(dev => dev.freeDays > 3);
    this.devs = this.devs.filter(dev => dev.freeDays <= 3); //тех, кто трудился, оставляем
    candidatesForFire.sort(
      (dev1, dev2) => dev1.projectsDone - dev2.projectsDone
    ); //сортируем кандидатов на увольнение по возрастанию количества выполненных проектов
    candidatesForFire.shift(); //удаляем первого (у него выполнено проектов меньше всех)
    this.devs = this.devs.concat(candidatesForFire); //объединяем массив обратно, но уже без уволенного разработчика
  }
}

class WebDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = WebProject;
  }
  hire() {
    for (let i = 0; i < this.needDevs; i++) {
      this.devs.push(new WebDev());
    }
  }
}

class MobDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = MobProject;
  }
  hire() {
    while (this.needDevs--) {
      this.devs.push(new MobDev());
    }
  }
  assignProjects() {
    let freeProjects = this.projects.filter(project => !project.devs);
    let freeDevs = this.freeDevs();
    if (freeProjects.length == freeDevs.length) {
      super();
    } else {
      let busyDevs = this.devs.filter(dev => !dev.free); //будем помещать сюда тех, кто получил проект
      let amountOfDevs; //выясняем, какому количеству разработчиков можно дать проект
      freeProjects.forEach(project => {
        let amountOfDevsReq = project.difficulty; //над проектом может работать количество разработчиков=сложности
        if ((freeDevs.length - this.projects.length) / amountOfDevsReq > 1) {
          //если разработчиков много, даем проект нескольким
          amountOfDevs = amountOfDevsReq;
        }
        while (amountOfDevs--) { //VISITOR
          let firstDev = freeDevs.shift();
          project.assignDev(firstDev); //назначаем проекту первого разработчика в массиве свободных
          busyDevs.push(firstDev); //переводим разработчика из массива свободных в массив занятых
        }
      });
      this.devs = busyDevs; //перекидываем всех разработчиков обратно в общий массив
    }
  }
}

class QaDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = QaProject;
  }
  hire() {
    for (let i = 0; i < this.needDevs; i++) {
      //while
      this.devs.push(new QaDev());
    }
  }
  getProjectsDone() {
    return this.projects.filter(project => project.done);
  }
}

class Dev {
  constructor() {
    this.free = true;
    this.projectsDone = 0;
    this.freeDays = 0;
  }
  getProject() {
    this.freeDays = 0;
    this.free = false;
  }
  work() {
    this.freeDays = 0;
  }
  finishWork() {
    this.projectsDone++;
    this.free = true;
  }
  beLazy() {
    this.freeDays++;
  }
}

class WebDev extends Dev {}
class MobDev extends Dev {}
class QaDev extends Dev {}

class Simulation { //FACTORY
  constructor(companyName, directorName, departmentsArray) {
    this.company = new Company(companyName);
    this.company.addDirector(directorName);
    this.company.addDepartments(departmentsArray);
    this.statistics = this.company.statistics;
  }
  run(days) {
    while (days--) {
      this.company.startDay(); //FACADE
      this.company.workInProcess();
      this.company.endDay();
    }
  }
  showStats() {
    let allDevs = this.company.departments.reduce(
      (previous, current) => previous + current.devs.length,
      0
    );
    console.log(
      `
      hired: ${this.statistics.hired}
      fired: ${this.statistics.calcFired(allDevs)}
      projects done: ${this.company.projectsDone}`
    );
  }
}

let simulation = new Simulation("creativeGuys", "vasiliy", [
  "web",
  "mob",
  "qa"
]);
/*На вход подается количество дней.
На выходе подробная статистика*/
simulation.run(100); //FACADE
simulation.showStats();
