
var chalk       = require('chalk');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Spinner     = CLI.Spinner;
var ApiWay  = require('apiway.js')
let aw = new ApiWay({});
let awProject = aw.getProject();
let awInstance = aw.getInstance();
let awSchedule = aw.getSchedule();
let awScheduler = aw.getScheduler();
var Configstore = require('configstore');
var pkg         = require('../package.json')
const conf = require('../util/config')
const confStore = new Configstore(pkg.name, {});

exports.getProjectsByUser = function (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting projects ...');
    status.start();
    awProject.getProjectsByUser(userId).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.projects)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function getProject (projectId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting a project ...');
    status.start();
    awProject.getProject(projectId).then(res => {
      if (res != null) {
        status.stop()
        confStore.set(conf.LAST_SELECTED_PROJECT, res.data.data.full_name)
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function selectProject (projects) {
  return new Promise ((resolve, reject) => {
    var tmpProjects = new Map();
    let array = []
    projects.forEach(project => {
      if (project.full_name) {
        array.push(project.full_name)
        tmpProjects.set(project.full_name, project)
      }
    })
    promptProjects(array, (data) => {
      resolve(tmpProjects.get(data.project))
    })
  })
}

function getSchedulesByProject (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting schedules ...');
    status.start();
    awSchedule.getSchedulesByProject(project._id).then(res => {
      if (res!= null) {
        status.stop()
        // console.log(res.data.data.schedules)
        resolve(res.data.data.schedules)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function promptProjects (projects, callback) {
  var questions = [
    {
      name: 'project',
      type: 'list',
      message: 'Select a project',
      choices: projects
    }
  ];
  inquirer.prompt(questions).then(callback);
}

function promptSchedules (schedules, callback) {
  var questions = [
    {
      name: 'schedule',
      type: 'list',
      message: 'Select a schedule',
      choices: schedules
    }
  ];
  inquirer.prompt(questions).then(callback);
}

function deleteProject(project) {
  return new Promise ((resolve, reject) => {
    awProject.deleteProject(project._id).then(res => {
      if (res != null) {
        resolve(project)
      }
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

function deleteScheduleInScheduler (schedule) {
  return new Promise ((resolve, reject) => {
    console.log(schedule)
    awScheduler.deleteSchedule(schedule.schedulerId, schedule._id).then(res => {
      if (res != null) {
        resolve(schedule)
      }
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

function deleteSchedule (schedule) {
  return new Promise ((resolve, reject) => {
    awSchedule.deleteSchedule(schedule._id).then(res => {
      if (res != null) {
        resolve(schedule)
      }
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

function getSchedulesByUser (userId) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Getting schedules ...');
    status.start();
    awSchedule.getSchedulesByUser(userId).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data.schedules)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function selectSchedule (schedules) {
  return new Promise ((resolve, reject) => {
    var tmpSchedules = new Map();
    let array = []
    schedules.forEach(schedule => {
      if (schedule._id) {
        array.push(schedule._id)
        tmpSchedules.set(schedule._id, schedule)
      }
    })
    promptSchedules(array, (data) => {
      resolve(tmpSchedules.get(data.schedule))
    })
  })
}

function runProject (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Running project ...');
    status.start();
    confStore.set(conf.LAST_RUN_PROJECT, project.full_name)
    awInstance.addInstance({projectId: project._id}).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

function createSchedule (project) {
  return new Promise ((resolve, reject) => {
    var status = new Spinner('Creating schedule ...');
    status.start();
    confStore.set(conf.LAST_RUN_PROJECT, project.full_name)
    let options = confStore.get(conf.OPTIONS)
    let cron = options.cron ? options.cron : null
    let data = {
      projectId: project._id,
      owner: project.owner,
      cron: cron
    }
    awSchedule.addSchedule(data).then(res => {
      if (res!= null) {
        status.stop()
        resolve(res.data.data)
      }
    }).catch(err => {
      console.error(err)
      status.stop()
      reject(err)
    })
  })
}

exports.getProject = getProject
exports.runProject = runProject
exports.deleteProject = deleteProject
exports.deleteSchedule = deleteSchedule
exports.deleteScheduleInScheduler = deleteScheduleInScheduler
exports.promptProjects = promptProjects
exports.getSchedulesByProject  = getSchedulesByProject
exports.getSchedulesByUser = getSchedulesByUser
exports.selectProject  = selectProject
exports.selectSchedule = selectSchedule
exports.createSchedule = createSchedule