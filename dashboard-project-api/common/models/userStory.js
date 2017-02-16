module.exports = function(UserStory) {
  var fs = require("fs");
  var route = '../tracker';
  var app = require('../../server/server');
  var markdown = require("markdown").markdown;
  var async = require("async");
  var cheerio = require('cheerio');
  var xssFilters = require("xss-filters");
  const SPEC_URL = "http://specs.openstack.org/openstack/openstack-user-stories/user-stories/proposed/";


  var blueprintsResume = [];

  var getAllfiles = function(){
    return  fs.readdirSync(route)
      .map(function(file){
        var route = "../tracker/" + file ;
        var userStory = JSON.parse(fs.readFileSync(route));
        return userStory;
      });
  }

  var getFileById = function(id){

    //get all files
    var userStories = getAllfiles();
    //filter by Id
    var file = userStories.filter(function(item){
        // VALIDATE IF A VALID ID IS COMING!
      return item.id == xssFilters.inHTMLData(id);
    })

    file = (file.length > 0)?file[0]:null;
    return file;

  };

  //get all the completed blueprints
  var getbluePrintResume = function(userStory){
    var blueprintsResume = {
          completed: 0,
          total: 0
    }

    userStory.tasks.forEach(function (taskName) {

        var task = userStory.tasks_status[taskName];

        task.projects.forEach(function (projectName) {
            //VALIDATE projectName EXISTS
          var blueprints = task.projects_status[xssFilters.inHTMLData(projectName)].blueprints;
          var blueprintNames = Object.keys(blueprints);

          blueprintNames.forEach(function (blueprintName) {
              // VALIDATE PROPERLY if this statement is not true
            if (blueprints[xssFilters.inHTMLData(blueprintName)] == 'completed')
              blueprintsResume.completed = blueprintsResume.completed + 1;

            blueprintsResume.total = blueprintsResume.total + 1;

          })

        })

      })

    blueprintsResume.percentage = (blueprintsResume.completed/blueprintsResume.total)*100;

    return blueprintsResume;
  }

  //get the field lastupdated for a usterStory
  var getLastUpdated = function(userStory, cb){
    var Patch = app.models.Patch;
    var lastUpdate = '';

    Patch.latestUpdate(userStory.source, function (err, response) {
      response = JSON.parse(response.substring(5));

      if(response.length > 0){
        lastUpdate =  response.map( function each (element){
                        return element.updated
                    }).sort().pop();
        var arrayLastUpdate = lastUpdate.split(' ');
        lastUpdate = arrayLastUpdate[0];

      }

      cb(null, lastUpdate)

    })

  }

  //getting task description
  var getTaskDescription = function(task, callback){

    var Rst = app.models.Rst;
    var spec = task['cross-project spec'] + '.rst'

    Rst.list(spec, function(err, data){

      var html_content = markdown.toHTML(data);
      var $ = cheerio.load(html_content);

      var index = null;
      var description;
      //Find the title
      $('h1').each(function(i, elem) {
        if(elem.children[0].data == 'Problem description'){
          index = i;
        }
      });

      //get Text description
      if(index != null){
        description = $($('h1')[index]).next().text()
      }else{
        description = '';
      }

      callback(null, description);

    })

  }

  var getUriTask = function(spec){
    var base = 'https://github.com/openstack/openstack-specs/blob/master/specs/';

    return base + spec + '.rst';
  }

  //parsing task
  var parseTask = function(originalTask, callback){

    getTaskDescription(originalTask, function(err, description){
      originalTask.description = description;
      originalTask.url = getUriTask(originalTask['cross-project spec']);
      callback(null, originalTask)
    })

  }

  //parsing project
  var parseProject = function(originalProject, callback){

    var urlArray = originalProject.spec.split('/');
    var nameArray = urlArray[urlArray.length-1].split('.')
    originalProject.spec_name = nameArray[0];

    callback(null, originalProject)
  }

  //parsing blueprints
  var parseBlueprint = function(originalBlueprint, blueprintName, projectName, callback){
    var Blueprint = app.models.Blueprint;
    var Patch = app.models.Patch;

    var status = originalBlueprint;

    Blueprint.url(projectName, blueprintName, function(err, uri){

      blueprintsResume.push(status)

      blueprintsResume.complete = blueprintsResume.total +1 ;


      Patch.list(blueprintName, function(err, response) {

        var data = [];

        response = JSON.parse(response.substring(5));

        response.forEach(function each(element) {
          data.push(
            {
              url: "https://review.openstack.org/#/c/" + element._number,
              name: element.subject
            });
        });

        originalBlueprint = {
          name: blueprintName.replace(/-/g, " "),
          uri: uri,
          status: status,
          review_link:data
        }
        callback(null, originalBlueprint)

      })

    })

  }

  //parsing tasks
  var parseTasks = function(userStory, tasksNames, tasks,  callback) { //get tasks

    var tmpTasks = {};
    async.each(tasksNames, function(taskName, callbackInner) {

      parseTask(tasks[taskName], function(err, parsedTask){

        tmpTasks[taskName] = parsedTask;

        var tmpProjects = {};
        async.each(tmpTasks[taskName].projects, function(projectName, callbackInner2) {

          parseProject(tmpTasks[taskName].projects_status[projectName], function(err, parsedProject){
            tmpProjects[projectName] = parsedProject;

            //Bluprints
            var blueprintNames = Object.keys(tmpProjects[projectName].blueprints);

            async.map(blueprintNames, function(blueprintName, callbackInner3) {

              parseBlueprint(tmpProjects[projectName].blueprints[blueprintName], blueprintName, projectName, function(err, parsedBlueprint){
               // tmpProjects[projectName].blueprints[blueprintName] = parsedBlueprint
                callbackInner3(null, parsedBlueprint)
              })

            }, function(err, blueprints) {

              tmpProjects[projectName].blueprints = blueprints;

              var project = {};
              project[projectName] = tmpProjects[projectName];

              callbackInner2(null)

            });
            //fin blueprints

          })

        }, function() {
          tmpTasks[taskName].projects_status = tmpProjects;
          callbackInner(null)
        });

      })

    }, function() {
      userStory.tasks = tasksNames;
      userStory.tasks_status = tmpTasks;

      //userStory.percentageComplete = getPercentage(blueprintsResume)

      callback(null, userStory);

    });

  }

  // Parse data from userStory
  var parseUserStory = function(userStory, callback){

      async.waterfall([function(cb){

        getLastUpdated(userStory, cb)

      },function(lastUpdated, cb){
        userStory.updatedOn = lastUpdated;
        userStory.showDetailedUri = SPEC_URL + userStory.source + '.html';
        userStory.createdOn = userStory.date;
        userStory.completed = getbluePrintResume(userStory);

        cb(null, userStory);

        },function(userStory, cb){

          var tasksName = userStory.tasks;
          var tasks = userStory.tasks_status;

          parseTasks(userStory, tasksName, tasks, cb)

        }],function(err,userStory){
          callback(null, userStory);
      })
  }

//?
  UserStory.on('attached',function(){

    UserStory.findById = function(id, params, cb){

      var userStory = getFileById(id);

      if(userStory){
        parseUserStory(userStory, cb);
      }else{
        cb('File does not exist', null);
      }

    };//end find by id

    UserStory.find = function(params, cb){
        var userStories = getAllfiles();

        async.mapSeries(userStories, parse, cb);

        function parse(userStory, callback) {

          async.waterfall([function(cb){
            getLastUpdated(userStory, cb)
          },function(lastUpdated, cb){

            var itemResult = {
              completed: getbluePrintResume(userStory),
              dateCreated: xssFilters.inHTMLData(userStory.date),
              lastUpdate: xssFilters.inHTMLData(lastUpdated),
              userStory: xssFilters.inHTMLData(userStory.description),
              id:xssFilters.inHTMLData(userStory.id)
            };

            cb(null, itemResult);

          }],function(err,result){
              callback( err, result);
          })
        }
    };//End find

  })

};
