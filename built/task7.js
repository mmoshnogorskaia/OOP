var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var rand = function getRandomIntFromRange(min, max) {
    return Math.floor(Math.random() * ((max + 1) - min)) + min;
};
var Statistics = /** @class */ (function () {
    function Statistics() {
        this.hired = 0;
        this.projectsDone = 0;
    }
    Statistics.prototype.incHired = function (amount) {
        this.hired += amount;
        return this.hired;
    };
    Statistics.prototype.calcFired = function (currentAmount) {
        var fired = this.hired - currentAmount;
        return fired;
    };
    Statistics.prototype.incProjectsDone = function (currentAmount) {
        this.projectsDone += currentAmount;
        return this.projectsDone;
    };
    return Statistics;
}());
var Project = /** @class */ (function () {
    function Project(difficulty) {
        this.difficulty = difficulty;
        // сложность=количество дней работы над проектом
        this.daysLeft = difficulty;
        this.done = false;
        this.devs = [];
    }
    Project.prototype.assignDev = function (dev) {
        dev.getProject();
        this.devs.push(dev);
        return this;
    };
    Project.prototype.work = function () {
        this.daysLeft -= 1;
        this.devs.forEach(function (dev) { return dev.work(); });
        if (this.daysLeft === 0) {
            this.devs.forEach(function (dev) { return dev.finishWork(); });
            this.done = true;
        }
        return this;
    };
    return Project;
}());
var WebProject = /** @class */ (function (_super) {
    __extends(WebProject, _super);
    function WebProject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return WebProject;
}(Project));
var MobProject = /** @class */ (function (_super) {
    __extends(MobProject, _super);
    function MobProject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MobProject;
}(Project));
var QaProject = /** @class */ (function (_super) {
    __extends(QaProject, _super);
    function QaProject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QaProject;
}(Project));
var Client = /** @class */ (function () {
    function Client() {
        this.projects = [];
    }
    Client.prototype.createProjects = function () {
        this.projects.length = 0;
        var projectsAmount = rand(0, 4);
        while (projectsAmount > 0) {
            var projectType = rand(0, 1);
            if (projectType === 0) {
                this.projects.push(new WebProject(rand(1, 3)));
            }
            else {
                this.projects.push(new MobProject(rand(1, 3)));
            }
            projectsAmount -= 1;
        }
        return this.projects;
    };
    return Client;
}());
var Director = /** @class */ (function () {
    function Director(name, company) {
        this.name = name;
        this.company = company;
        this.projects = [];
    }
    Director.prototype.getProjects = function (newProjects) {
        this.projects = this.projects.concat(newProjects);
        return this.projects;
    };
    Director.prototype.tryToGiveProjects = function () {
        var projectsToGive = this.projects;
        this.projects = this.company.departments.reduce(function (prevDep, currDep) { return currDep.takeProjects(prevDep); }, projectsToGive);
        return this;
    };
    Director.prototype.hire = function () {
        this.company.departments.forEach(function (department) { return department.hire(); });
        return this;
    };
    Director.prototype.fire = function () {
        this.company.departments.forEach(function (department) { return department.fire(); });
        return this;
    };
    return Director;
}());
var Dev = /** @class */ (function () {
    function Dev() {
        this.free = true;
        this.projectsDone = 0;
        this.freeDays = 0;
    }
    Dev.prototype.getProject = function () {
        this.freeDays = 0;
        this.free = false;
        return this;
    };
    Dev.prototype.work = function () {
        this.freeDays = 0;
        return this;
    };
    Dev.prototype.finishWork = function () {
        this.projectsDone += 1;
        this.free = true;
        return this;
    };
    Dev.prototype.beLazy = function () {
        this.freeDays += 1;
        return this;
    };
    return Dev;
}());
var WebDev = /** @class */ (function (_super) {
    __extends(WebDev, _super);
    function WebDev() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return WebDev;
}(Dev));
var MobDev = /** @class */ (function (_super) {
    __extends(MobDev, _super);
    function MobDev() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MobDev;
}(Dev));
var QaDev = /** @class */ (function (_super) {
    __extends(QaDev, _super);
    function QaDev() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QaDev;
}(Dev));
var Department = /** @class */ (function () {
    function Department() {
        this.projects = [];
        this.projectsToTest = [];
        this.needDevs = 0;
        this.devs = [];
    }
    Department.prototype.freeDevs = function () {
        // массив свободных разработчиков (ресурсы)
        return this.devs.filter(function (dev) { return dev.free; });
    };
    Department.prototype.takeProjects = function (projects) {
        var _this = this;
        var freeDevsAmount = this.freeDevs().length;
        var matchingProjects = projects.filter(function (project) { return project instanceof _this.typeOfProjects; });
        var unmatchingProjects = projects.filter(function (project) {
            return !(project instanceof _this.typeOfProjects);
        });
        // лишние проекты, которые возвратим обратно
        var extraProjects = unmatchingProjects
            .concat(matchingProjects.slice(freeDevsAmount));
        this.needDevs =
            matchingProjects.length > freeDevsAmount
                ? matchingProjects.length - freeDevsAmount
                : 0;
        // берем проекты, на реализацию которых есть ресурсы
        this.projects = this.projects
            .concat(matchingProjects.slice(0, freeDevsAmount));
        return extraProjects;
    };
    Department.prototype.assignProjects = function () {
        var freeProjects = this.projects.filter(function (project) { return !project.devs.length; });
        var freeDevs = this.freeDevs();
        freeProjects.forEach(function (project, i) {
            project.assignDev(freeDevs[i]);
        });
        return this;
    };
    Department.prototype.work = function () {
        this.projects.forEach(function (project) { return project.work(); });
        this.freeDevs().forEach(function (dev) { return dev.beLazy(); });
        return this;
    };
    Department.prototype.sendForTests = function () {
        this.projectsToTest = this.projects.filter(function (project) { return project.done; });
        // неготовые проекты остаются
        this.projects = this.projects.filter(function (project) { return !project.done; });
        this.projectsToTest = this.projectsToTest.map(function () { return new QaProject(1); });
        return this.projectsToTest;
    };
    Department.prototype.deleteProjects = function () {
        this.projects = this.projects.filter(function (project) { return !project.done; });
        return this.projects;
    };
    Department.prototype.fire = function () {
        var candidatesForFire = this.devs.filter(function (dev) { return dev.freeDays > 3; });
        // тех, кто трудился, оставляем
        this.devs = this.devs.filter(function (dev) { return dev.freeDays <= 3; });
        // сортируем кандидатов на увольнение по возрастанию количества выполненных проектов
        candidatesForFire.sort(function (dev1, dev2) { return dev1.projectsDone - dev2.projectsDone; });
        // удаляем первого (у него выполнено проектов меньше всех)
        candidatesForFire.shift();
        // объединяем массив обратно, но уже без уволенного разработчика
        this.devs = this.devs.concat(candidatesForFire);
        return this.devs;
    };
    return Department;
}());
var WebDepartment = /** @class */ (function (_super) {
    __extends(WebDepartment, _super);
    function WebDepartment() {
        var _this = _super.call(this) || this;
        _this.typeOfProjects = WebProject;
        return _this;
    }
    WebDepartment.prototype.hire = function () {
        for (var i = 0; i < this.needDevs; i += 1) {
            this.devs.push(new WebDev());
        }
        return this.devs;
    };
    return WebDepartment;
}(Department));
var MobDepartment = /** @class */ (function (_super) {
    __extends(MobDepartment, _super);
    function MobDepartment() {
        var _this = _super.call(this) || this;
        _this.typeOfProjects = MobProject;
        return _this;
    }
    MobDepartment.prototype.hire = function () {
        while (this.needDevs > 0) {
            this.devs.push(new MobDev());
            this.needDevs -= 1;
        }
        return this.devs;
    };
    MobDepartment.prototype.assignProjects = function () {
        var _this = this;
        var freeProjects = this.projects.filter(function (project) { return !project.devs.length; });
        var freeDevs = this.freeDevs();
        if (freeProjects.length === freeDevs.length) {
            _super.prototype.assignProjects.call(this);
        }
        else {
            // будем помещать сюда тех, кто получил проект
            var busyDevs_1 = this.devs.filter(function (dev) { return !dev.free; });
            // выясняем, какому количеству разработчиков можно дать проект
            var amountOfDevs_1;
            freeProjects.forEach(function (project) {
                // над проектом может работать количество разработчиков=сложности
                var amountOfDevsReq = project.difficulty;
                if ((freeDevs.length - _this.projects.length) / amountOfDevsReq > 1) {
                    // если разработчиков много, даем проект нескольким
                    amountOfDevs_1 = amountOfDevsReq;
                }
                while (amountOfDevs_1 > 0) { // VISITOR
                    var firstDev = freeDevs.shift();
                    // назначаем проекту первого разработчика в массиве свободных
                    project.assignDev(firstDev);
                    // переводим разработчика из массива свободных в массив занятых
                    busyDevs_1.push(firstDev);
                    amountOfDevs_1 -= 1;
                }
            });
            // перекидываем всех разработчиков обратно в общий массив
            this.devs = busyDevs_1;
        }
        return this;
    };
    return MobDepartment;
}(Department));
var QaDepartment = /** @class */ (function (_super) {
    __extends(QaDepartment, _super);
    function QaDepartment() {
        var _this = _super.call(this) || this;
        _this.typeOfProjects = QaProject;
        return _this;
    }
    QaDepartment.prototype.hire = function () {
        while (this.needDevs > 0) {
            this.devs.push(new QaDev());
            this.needDevs -= 1;
        }
        return this.devs;
    };
    QaDepartment.prototype.getProjectsDone = function () {
        return this.projects.filter(function (project) { return project.done; });
    };
    return QaDepartment;
}(Department));
var Company = /** @class */ (function () {
    function Company(name) {
        this.name = name;
        this.director = null;
        this.departments = null;
        this.statistics = new Statistics();
        this.client = new Client();
    }
    Company.prototype.addDirector = function (name) {
        if (name === void 0) { name = ''; }
        this.director = new Director(name, this);
        return this.director;
    };
    Company.prototype.addDepartments = function (departmentNames) {
        var departmentType = {
            web: WebDepartment,
            mob: MobDepartment,
            qa: QaDepartment,
        };
        this.departments = departmentNames.map(function (name) { return new departmentType[name](); });
        return this.departments;
    };
    Company.prototype.startDay = function () {
        var needToHireToday = this.departments.reduce(function (previous, current) { return previous + current.needDevs; }, 0);
        this.statistics.incHired(needToHireToday);
        this.director.hire();
        this.director.getProjects(this.client.createProjects());
        this.director.tryToGiveProjects();
    };
    Company.prototype.workInProcess = function () {
        this.departments.forEach(function (department) {
            department.assignProjects();
            // из всех проектов вычитается 1 день работы
            department.work();
        });
    };
    Company.prototype.endDay = function () {
        var _this = this;
        var generalDepartments = this.departments.filter(function (department) {
            return !(department instanceof QaDepartment);
        });
        // основные отделы копируют готовые проекты директору для тестирования на следующий день
        generalDepartments.forEach(function (department) {
            return _this.director.getProjects(department.sendForTests());
        });
        var qaDepartment = this.departments.filter(function (department) {
            return department instanceof QaDepartment;
        })[0];
        this.statistics.incProjectsDone(qaDepartment.getProjectsDone().length);
        this.departments.forEach(function (department) { return department.deleteProjects(); });
        this.director.fire();
        return this;
    };
    return Company;
}());
var Simulation = /** @class */ (function () {
    function Simulation(companyName, directorName, departmentsArray) {
        this.company = new Company(companyName);
        this.company.addDirector(directorName);
        this.company.addDepartments(departmentsArray);
        this.statistics = this.company.statistics;
    }
    Simulation.prototype.run = function (days) {
        var daysAmount = days;
        while (daysAmount > 0) {
            this.company.startDay();
            this.company.workInProcess();
            this.company.endDay();
            daysAmount -= 1;
        }
        return this;
    };
    Simulation.prototype.showStats = function () {
        var allDevs = this.company.departments.reduce(function (previous, current) { return previous + current.devs.length; }, 0);
        return {
            hired: this.statistics.hired,
            fired: this.statistics.calcFired(allDevs),
            'projects done': this.statistics.projectsDone,
        };
    };
    return Simulation;
}());
var simulation = new Simulation('creativeGuys', 'vasiliy', [
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
