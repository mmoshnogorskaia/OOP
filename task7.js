function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/*На выходе подробная статистика:
Количество реализованных проектов,
нанятых и уволенных программистов. */
class Statistics {
  constructor() {
    this.hired = 0;
    this.fired = 0;
    this.projectsDone = 0;
  }
  incHired(amount) {
    this.hired+=amount;
  }
  setFired(currentAmount) {
    this.fired=this.hired-currentAmount;
  }
  incProjectsDone(currentAmount) {
    this.projectsDone+=currentAmount;
  }
}
/*В фирме есть директор
В фирме также есть отделы*/
class Company {
  constructor() {
    this.director = null;
    this.departments = null;
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
  workflow() {
    let needToHireToday=this.departments.reduce((previous,current)=>previous+current.needDevs,0);
    this.statistics.incHired(needToHireToday);
    this.director.hire(); //утром директор нанимает сотрудников
    this.director.getProjects(this.client.makeProjects());
    this.director.tryToGiveProjects();
    this.departments.forEach(department => {
      //все отделы работают над своими проектами
      department.assignProjects();
      department.work(); //проходит 1 день работы над проектами
          });
    let generalDepartments = this.departments.filter(  //разделяем отделы на основные и QA отдел
      department => !(department instanceof QaDepartment)
    );
    let qaDepartment=this.departments.filter(department=>department instanceof QaDepartment)[0];
    generalDepartments.forEach(department => this.director.getProjects(department.sendForTests())); //основные отделы отправляют готовые проекты директору для тестирования на следующий день
    let projectsDoneToday = qaDepartment.projects.filter(project=>project.done).length;
    this.statistics.incProjectsDone(projectsDoneToday);
    this.director.fire(); //вечером директор увольняет сотрудников
    let allDevs=this.departments.reduce((previous,current)=>previous+current.devs.length,0); //считаем количество всех разработчиков в компании
    this.statistics.setFired(allDevs); //считаем количество уволенных
  }
}
/*Каждый день директор может получить новые проекты от клиента*/
class Client {
  constructor() {
    this.projects = [];
  }
  makeProjects() {
    this.projects = [];
    let projectsAmount = getRandomInt(0, 4);
    for (let i = 0; i < projectsAmount; i++) {
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
      this.devs.forEach(dev=>dev.finishWork());
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

class QaProject extends Project {} //проекты, с которыми будет работать QA отдел

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
  }
  getProjects(newProjects) {
    this.projects = this.projects.concat(newProjects);
  }
  tryToGiveProjects() {
    let projectsToGive=this.projects;
    this.projects=[];
    this.company.departments.forEach(
      department =>
        (this.projects = this.projects.concat(
          department.takeProjects(projectsToGive)
        ))
    ); //пытается отдать проекты в отделы, оставшиеся остаются на следующий день
  }
  hire() {
    this.company.departments.forEach(department => department.hire()); //дает отделам команду нанять
  }
  fire() {
    this.company.departments.forEach(department => department.fire()); //дает отделам команду уволить
  }
}

/*В фирме также есть 3 отдела
В случае если в отделе недостаточно работников,
то отдел принимает только проекты на реализацию которых есть ресурсы,
а оставшиеся проекты остаются у директора на следующий день.*/
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
    let matchingProjects = projects.filter(
      project => project instanceof this.typeOfProjects
    ); //выделяем из массива всех проектов подходящие по типу
    let unmatchingProjects=projects.filter(project => !(project instanceof this.typeOfProjects));//оставшиеся проекты сохранаем на потом
    let extraProjects = unmatchingProjects.concat(matchingProjects.slice(this.freeDevs().length)); //лишние проекты возвращаем обратно
    this.needDevs = extraProjects.length;
    this.projects = this.projects.concat(
      matchingProjects.slice(0, this.freeDevs().length)
    ); //берем проекты, на реализацию которых есть ресурсы
    return extraProjects;
  }
  assignProjects() {
    let freeProjects = this.projects.filter(project => !project.devs); //разбиваем массив проектов на два
    let projectsInWork = this.projects.filter(project => project.devs);
    let freeDevs = this.freeDevs(); //также разбиваем массив разработчиков на два
    let busyDevs = this.devs.filter(dev => !dev.free);
    freeProjects.forEach((project, i) => {
      project[i].assignDev(freeDevs[i]); //назначаем проекту разработчика
      freeDevs[i].getProject(); //и у разработчика указываем, что он занят
    });
    this.projects = projectsInWork.concat(freeProjects); //обратно собираем массив проектов
    this.devs = busyDevs.concat(freeDevs); //и массив разработчиков
  }
  work() {
    this.projects = this.projects.map(project => project.work());
  } //проходит работа над всеми проектами
  sendForTests() {
    this.projectsToTest = this.projects.filter(project => project.done); //готовые проекты откладываем для тестирования
    this.projects = this.projects.filter(project => !project.done); //а неготовые остаются
    return this.projectsToTest;
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
    for (let i = 0; i < this.needDevs; i++) {
      this.devs.push(new MobDev());
    }
  }
  assignProjects() {
    let freeProjects = this.projects.filter(project => !project.devs); //разбиваем массив проектов на два
    let projectsInWork = this.projects.filter(project => project.devs); 
    let freeDevs = this.freeDevs();
    let busyDevs = this.devs.filter(dev => !dev.free); //сохраняем массив занятых разработчиков, чтобы помещать туда тех, кто получил проект
    let amountOfDevs = 1; //по умолчанию над проектом работает 1 разработчик
    freeProjects.forEach((project) => {
              //выясняем, какому количеству разработчиков можно дать проект 
      let amountOfDevsReq = project.difficulty; //над проектом может работать количество разработчиков, соответствующее его сложности
      if ((freeDevs.length - this.projects.length) / amountOfDevsReq >= 1) {
        //а если разработчиков слишком много, то мы даем проект нескольким
        amountOfDevs = amountOfDevsReq;
      }      
        //количество разработчиков на 1 проект рассчитано, теперь раздаем проекты
          while(amountOfDevs){
            project.assignDev(freeDevs[0]); //назначаем проекту первого разработчика в массиве свободных
            freeDevs[0].getProject(); //и у разработчика указываем, что он занят
            busyDevs.push(freeDevs[0]); //переводим разработчика из массива свободных в массив занятых
            freeDevs.shift();
            amountOfDevs--;
          }
        }
    );
    this.projects = projectsInWork.concat(freeProjects); //обратно собираем массив проектов
    this.devs=busyDevs; //перекидываем всех разработчиков обратно в общий массив
  }
}

class QaDepartment extends Department {
  //работает с проектами projectsToTest
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
    this.departments = this.company.addDepartments(departmentsArray);
    this.stats = this.company.statistics;
  }
  run(days) {
    while (days) {
      this.company.workflow()
      days--;
    }
    console.log(
      `hired: ${this.company.statistics.hired}
      fired: ${this.company.statistics.fired}
      projects done: ${this.company.statistics.projectsDone}`
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
simulation.run(2);
