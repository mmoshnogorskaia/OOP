function getRandomInt(min, max) {  //SERVANT
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

class Statistics { //MEMENTO
  constructor() {
    this.hired = 0;
    this.projectsDone = 0;
  }
  incHired(amount) {
    this.hired += amount;
  }
  calcFired(currentAmount) {
    this.fired = this.hired - currentAmount;
  }
  incProjectsDone(currentAmount) {
    this.projectsDone += currentAmount;
  }
}

class Company { //BUILDER
  constructor() {
    this.director = null;
    this.departments = null;  //MULTITON
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
  startDay() {   //FABRIC METHOD
    let needToHireToday = this.departments.reduce(
      (previous, current) => previous + current.needDevs,
      0
    );
    this.statistics.incHired(needToHireToday);
    this.director.hire();
    this.director.getProjects(this.client.makeProjects());
    this.director.tryToGiveProjects();
  }

  workInProcess() {  //FABRIC METHOD
    this.departments.forEach(department => {  
      department.assignProjects();
      department.work(); //из всех проектов вычитается 1 день работы
    });
  }
  endDay() {  //FABRIC METHOD
    let generalDepartments = this.departments.filter(  
      department => !(department instanceof QaDepartment)
    );
    generalDepartments.forEach(department =>   //SPECIFICATION
      this.director.getProjects(department.sendForTests())
    ); //основные отделы копируют готовые проекты директору для тестирования на следующий день

    let qaDepartment = this.departments.filter(  //SPECIFICATION
      department => department instanceof QaDepartment
    )[0];
    let projectsDoneToday = qaDepartment.projects.filter(
      project => project.done
    );
    this.statistics.incProjectsDone(projectsDoneToday.length);
    this.departments.forEach(department => department.deleteProjects());
    this.director.fire();    
  }
}

class Client { //BUILDER
  constructor() {
    this.projects = []; //OBJECT PULL
  }
  makeProjects() {  
    this.projects = [];
    let projectsAmount = getRandomInt(0, 4);
    while (projectsAmount--) {
      let projectType = getRandomInt(0, 1);
      if (projectType) {
        this.projects.push(new WebProject(getRandomInt(1, 3)));
      } else {
        this.projects.push(new MobProject(getRandomInt(1, 3)));
      }
    }
    return this.projects;
  }
}

class Project { //PROTOTYPE
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.daysLeft = difficulty; //сложность=количество дней работы над проектом
    this.done = false;  //STATE
    this.devs = []; //OBJECT PULL, STATE
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

class WebProject extends Project {} //PROTOTYPE

class MobProject extends Project {} //PROTOTYPE

class QaProject extends Project {  //PROTOTYPE
  constructor() {
    super();
    this.daysLeft = 1;
  }
}

class Director {  //MEDIATOR
  constructor(name, company) {
    this.name = name;
    this.company = company;
    this.projects = []; //OBJECT PULL
  }
  getProjects(newProjects) {
    this.projects = this.projects.concat(newProjects);
  }
  tryToGiveProjects() {
    let projectsToGive = this.projects;
    this.projects = this.company.departments.reduce(    //CHAIN OF RESPONSIBILITY
      (prevDep, currDep) => currDep.takeProjects(prevDep),
      projectsToGive
    );
  }
  hire() {
    this.company.departments.forEach(department => department.hire()); //DEPENDENCY INJECTION
  }
  fire() {
    this.company.departments.forEach(department => department.fire()); //DEPENDENCY INJECTION
  }
}

class Department {  //PROTOTYPE
  constructor() {
    this.projects = []; //OBJECT PULL
    this.projectsToTest = []; //OBJECT PULL
    this.needDevs = 0;
    this.devs = []; //OBJECT PULL
  }
  freeDevs() {
    return this.devs.filter(dev => dev.free); //массив свободных разработчиков (ресурсы) //SPECIFICATION
  }
  takeProjects(projects) {
    let freeDevsAmount=this.freeDevs().length;
    let matchingProjects = projects.filter(  //SPECIFICATION
      project => project instanceof this.typeOfProjects
    );
    let unmatchingProjects = projects.filter(  //SPECIFICATION
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
    let freeProjects = this.projects.filter(project => !project.devs.length); //SPECIFICATION
    let freeDevs = this.freeDevs();
    freeProjects.forEach((project, i) => {  //ITERATOR
      project.assignDev(freeDevs[i]);
      freeDevs[i].getProject();
    });
  }
  work() {
    this.projects.forEach(project => project.work());
    this.freeDevs().forEach(dev => dev.beLazy());
  }
  sendForTests() {
    this.projectsToTest = this.projects.filter(project => project.done); //SPECIFICATION
    this.projects = this.projects.filter(project => !project.done); //неготовые проекты остаются
    this.projectsToTest = this.projectsToTest.map(project =>
      project.transformForTests()
    );
    return this.projectsToTest;
  }
  deleteProjects() {
    this.projects = this.projects.filter(project => !project.done); //SPECIFICATION
  }
  fire() {
    let candidatesForFire = this.devs.filter(dev => dev.freeDays > 3); //SPECIFICATION
    this.devs = this.devs.filter(dev => dev.freeDays <= 3); //тех, кто трудился, оставляем
    candidatesForFire.sort(
      (dev1, dev2) => dev1.projectsDone - dev2.projectsDone
    ); //сортируем кандидатов на увольнение по возрастанию количества выполненных проектов
    candidatesForFire.shift(); //удаляем первого (у него выполнено проектов меньше всех)
    this.devs = this.devs.concat(candidatesForFire); //объединяем массив обратно, но уже без уволенного разработчика
  }
}

class WebDepartment extends Department { //PROTOTYPE
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

class MobDepartment extends Department { //PROTOTYPE
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
    let freeProjects = this.projects.filter(project => !project.devs); //SPECIFICATION
    let freeDevs = this.freeDevs();
    let busyDevs = this.devs.filter(dev => !dev.free); //будем помещать сюда тех, кто получил проект  //SPECIFICATION
    let amountOfDevs = 1; //обычно над проектом работает 1 разработчик
    freeProjects.forEach(project => {  //STRATEGY
      //выясняем, какому количеству разработчиков можно дать проект
      let amountOfDevsReq = project.difficulty; //над проектом может работать количество разработчиков=сложности
      if ((freeDevs.length - this.projects.length) / amountOfDevsReq >= 1) {
        //если разработчиков много, то даем проект нескольким
        amountOfDevs = amountOfDevsReq;
      }
      while (amountOfDevs--) {  //HIERARCHICAL VISITOR
        let firstDev=freeDevs.shift();
        project.assignDev(firstDev); //назначаем проекту первого разработчика в массиве свободных
        busyDevs.push(firstDev); //переводим разработчика из массива свободных в массив занятых
      }
    });
    this.devs = busyDevs; //перекидываем всех разработчиков обратно в общий массив
  }
}

class QaDepartment extends Department { //PROTOTYPE
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
}

class Dev {  //PROTOTYPE
  constructor() {
    this.free = true; //STATE
    this.projectsDone = 0; //STATE
    this.freeDays = 0; //STATE
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

class WebDev extends Dev {} //PROTOTYPE
class MobDev extends Dev {} //PROTOTYPE
class QaDev extends Dev {} //PROTOTYPE

class Simulation {  //FABRIC
  constructor(companyName, directorName, departmentsArray) { //INTERPRETER
    this.company = new Company(companyName);
    this.company.addDirector(directorName);
    this.company.addDepartments(departmentsArray);
    this.statistics=this.company.statistics;
  }
  run(days) {
    while (days--) {
      this.company.startDay();
      this.company.workInProcess();
      this.company.endDay();
      }
    
  }
  showStats(){
    let allDevs = this.company.departments.reduce(  //LAZY INITIALIZATION
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
