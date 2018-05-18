const rand = function getRandomIntFromRange(min: number, max: number) {
  return Math.floor(Math.random() * ((max + 1) - min)) + min;
};

class Statistics {
  public projectsDone: number;
  public hired: number;
  constructor() {
    this.hired = 0;
    this.projectsDone = 0;
  }
  incHired(amount: number) {
    this.hired += amount;
    return this.hired;
  }
  calcFired(currentAmount: number) {
    let fired = this.hired - currentAmount;
    return fired;
  }
  incProjectsDone(currentAmount: number) {
    this.projectsDone += currentAmount;
    return this.projectsDone;
  }
}

abstract class Project {
  daysLeft: number;
  done: boolean;
  readonly devs: Array<Dev>;
  constructor(readonly difficulty: number) {
    // сложность=количество дней работы над проектом
    this.daysLeft = difficulty;
    this.done = false;
    this.devs = [];
  }
  assignDev(dev: Dev) {
    dev.getProject();
    this.devs.push(dev);
    return this;
  }

  work() {
    this.daysLeft -= 1;
    this.devs.forEach((dev: Dev) => dev.work());
    if (this.daysLeft === 0) {
      this.devs.forEach((dev: Dev) => dev.finishWork());
      this.done = true;
    }
    return this;
  }
}

class WebProject extends Project {}
class MobProject extends Project {}
class QaProject extends Project {}

class Client {
  public projects: Array<Project>;
  constructor() {
    this.projects = [];
  }
  createProjects() {
    this.projects.length = 0;
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
  private projects: Array<Project>;
  constructor(private readonly name: string, private readonly company: Company) {
    this.projects = [];
  }
  getProjects(newProjects: Array<Project>) {
    this.projects = this.projects.concat(newProjects);
    return this.projects;
  }
  tryToGiveProjects() {
    const projectsToGive = this.projects;
    this.projects = this.company.departments.reduce(
      (prevDep: Array<Project>, currDep: departmentConfig) => currDep.takeProjects(prevDep),
      projectsToGive,
    );
    return this;
  }
  hire() {
    this.company.departments.forEach((department: departmentConfig) => department.hire());
    return this;
  }
  fire() {
    this.company.departments.forEach((department: departmentConfig) => department.fire());
    return this;
  }
}

abstract class Dev {
  public projectsDone: number;
  public free: boolean;
  public freeDays: number;
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

abstract class Department {
  public typeOfProjects: typeof Project;
  protected projects: Array<Project>;
  public devs: Array<Dev>;
  protected projectsToTest: Array<Project>;
  public needDevs: number;
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
  takeProjects(projects: Array<Project>) {
    const freeDevsAmount = this.freeDevs().length;
    const matchingProjects = projects.filter((project: Project) => project instanceof this.typeOfProjects);
    const unmatchingProjects = projects.filter((project: Project) =>
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
    const freeProjects = this.projects.filter((project: Project) => !project.devs.length);
    const freeDevs = this.freeDevs();
    freeProjects.forEach((project: Project, i: number) => {
      project.assignDev(freeDevs[i]);
    });
    return this;
  }
  work() {
    this.projects.forEach((project: Project) => project.work());
    this.freeDevs().forEach((dev: Dev) => dev.beLazy());
    return this;
  }
  sendForTests() {
    this.projectsToTest = this.projects.filter((project: Project) => project.done);

    // неготовые проекты остаются
    this.projects = this.projects.filter((project: Project) => !project.done);
    this.projectsToTest = this.projectsToTest.map(() => new QaProject(1));
    return this.projectsToTest;
  }
  deleteProjects() {
    this.projects = this.projects.filter((project: Project) => !project.done);
    return this.projects;
  }
  fire() {
    const candidatesForFire = this.devs.filter((dev: Dev) => dev.freeDays > 3);

    // тех, кто трудился, оставляем
    this.devs = this.devs.filter((dev: Dev) => dev.freeDays <= 3);

    // сортируем кандидатов на увольнение по возрастанию количества выполненных проектов
    candidatesForFire.sort((dev1: Dev, dev2: Dev) => dev1.projectsDone - dev2.projectsDone);

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
    const freeProjects = this.projects.filter((project: MobProject) => !project.devs.length);
    const freeDevs = this.freeDevs();
    if (freeProjects.length === freeDevs.length) {
      super.assignProjects();
    } else {
      // будем помещать сюда тех, кто получил проект
      const busyDevs = this.devs.filter((dev: MobDev) => !dev.free);

      // выясняем, какому количеству разработчиков можно дать проект
      let amountOfDevs;
      freeProjects.forEach((project: MobProject) => {
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
    return this.projects.filter((project: QaProject) => project.done);
  }
}

interface departmentConfig extends Department{
  hire(): Array<Dev>;
  getProjectsDone(): Array<Project>;
}

class Company {
  public director: Director;
  public departments: Array<departmentConfig>;
  public readonly statistics: Statistics;
  public readonly client: Client;
  constructor(readonly name: string) {
    this.director = null;
    this.departments = null;
    this.statistics = new Statistics();
    this.client = new Client();
  }
  addDirector(name :string = '') {
    this.director = new Director(name, this);
    return this.director;
  }
  addDepartments(departmentNames: Array<string>) {
    const departmentType = {
      web: WebDepartment,
      mob: MobDepartment,
      qa: QaDepartment,
    };
    this.departments = departmentNames.map((name: string) => new departmentType[name]());
    return this.departments;
  }
  startDay() {
    const needToHireToday = this.departments.reduce(
      (previous: number, current: departmentConfig) => previous + current.needDevs,
      0,
    );
    this.statistics.incHired(needToHireToday);
    this.director.hire();
    this.director.getProjects(this.client.createProjects());
    this.director.tryToGiveProjects();
  }

  workInProcess() {
    this.departments.forEach((department: departmentConfig) => {
      department.assignProjects();

      // из всех проектов вычитается 1 день работы
      department.work();
    });
  }
  endDay() {
    const generalDepartments = this.departments.filter((department: departmentConfig) =>
      !(department instanceof QaDepartment));

    // основные отделы копируют готовые проекты директору для тестирования на следующий день
    generalDepartments.forEach((department: departmentConfig) =>
      this.director.getProjects(department.sendForTests()));

    const qaDepartment = this.departments.filter((department: departmentConfig) =>
      department instanceof QaDepartment)[0];
    this.statistics.incProjectsDone(qaDepartment.getProjectsDone().length);
    this.departments.forEach((department: departmentConfig) => department.deleteProjects());
    this.director.fire();
    return this;
  }
}

class Simulation {
  private company: Company;
  private statistics: Statistics;
  constructor(companyName: string, directorName: string, departmentsArray: Array<string>) {
    this.company = new Company(companyName);
    this.company.addDirector(directorName);
    this.company.addDepartments(departmentsArray);
    this.statistics = this.company.statistics;
  }
  run(days: number) {
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
      (previous: number, current: departmentConfig) => previous + current.devs.length,
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
