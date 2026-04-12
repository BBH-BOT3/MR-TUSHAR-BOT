module.exports = function({ api, models, Users, Threads, Currencies, ...rest }) {
  const stringSimilarity = require('string-similarity'),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    logger = require("../../catalogs/Nayanc.js");
  const axios = require('axios')
  const moment = require("moment-timezone");
  return async function({ event, ...rest2 }) {
    const axios = require("axios");
    const response = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot-Gban/main/owners.json");
    const data = response.data;
    const dateNow = Date.now()
    const time = moment.tz("Asia/Dhaka").format("HH:MM:ss DD/MM/YYYY");
    const { allowInbox, adminOnly, keyAdminOnly } = global.Nayan;
    const { PREFIX, ADMINBOT, developermode, OPERATOR, APPROVED, approval, banMsg, adminOnlyMsg} = global.config;
    const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;
    var { body, senderID, threadID, messageID } = event;
    var senderID = String(senderID),
      threadID = String(threadID);
    const threadSetting = threadData.get(threadID) || {}
    const args = (body || '').trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    let command = client.commands.get(commandName);

    if (!command) {
      for (const cmd of global.client.commands.values()) {
        const aliases = cmd.config.aliases || [];
        if (aliases.map(alias => alias.toLowerCase()).includes(commandName)) {
          command = cmd;
          break;
        }
      }
    }
    
    const replyAD = '[MODE] - only bot admin can use bot';
    const notApproved = `[❌]this box is not approved.\n[➡️]use "${PREFIX}request" to send a approval request from bot operators`;
    if (typeof body === "string" && body.startsWith(`${PREFIX}request`) && approval) {
      if (APPROVED.includes(threadID)) {
        return api.sendMessage('[✅] This box is already approved', threadID, messageID)
      }
      let Nayandev;
      let request;
      try {
        const groupname = await global.data.threadInfo.get(threadID).threadName || "name does not exist";
        Nayandev = `group name : ${groupname}\ngroup id : ${threadID}`;
        request = `${groupname} group is requesting for approval`
      } catch (error) {
        const username = await Users.getNameUser(threadID) || "facebook user";
        Nayandev = `user id : ${threadID}`;
        request = `${username} bot user is requesting for approval`;
      }
      return api.sendMessage(`${request}\n\n${Nayandev}`, OPERATOR[0], () => {
        return api.sendMessage('[✅] Your approval request has been sent from bot operator', threadID, messageID);
      });
    }
    if (command && (command.config.name.toLowerCase() === commandName.toLowerCase()) &&(!APPROVED.includes(threadID) && !OPERATOR.includes(senderID) && !ADMINBOT.includes(senderID) && approval)) {
      return api.sendMessage(notApproved, threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            return api.unsendMessage(info.messageID);
          });
    }
    if (typeof body === 'string' && body.startsWith(PREFIX) && (!APPROVED.includes(threadID) && !OPERATOR.includes(senderID) && !ADMINBOT.includes(senderID) && approval)) {
      return api.sendMessage(notApproved, threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            return api.unsendMessage(info.messageID);
          });
    }
    if (command && (command.config.name.toLowerCase() === commandName.toLowerCase()) && (!ADMINBOT.includes(senderID) && !OPERATOR.includes(senderID) && adminOnly && senderID !== api.getCurrentUserID())) {
      if (adminOnlyMsg == true){
        return api.sendMessage(replyAD, threadID, messageID);
      } else {
        return;
      }

    }
    if (typeof body === 'string' && body.startsWith(PREFIX) && (!ADMINBOT.includes(senderID) && adminOnly && senderID !== api.getCurrentUserID())) {
      if (adminOnlyMsg == true){
        return api.sendMessage(replyAD, threadID, messageID);
      } else {
        return;
      }
    }

    const userBan = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-OFFICIAL/Nayan-Bot-Gban/main/Gban.json");
    const banUser = userBan.data;


    if (banUser[senderID]) {

        api.setMessageReaction('🚫', event.messageID, err => {
            if (err) {
                console.error('An error occurred while executing setMessageReaction');
            }
        }, true);


        if (banMsg == true){
            return api.sendMessage(`[❌] You have been banned from using this bot\n[❗] Reason: ${banUser[senderID].reason}\n[❗] Banned by: Mohammad Nayan\n[❗] Banned at: ${banUser[senderID].date}`, threadID, messageID)
        } else {
          return;
        }
    }




    if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == ![] && senderID == threadID) {
      if (!ADMINBOT.includes(senderID.toString()) && !OPERATOR.includes(senderID.toString()))
      {
        if (userBanned.has(senderID)) {
          const { reason, dateAdded } = userBanned.get(senderID) || {};
          return api.setMessageReaction('🚫', event.messageID, err => (err) ? logger('An error occurred while executing setMessageReaction', 2) : '', !![]);
        } else {
          if (threadBanned.has(threadID)) {
            const { reason, dateAdded } = threadBanned.get(threadID) || {};
            return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
              await new Promise(resolve => setTimeout(resolve, 5 * 1000));
              return api.unsendMessage(info.messageID);
            }, messageID);
          }
        }
      }
    }

    const inputCommandName = commandName.startsWith(PREFIX) ? commandName.slice(PREFIX.length).toLowerCase() : commandName.toLowerCase();

    if (commandName.startsWith(PREFIX)) {
      if (!command) {
        const allNames = [];

        for (const cmd of commands.values()) {
          allNames.push(cmd.config.name.toLowerCase());
          if (Array.isArray(cmd.config.aliases)) {
            allNames.push(...cmd.config.aliases.map(e => e.toLowerCase()));
          }
        }

        const checker = stringSimilarity.findBestMatch(inputCommandName, allNames);

        if (checker.bestMatch.rating >= 0.5) {
          const matchedCommand = [...commands.values()].find(c =>
            c.config.name.toLowerCase() === checker.bestMatch.target ||
            (Array.isArray(c.config.aliases) && c.config.aliases.map(e => e.toLowerCase()).includes(checker.bestMatch.target))
          );

          if (matchedCommand) {
            command = matchedCommand;
          } else {
            return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID, messageID);
          }
        } else {
          return api.sendMessage(global.getText("handleCommand", "commandNotExist", checker.bestMatch.target), threadID, messageID);
        }
      }
    }
    if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
      if (!ADMINBOT.includes(senderID) && !OPERATOR.includes(senderID)) {
        const banThreads = commandBanned.get(threadID) || [],
          banUsers = commandBanned.get(senderID) || [];
        if (banThreads.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000))
            return api.unsendMessage(info.messageID);
          }, messageID);
        if (banUsers.includes(command.config.name))
          return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
            return api.unsendMessage(info.messageID);
          }, messageID);
      }
    }


    if (command && command.config) {
      const cmdName = command.config.name.toLowerCase();
      const aliases = command.config.aliases?.map(e => e.toLowerCase()) || [];
      const validNames = [cmdName, ...aliases];
      const usedName = commandName.toLowerCase();

      const prefixSetting = command.config.prefix;

      
      if ((prefixSetting === false || prefixSetting === 0) && !validNames.includes(usedName)) {
        return api.sendMessage(global.getText("handleCommand", "notMatched", command.config.name), event.threadID, event.messageID);
      }

      
      if ((prefixSetting === true || prefixSetting === 2) && !body.startsWith(PREFIX)) {
        return;
      }

      
      if (
        (prefixSetting === "both" || prefixSetting === "auto" || prefixSetting === "awto" || prefixSetting === 3) &&
        !body.startsWith(PREFIX) &&
        !validNames.includes(usedName)
      ) {
        return;
      }
    }

    if (command && command.config) {
      if (typeof command.config.prefix === 'undefined') {
        api.sendMessage(global.getText("handleCommand", "noPrefix", command.config.name), event.threadID, event.messageID);
        return;
      }
    }

    if (command && command.config && command.config.category && command.config.category.toLowerCase() === 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
      return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {
        await new Promise(resolve => setTimeout(resolve, 5 * 1000))
        return api.unsendMessage(info.messageID);
      }, messageID);
    var threadInfo2;
    if (event.isGroup == !![])
      try {
        threadInfo2 = (threadInfo.get(threadID) || await Threads.getInfo(threadID))
        if (Object.keys(threadInfo2).length == 0) throw new Error();
      } catch (err) {
        logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
      }
    var permssion = 0;
    var threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
    const Find = threadInfoo.adminIDs.find(el => el.id == senderID);
    const Nayan = !OPERATOR.includes(senderID);
    const n = !data.includes(senderID);
    if (OPERATOR.includes(senderID.toString())) permssion = 3;
      if (data.includes(senderID.toString())) permssion = 3;
      if (data.includes(senderID.toString())) permssion = 2;
    else if (ADMINBOT.includes(senderID.toString())) permssion = 2;
    else if (!ADMINBOT.includes(senderID) && Nayan && Find && n) permssion = 1;
    if (command && command.config && command.config.permission && command.config.permission > permssion) {
      return api.sendMessage(global.getText("handleCommand", "permissionNotEnough", command.config.name), event.threadID, event.messageID);
    }

    if (command && command.config && !client.cooldowns.has(command.config.name)) {
      client.cooldowns.set(command.config.name, new Map());
    }

    const timestamps = command && command.config ? client.cooldowns.get(command.config.name) : undefined;

    const expirationTime = (command && command.config && command.config.cooldowns || 1) * 1000;

    if (timestamps && timestamps instanceof Map && timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)

      return api.setMessageReaction('🕝', event.messageID, err => (err) ? logger('An error occurred while executing setMessageReaction', 2) : '', !![]);
    var getText2;
    if (command && command.languages && typeof command.languages === 'object' && command.languages.hasOwnProperty(global.config.language))

      getText2 = (...values) => {
        var lang = command.languages[global.config.language][values[0]] || '';
        for (var i = values.length; i > 0x2533 + 0x1105 + -0x3638; i--) {
          const expReg = RegExp('%' + i, 'g');
          lang = lang.replace(expReg, values[i]);
        }
        return lang;
      };
    else getText2 = () => { };
    try {
      const Obj = {
        api: api,
        event: event,
        args: args,
        models: models,
        Users: Users,
        Threads: Threads,
        Currencies: Currencies,
        permssion: permssion,
        getText: getText2,
        ...rest,
        ...rest2
      };

      if (command && typeof command.run === 'function') {
        try {
          if (typeof command.run === "function") {
            await command.run(Obj);
            await timestamps.set(senderID, dateNow);
          } else {
            api.sendMessage(`⚠️ Command "${command.name}" is missing a valid run function.`, threadID);
          }
        } catch (error) {
          console.error(`❌ Error in command "${command.name}":`, error);
          api.sendMessage(
            `❌ An error occurred while executing "${command.name}".\nError: ${error.message}`,
            threadID
          );
        }

        if (developermode == !![]) {
          logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - dateNow) + '\n', "command");
        }

        return;
      }
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }

    try {
      const Obj = {
        nayan: api,
        events: event,
        args: args,
        models: models,
        Users: Users,
        Threads: Threads,
        Currencies: Currencies,
        permssion: permssion,
        lang: getText2,
        ...rest,
        ...rest2
      };

      if (command && typeof command.start === 'function') {
        try {
          if (typeof command.start === "function") {
            await command.start(Obj);
            await timestamps.set(senderID, dateNow);
          } else {
            api.sendMessage(`⚠️ Command "${command.name}" is missing a valid start function.`, threadID);
          }
        } catch (error) {
          console.error(`❌ Error in command "${command.name}":`, error);


          api.sendMessage(
            `❌ An error occurred while executing "${command.name}".\nError: ${error.message}`,
            threadID
          );
        }


        if (developermode == !![]) {
          logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - dateNow) + '\n', "command");
        }

        return;
      }
    } catch (e) {
      return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
    }

  };
};