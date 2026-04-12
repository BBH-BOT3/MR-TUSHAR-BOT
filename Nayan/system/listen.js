module.exports = function({ api, models }) {
setInterval(function () {

}, 1000*60);
const Users = require("./controllers/users")({ models, api }),
Threads = require("./controllers/threads")({ models, api }),
Currencies = require("./controllers/currencies")({ models });
const logger = require("../catalogs/Nayanc.js");
const chalk = require("chalk");
const gradient= require("gradient-string");
const crayon = gradient('yellow', 'lime', 'green');
const sky = gradient('#3446eb', '#3455eb', '#3474eb');

(async function () {
    try {
      const axios = require("axios");
const res = await axios.get(`https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan/main/noti.json`);
      const noti = res.data.noti;
      const fb = res.data.fb;
      const wp = res.data.wp;
      const credit = res.data.credit;
      const v = res.data.v;
      const process = require("process");
      const [threads, users] = await Promise.all([Threads.getAll(), Users.getAll(['userID', 'name', 'data'])]);
      threads.forEach(data => {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data.data || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
        if (data.data && data.data.banned) {
          global.data.threadBanned.set(idThread, {
            'reason': data.data.reason || '',
            'dateAdded': data.data.dateAdded || ''
          });
        }
        if (data.data && data.data.commandBanned && data.data.commandBanned.length !== 0) {
          global.data.commandBanned.set(idThread, data.data.commandBanned);
        }
        if (data.data && data.data.NSFW) {
          global.data.threadAllowNSFW.push(idThread);
        }
      });
      users.forEach(dataU => {
        const idUsers = String(dataU.userID);
        global.data.allUserID.push(idUsers);
        if (dataU.name && dataU.name.length !== 0) {
          global.data.userName.set(idUsers, dataU.name);
        }
        if (dataU.data && dataU.data.banned) {

          global.data.userBanned.set(idUsers, {
            'reason': dataU.data.reason || '',
            'dateAdded': dataU.data.dateAdded || ''
          });
        }

        if (dataU.data && dataU.data.commandBanned && dataU.data.commandBanned.length !== 0) {
          global.data.commandBanned.set(idUsers, dataU.data.commandBanned);

        }
      });
      global.loading(`deployed ${chalk.blueBright(`${global.data.allThreadID.length}`)} groups and ${chalk.blueBright(`${global.data.allUserID.length}`)} users\n${chalk.blue(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)}\n${chalk.blue(`╔╗╔╔═╗╦ ╦╔═╗╔╗╔  ╔╗ ╔═╗╔╦╗\n║║║╠═╣╚╦╝╠═╣║║║  ╠╩╗║ ║ ║ \n╝╚╝╩ ╩ ╩ ╩ ╩╝╚╝  ╚═╝╚═╝ ╩ `)}\n\n${chalk.blue(`CREDIT: ${credit}`)}\n${chalk.blue(`FB: ${fb}`)}\n${chalk.blue(`WP: ${wp}`)}\n${chalk.blue(`MSG: ${noti}`)}\n${chalk.blue(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n          NAYAN PROJECT VERSION ${v}\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`)}\n`, "data");
    } catch (error) {
      logger.loader(`can't load environment variable, error : ${error}`, 'error');
    }
  })();	

const operator = global.config.OPERATOR.length;
const admin = global.config.ADMINBOT.length;
const approved = global.config.APPROVED.length;
console.log(`${crayon(``)}${sky(`data -`)} bot name : ${chalk.blueBright((!global.config.BOTNAME) ? "Nayan" : global.config.BOTNAME)} \n${sky(`data -`)} bot id : ${chalk.blueBright(api.getCurrentUserID())} \n${sky(`data -`)} bot prefix : ${chalk.blueBright(global.config.PREFIX)}\n${sky(`data -`)} deployed ${chalk.blueBright(operator)} bot operators and ${chalk.blueBright(admin)} admins`);
if (global.config.approval) {
  console.log(`${sky(`data -`)} deployed ${chalk.blueBright(approved)} approved groups`)
}

const handleCommand = require("./handle/handleCommand.js")({ api, Users, Threads, Currencies, models });
const handleCommandEvent = require("./handle/handleCommandEvent.js")({ api, Users, Threads, Currencies, models });
const handleReply = require("./handle/handleReply.js")({ api, Users, Threads, Currencies, models });
const handleReaction = require("./handle/handleReaction.js")({ api, Users, Threads, Currencies, models });
const handleEvent = require("./handle/handleEvent.js")({ api,  Users, Threads, Currencies, models });
const handleCreateDatabase = require("./handle/handleCreateDatabase.js")({  api, Threads, Users, Currencies, models });
  const react = require("./handle/react.js")({  api, Threads, Users, Currencies, models });


const Box = require("../catalogs/Nayane.js");

  return (event) => {
    const listenObj = {
      event,
      NAYAN: new Box(api, event),
    };
    react(listenObj)
    switch (event.type) {
      case "message":
      case "message_reply":
      case "message_unsend":
        handleCreateDatabase(listenObj);
        handleCommand(listenObj);
        handleReply(listenObj);
        handleCommandEvent(listenObj);
        break;
      case "change_thread_image":
        break;
      case "event":
        handleEvent(listenObj);
        break;
      case "message_reaction":
        handleReaction(listenObj);
        break;
      default:
        break;
    }
  }; 
};