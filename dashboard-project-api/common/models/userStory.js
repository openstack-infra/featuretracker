module.exports = function(UserStory) {
  var fs = require("fs");
  var route = '../tracker';
  var app = require('../../server/server');
  var http = require("http");
  var https = require('https');
  var markdown = require("markdown").markdown;
  var async = require("async");
  var htmlparser = require("htmlparser");
  var cheerio = require('cheerio');


  var blueprintsResume = [];


  var getAllfiles = function(getPercentage){

    return  fs.readdirSync(route)
      .map(function(file){
        var route = "../tracker/" + file ;
        var data = JSON.parse(fs.readFileSync(route));
        var parsedData;

        if(getPercentage){
            parsedData = getTotalPercentage(data);
            data.blueprintList = parsedData;
        }

        return data;
      });

  }

  //get completed percentage of all the userstories
  var getTotalPercentage = function(userStory){

    blueprintsResume.completed = 0;
    blueprintsResume.total = 0;
    var blueprintList = [];

      userStory.tasks.forEach(function (taskName, index, array) {

        var task = userStory.tasks_status[taskName];

        task.projects.forEach(function (projectName, index, array) {

          var blueprints = task.projects_status[projectName].blueprints;
          var blueprintNames = Object.keys(blueprints);
          blueprintList.push(blueprintNames);

          blueprintNames.forEach(function (blueprintName, index, array) {

            if (blueprints[blueprintName] == 'completed')
              blueprintsResume.completed = blueprintsResume.completed + 1;

            blueprintsResume.total = blueprintsResume.total + 1;

          })

        })

      })

    var finalPercentage = Math.round((blueprintsResume.completed*100)/blueprintsResume.total)
      blueprintList.push([{percentage:(finalPercentage)}]);
      return blueprintList;

  }

  //get completed percentage of a User story
  var getPercentage = function(blueprints){
    var total = blueprints.length;
    var complete = 0;

    blueprints.forEach(function(element, index, array) {

      if(element == 'completed')
        complete = complete + 1;
    })
    return Math.round((complete*100)/total);

  }

  var getFileById = function(id){

    //get all files
    var userStories = getAllfiles();
    //filter by Id
    var file = userStories.filter(function(item){
      return item.id == id;
    })

    if(file.length > 0){
      file = file[0];
    }else{
      file = 'The file with id: '+ id +' does not exist.'
    }
    return file;

  };

  var getDetailedUri = function(source) {
    var base = 'http://specs.openstack.org/openstack/openstack-user-stories/user-stories/proposed/';

    return base + source + '.html';

  }

  var parseUserStory = function(id){
    var data = [];
    return function(callback){
      var file = getFileById(id);

      var Patch = app.models.Patch;

      Patch.latestUpdate(file.source, function(err, response) {

        var lastUpdate = '';

        if(response){
          response = JSON.parse(response.substring(5));
          response.forEach( function each (element){
            data.push(
              {
                latestDate: element.updated,
              });
          });

          data = data.sort();
          lastUpdate =  data.shift();

          if(lastUpdate){
            lastUpdate = lastUpdate.latestDate;
          }
        }

        var userStory = {
          title:file.description,
          description:'',
          status:file.status,
          showDetailedUri:getDetailedUri(file.source),
          submittedBy:file.submitted_by.name,
          submittedByEmail:file.submitted_by.email,
          createdOn:file.date,
          updatedOn:lastUpdate,
          id:file.id,
          percentageComplete:''
        };
        callback(null, userStory, file.tasks, file.tasks_status);

      })

    }
  }


  var getTaskDescription = function(task, callback){

    var Rst = app.models.Rst;
    var spec = task['cross-project spec'] + '.rst'

    Rst.list(spec, function(err, data){

      var html_content = markdown.toHTML(data);
      var $ = cheerio.load(html_content);

      var index = null;
      //Find the title
      var description = $('h1').each(function(i, elem) {
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

  var parseTask = function(originalTask, callback){

    getTaskDescription(originalTask, function(err, description){
      originalTask.description = description;
      originalTask.url = getUriTask(originalTask['cross-project spec']);
      originalTask.xp_status = originalTask.xp_status;
      callback(null, originalTask)
    })

  }


  var parseProject = function(originalProject, callback){

    var urlArray = originalProject.spec.split('/');
    var nameArray = urlArray[urlArray.length-1].split('.')
    originalProject.spec_name = nameArray[0];

    callback(null, originalProject)
  }


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


  //TODO: APPLY async.waterfall
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

        }, function(err) {

          tmpTasks[taskName].projects_status = tmpProjects;
          callbackInner(null)
        });

      })

    }, function(err) {

      userStory.tasks = tasksNames;
      userStory.tasks_status = tmpTasks;

      userStory.percentageComplete = getPercentage(blueprintsResume)

      callback(null, userStory);

    });

  }

  UserStory.on('attached',function(){

    UserStory.findById = function(id, params, cb){

      async.waterfall([
        parseUserStory(id),
        parseTasks
      ], function (err, result) {
        cb(null,result)
      });

    };

    UserStory.find = function(params, cb){
        var Patch = app.models.Patch;
      //get all files
        var userStories = getAllfiles(true);
        var percentage;
        var blueprintKeys;
        var dateList = [];
        //var response = userStories;

        var result;

        // looking dates
        var lookingDates = function (id, blueprintKeys) {
            blueprintKeys.forEach(function each (key) {
                var data = [];
                Patch.latestUpdate(key, function (err, response, next) {

                    response = JSON.parse(response.substring(5));
                    async.waterfall([
                        function createOutput(next){
                            response.forEach( function each (element){
                                data.push(
                                {
                                    latestDate: element.updated,
                                });
                            });
                            next();
                        },
                        function sendData (next) {
                            data = data.sort();
                            var lastUpdate =  data.shift();
                            if(lastUpdate !== undefined) {
                                dateList.push({
                                    id: id,
                                    value: lastUpdate.latestDate
                                });
                            }
                            next;
                        }
                    ], next);
                });
            });
        }

        function keysrt(key,asc) {
            return function(a,b){
                return asc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
            }
        }

        async.waterfall ([
            function readStories (next) {
                userStories.forEach (function eachStory (story, x) {
                    //console.log(story.blueprintList);
                    //TODO change the array of percentage
                    percentage = (story.blueprintList).pop();
                    blueprintKeys = story.blueprintList;
                    result = lookingDates((story.id), blueprintKeys);
                    story.percentage = percentage[0].percentage;
                });
                next();
            },
            function resumeDate (next){
                setTimeout(function(){
                    dateList = dateList.sort(keysrt('value'));
                    userStories.forEach (function eachStory (story) {
                        dateList.forEach (function eachDate (dateElement){
                            if(dateElement.id === story.id){
                                story.latestUpdate = dateList
                            }
                        });
                    });
                    cb(null,userStories);
                }, 1000);

                next;
            },
            function sendResult(next){
                //cb(null,userStories);
                next;
            }
        ]);


    }
  })

};
