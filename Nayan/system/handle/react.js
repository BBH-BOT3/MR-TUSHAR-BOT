module.exports = function({ api, Users, Threads, Currencies, models }) {
  return function(listenObj) {
    try {
      const event = listenObj.event;

      if (event.type === "message_reaction" && event.reaction === "☠️") {
        const admin = global.config.ADMINBOT || [];

        if (admin.includes(event.userID)) {
          api.unsendMessage(event.messageID).catch(err => console.error("Error unsending message:", err));
        }
      }
    } catch (error) {
      console.error("An error occurred in the message reaction handler:", error);
    }
  };
};
