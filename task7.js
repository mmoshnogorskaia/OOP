const rand = function getRandomIntFromRange(min, max) {
  return Math.floor(Math.random() * ((max + 1) - min)) + min;
};

class Statistics {
  constructor() {
    this.hired = 0;
    this.projectsDone = 0;
  }
  incHired(amount) {
    this.hired += amount;
    return this.hired;
  }
  calcFired(currentAmount) {
    this.fired = this.hired - currentAmount;
    return this.fired;
  }
  incProjectsDone(currentAmount) {
    this.projectsDone += currentAmount;
    return this.projectsDone;
  }
}

class Project {
  constructor(difficulty) {
    this.difficulty = difficulty;

    // сложность=количество дней работы над проектом
    this.daysLeft = difficulty;
    this.done = false;
    this.devs = [];
  }
  assignDev(dev) {
    dev.getProject();
    this.devs.push(dev);
    return this;
  }

  work() {
    this.daysLeft -= 1;
    this.devs.forEach(dev => dev.work());
    if (this.daysLeft === 0) {
      this.devs.forEach(dev => dev.finishWork());
      this.done = true;
    }
    return this;
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

class Client {
  constructor() {
    this.projects = [];
  }
  createProjects() {
    this.projects = [];
    let projectsAmount = rand(0, 4);
    while (projectsAmount > 0) {
      const projectType = rand(0, 1);
      if (projectType === 0) {
        this.projects.push(new WebProject(rand(1, 3)));
      } else {
        this.projects.push(new MobProject(rand(1, 3)));
      }
      projectsAmount -= 1;
    }
    return this.projects;
  }
}

class Director {
  constructor(name, company) {
    this.name = name;
    this.company = company;
    this.projects = [];
  }
  getProjects(newProjects) {
    this.projects = this.projects.concat(newProjects);
    return this.projects;
  }
  tryToGiveProjects() {
    const projectsToGive = this.projects;
    this.projects = this.company.departments.reduce(
      (prevDep, currDep) => currDep.takeProjects(prevDep),
      projectsToGive,
    );
    return this;
  }
  hire() {
    this.company.departments.forEach(department => department.hire());
    return this;
  }
  fire() {
    this.company.departments.forEach(department => department.fire());
    return this;
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
    return this;
  }
  work() {
    this.freeDays = 0;
    return this;
  }
  finishWork() {
    this.projectsDone += 1;
    this.free = true;
    return this;
  }
  beLazy() {
    this.freeDays += 1;
    return this;
  }
}

class WebDev extends Dev {}
class MobDev extends Dev {}
class QaDev extends Dev {}

class Department {
  constructor() {
    this.projects = [];
    this.projectsToTest = [];
    this.needDevs = 0;
    this.devs = [];
  }
  freeDevs() {
    // массив свободных разработчиков (ресурсы)
    return this.devs.filter(dev => dev.free);
  }
  takeProjects(projects) {
    const freeDevsAmount = this.freeDevs().length;
    const matchingProjects = projects.filter(project => project instanceof this.typeOfProjects);
    const unmatchingProjects = projects.filter(project =>
      !(project instanceof this.typeOfProjects));

    // лишние проекты, которые возвратим обратно
    const extraProjects = unmatchingProjects
      .concat(matchingProjects.slice(freeDevsAmount));
    this.needDevs =
      matchingProjects.length > freeDevsAmount
        ? matchingProjects.length - freeDevsAmount
        : 0;

    // берем проекты, на реализацию которых есть ресурсы
    this.projects = this.projects
      .concat(matchingProjects.slice(0, freeDevsAmount));
    return extraProjects;
  }
  assignProjects() {
    const freeProjects = this.projects.filter(project => !project.devs.length);
    const freeDevs = this.freeDevs();
    freeProjects.forEach((project, i) => {
      project.assignDev(freeDevs[i]);
    });
    return this;
  }
  work() {
    this.projects.forEach(project => project.work());
    this.freeDevs().forEach(dev => dev.beLazy());
    return this;
  }
  sendForTests() {
    this.projectsToTest = this.projects.filter(project => project.done);

    // неготовые проекты остаются
    this.projects = this.projects.filter(project => !project.done);
    this.projectsToTest = this.projectsToTest.map(() => new QaProject());
    return this.projectsToTest;
  }
  deleteProjects() {
    this.projects = this.projects.filter(project => !project.done);
    return this.projects;
  }
  fire() {
    const candidatesForFire = this.devs.filter(dev => dev.freeDays > 3);

    // тех, кто трудился, оставляем
    this.devs = this.devs.filter(dev => dev.freeDays <= 3);

    // сортируем кандидатов на увольнение по возрастанию количества выполненных проектов
    candidatesForFire.sort((dev1, dev2) => dev1.projectsDone - dev2.projectsDone);

    // удаляем первого (у него выполнено проектов меньше всех)
    candidatesForFire.shift();

    // объединяем массив обратно, но уже без уволенного разработчика
    this.devs = this.devs.concat(candidatesForFire);
    return this.devs;
  }
}

class WebDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = WebProject;
  }
  hire() {
    for (let i = 0; i < this.needDevs; i += 1) {
      this.devs.push(new WebDev());
    }
    return this.devs;
  }
}

class MobDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = MobProject;
  }
  hire() {
    while (this.needDevs > 0) {
      this.devs.push(new MobDev());
      this.needDevs -= 1;
    }
    return this.devs;
  }
  assignProjects() {
    const freeProjects = this.projects.filter(project => !project.devs.length);
    const freeDevs = this.freeDevs();
    if (freeProjects.length === freeDevs.length) {
      super.assignProjects();
    } else {
      // будем помещать сюда тех, кто получил проект
      const busyDevs = this.devs.filter(dev => !dev.free);

      // выясняем, какому количеству разработчиков можно дать проект
      let amountOfDevs;
      freeProjects.forEach((project) => {
        // над проектом может работать количество разработчиков=сложности
        const amountOfDevsReq = project.difficulty;
        if ((freeDevs.length - this.projects.length) / amountOfDevsReq > 1) {
          // если разработчиков много, даем проект нескольким
          amountOfDevs = amountOfDevsReq;
        }
        while (amountOfDevs > 0) { // VISITOR
          const firstDev = freeDevs.shift();

          // назначаем проекту первого разработчика в массиве свободных
          project.assignDev(firstDev);

          // переводим разработчика из массива свободных в массив занятых
          busyDevs.push(firstDev);
          amountOfDevs -= 1;
        }
      });

      // перекидываем всех разработчиков обратно в общий массив
      this.devs = busyDevs;
    }
    return this;
  }
}

class QaDepartment extends Department {
  constructor() {
    super();
    this.typeOfProjects = QaProject;
  }
  hire() {
    while (this.needDevs > 0) {
      this.devs.push(new QaDev());
      this.needDevs -= 1;
    }
    return this.devs;
  }
  getProjectsDone() {
    return this.projects.filter(project => project.done);
  }
}

class Company {
  constructor() {
    this.director = null;
    this.departments = null;
    this.statistics = new Statistics();
    this.client = new Client();
  }
  addDirector(name = '') {
    this.director = new Director(name, this);
    return this.director;
  }
  addDepartments(departmentNames) {
    const departmentType = {
      web: WebDepartment,
      mob: MobDepartment,
      qa: QaDepartment,
    };
    this.departments = departmentNames.map(name => new departmentType[name]());
    return this.departments;
  }
  startDay() {
    const needToHireToday = this.departments.reduce(
      (previous, current) => previous + current.needDevs,
      0,
    );
    this.statistics.incHired(needToHireToday);
    this.director.hire();
    this.director.getProjects(this.client.createProjects());
    this.director.tryToGiveProjects();
  }

  workInProcess() {
    this.departments.forEach((department) => {
      department.assignProjects();

      // из всех проектов вычитается 1 день работы
      department.work();
    });
  }
  endDay() {
    const generalDepartments = this.departments.filter(department =>
      !(department instanceof QaDepartment));

    // основные отделы копируют готовые проекты директору для тестирования на следующий день
    generalDepartments.forEach(department =>
      this.director.getProjects(department.sendForTests()));

    const qaDepartment = this.departments.filter(department =>
      department instanceof QaDepartment)[0];
    this.statistics.incProjectsDone(qaDepartment.getProjectsDone().length);
    this.departments.forEach(department => department.deleteProjects());
    this.director.fire();
    return this;
  }
}

class Simulation {
  constructor(companyName, directorName, departmentsArray) {
    this.company = new Company(companyName);
    this.company.addDirector(directorName);
    this.company.addDepartments(departmentsArray);
    this.statistics = this.company.statistics;
  }
  run(days) {
    let daysAmount = days;
    while (daysAmount > 0) {
      this.company.startDay();
      this.company.workInProcess();
      this.company.endDay();
      daysAmount -= 1;
    }
    return this;
  }
  showStats() {
    const allDevs = this.company.departments.reduce(
      (previous, current) => previous + current.devs.length,
      0,
    );
    return {
      hired: this.statistics.hired,
      fired: this.statistics.calcFired(allDevs),
      'projects done': this.statistics.projectsDone,
    };
  }
}

const simulation = new Simulation('creativeGuys', 'vasiliy', [
  'web',
  'mob',
  'qa',
]);

/*
* На вход подается количество дней.
* На выходе подробная статистика
*/
simulation.run(100);
console.log(simulation.showStats());
