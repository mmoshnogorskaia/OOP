function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/*На выходе подробная статистика:
Количество реализованных проектов,
нанятых и уволенных программистов. */
class Statistics {
  constructor(company) {
    this.company = company; //delete
    this.hired = 0;
    this.fired = 0;
    this.projectsDone = 0;
  }
  incHired() {
    this.hired++;
  }
  incLeaved() {
    this.fired++;
  }
  incProjectsDone() {
    this.projectsDone++;
  }
}
/*В фирме есть директор
В фирме также есть отделы*/
class Company {
  constructor() {
    this.director = null;
    this.departments = null;
    this.statistics = null; //delete
  }
  addStatistics(){
    this.statistics=new Statistics();
    return this.statistics;
  }
  addDirector(name = "") {
    this.director = new Director(name, this);
    return this.director;
  }
  addDepartments(departmentNames) {
    this.departments = departmentNames.map(name => {  //свернуть повторы в функцию
      switch (name) {
        case "web":
          return new WebDepartment();
        case "mobile":
          return new MobDepartment();
        case "qa":
          return new QaDepartment();
        default:
          return new Department(name);
      }
    });
  }
  workflow() {
    this.director.hire(); //утром директор нанимает сотрудников
    this.director.getProjects();
    this.director.tryToGiveProjects();
    this.departments = this.departments.map(department => {
      //все отделы работают над своими проектами
      department.assignProjects();
      department.work(); //в результате работы у основных отделов проект продвигается, а у тестировщиков-тестируется и удаляется
    });
    let generalDepartments = this.departments.filter(
      department => !(department instanceof QaDepartment)
    );
    generalDepartments.map(department => department.sendForTests()); //основные отделы отправляют готовые проекты директору для тестирования на следующий день
    this.director.fire(); //вечером директор увольняет сотрудников
  }
}
/*Каждый день директор может получить новые проекты от клиента*/
class Client {
  constructor() {
    this.projects = [];
  }
}
/*Каждый день директор может получить от 0 до 4 новых проектов
одного из 2 типов (Веб/мобильный),
каждый из которых может быть трех уровней сложности.*/
class UpworkClient extends Client {
  makeProjects() {
    let projectsAmount = getRandomInt(0, 4);
    for (let i = 0; i < projectsAmount; i++) {
      let projectType = getRandomInt(0, 1);
      if (projectType) {
        this.projects.push(new WebProject(getRandomInt(1, 3)));
      } else {
        this.projects.push(new MobProject(getRandomInt(1, 3)));
      }
    }
  }
}
/*проекты одного из 2 типов (Веб/мобильный),
каждый из которых имеет уровень сложности*/
class Project {
  constructor(difficulty) {
    this.difficulty = difficulty; //сложность соответствует необходимому количеству дней работы над проектом
    this.done = false; //проект может иметь два состояния: готов и не готов
    this.devs = [];
  }
  assignDev(dev) {
    this.devs.push(dev);
  }

  work() {
    this.difficulty--; //количество оставшихся дней работы уменьшается
    if (!this.difficulty) {
      dev.finishWork();
      this.done = true;
    } //если дней работы не осталось, проект готов
  }
  prepareForTests() {
    this.difficulty = 1;
    this.done = false;
    this.devs = [];
  }
}

/*веб программисты получают по 1 проекту на реализацию*/
class WebProject extends Project {}
/*мобильные могут работать на 1 проекте вдвоем или втроем
если сложность проекта 2 или 3 соответственно.*/
class MobProject extends Project {}

class QaProject extends Project {} //проекты, с которыми работает QA отдел

/*В фирме есть директор, который отвечает за набор сотрудников
и получение новых проектов.
Полученные проекты директор пытается передать в отделы учитывая их специализацию.
оставшиеся проекты остаются у директора на следующий день.
На следующий день директор нанимает необходимое количество программистов 
*/
class Director {
  constructor(name, company) {
    this.name = name;
    this.company = company;
    this.projects = [];
    this.client = {};
  }
  getProjects() {
    this.client = new UpworkClient();
    this.client.makesProjects();
    this.projects = this.projects.concat(this.client.projects);
  }
  tryToGiveProjects() {
    this.company.departments.forEach(
      department =>
        (this.projects = this.projects.concat(
          department.takeProjects(this.projects)
        ))
    ); //пытается отдать проекты в отделы, оставшиеся остаются на следующий день
  }
  hire() {
    this.company.departments.forEach(department => department.hire()); //дает отделам команду нанять  map?
  }
  fire() {
    this.company.departments.forEach(department => department.fire()); //дает отделам команду уволить map?
  }
}

/*В фирме также есть 3 отдела
В случае если в отделе недостаточно работников,
то отдел принимает только проекты на реализацию которых есть ресурсы,
а оставшиеся проекты остаются у директора на следующий день.*/
class Department {
  constructor(name = "") {
    this.name = name;
    this.projects = [];
    this.projectsToTest = [];
    this.needDevs = 0;
    this.devs = [];
  }
  takeProjects(projects) {
    let matchingProjects = projects.filter(
      project => project instanceof this.typeOfProjects
    ); //выделяем из массива всех проектов подходящие по типу
    let freeDevs = this.devs.filter(dev => dev.free); //массив свободных разработчиков (ресурсы)
    let extraProjects = matchingProjects.slice(freeDevs.length); //лишние проекты возвращаем обратно
    this.needDevs = extraProjects.length;
    this.projects = this.projects.concat(
      matchingProjects.slice(0, freeDevs.length - 1)
    ); //берем проекты, на реализацию которых есть ресурсы
    return extraProjects;
  }
  assignProjects() {
    this.projects.forEach(project => {
      //для каждого проекта
      for (let i = 0; i < this.devs.length; i++) {
        //ищем одного свободного разработчика
        if (this.devs[i].free) {
          project.assignDev(this.devs[i]); //назначаем проекту разработчика
          this.dev[i].getProject(); //и у разработчика указываем, что он занят
          break;
        }
      }
    });
  }
  work() {
    this.projects = this.projects.map(project => project.work());
  } //проходит работа над всеми проектами
  sendForTests() {
    this.projectsToTests = this.projects.filter(project => project.done); //готовые проекты откладываем для тестирования
    this.projects = this.projects.filter(project => !project.done); //а неготовые остаются
  }
  fire() {
    this.devs.sort((dev1, dev2) => dev1.projectsDone - dev2.projectsDone); //сортируем разработчиков по возрастанию количества выполненных проектов
    for (let i = 0; i < this.devs.length; i++) {
      //ищем одного бездельника и удаляем
      if (this.dev[i].freeDays > 3) {
        this.devs.shift();
        break;
      }
    }
  }
}
/*есть 3 отдела: веб отдел, мобильный отдел и отделтестирования*/
class WebDepartment extends Department {
  constructor() {
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
    this.typeOfProjects = MobProject;
  }
  hire() {
    for (let i = 0; i < this.needDevs; i++) {
      this.devs.push(new MobDev());
    }
  }
  assignProjects() {
    let emptyProjects=this.projects.filter(project=>!project.devs); //find free projects
    emptyProjects.forEach(project => {  //для каждого проекта
      let freeDevs = this.devs.filter(dev => dev.free); //массив свободных разработчиков
      let amountOfDevs = 1; //выясняем, какому количеству разработчиков можно дать проект, по умолчанию над проектом работает 1 разработчик
      let amountOfDevsReq=project.difficulty;  //для ясности кода
      if ((freeDevs.length - this.projects.length) / amountOfDevsReq >= 1) {
        //а если разработчиков слишком много, то мы даем проект нескольким
        amountOfDevs = amountOfDevsReq;
      }

      for (let i = 0; i < amountOfDevs; i++) {        //количество разработчиков на 1 проект рассчитано, теперь раздаем проекты
        for (let j = 0; j < this.devs.length; j++) {
          //ищем одного свободного разработчика
          if (this.devs[j].free) {
            project.assignDev(this.devs[i]); //назначаем проекту разработчика
            this.dev[i].getProject(); //и у разработчика указываем, что он занят
            break;
          } // ищем еще разработчика, повтор
        }
      }
    });
  }
}

class QaDepartment extends Department {
  //работает с проектами projectsToTest
  constructor() {
    this.typeOfProjects = QaProject;
  }
  hire() {
    for (i = 0; i < this.needDevs; i++) { //while
      this.devs.push(new QaDev());
    }
  }
}

class Dev {
  constructor() {
    this.free = true;
    this.projectsDone = 0;
    this.freeDays = 0;
    //this.department=department;
  }
  getProject() {
    this.freeDays = 0;
    this.free = false;
  }
  finishWork() {
    this.projectsDone++;
    this.free = true;
  }
  beLazy() {
    this.freeDays++;
  }
}
/*В фирме также есть 3 отдела в которых могут работать только соответственно
веб разработчики, мобильные разработчики и QA специалисты*/
class WebDev extends Dev {}
class MobDev extends Dev {}
class QaDev extends Dev {}

/*На вход подается количество дней.
На выходе подробная статистика:
Количество реализованных проектов, нанятых и уволенных программистов.
Начальные условия: в фирме нет проектов и нет программистов.*/
class Simulation {
  constructor(companyName, directorName, departmentsArray) {
    this.company = new Company(companyName);
    this.director = this.company.addDirector(directorName);
    this.departments =  this.company.addDepartments(this.departments);
    this.stats = this.company.addStatistics();
  }  
  }
  run(days) {
    for (let i = 0; i < days; i++) {
      this.company.workflow();
    }
    console.log(
      this.stats.hired + " " + this.stats.fired + "" + this.stats.projectsDone
    );
  }
}

let simulation = new Simulation("creativeGuys", "vasiliy", [
  "web",
  "mob",
  "qa"
]);
simulation.init();
/*На вход подается количество дней.
На выходе подробная статистика*/
simulation.run(10);