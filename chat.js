Messages = new Mongo.Collection("msgs");

Meteor.methods({
  sendMessage: function (messageText) {
    /* add authentication here */
       if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Messages.insert({
      messageText: messageText,
      createdAt: new Date(),
      username: Meteor.user().username
    });
  }
});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("messages", function () {
    return Messages.find();
});
}

/* scrolling code */
var autoScrollingIsActive = false;
/* reactive var here */
thereAreUnreadMessages = new ReactiveVar(false);
scrollToBottom = function scrollToBottom (duration) {
  var messageWindow = $(".message-window");
  var scrollHeight = messageWindow.prop("scrollHeight");
  messageWindow.stop().animate({scrollTop: scrollHeight}, duration || 0);
};

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("messages", {
     onReady: function () {
      scrollToBottom();
      autoScrollingIsActive = true;
    }
  });
  // }

  /* helper code */
    Template.body.helpers({
    recentMessages: function () {
      return Messages.find({}, {sort: {createdAt: 1}});
    },
    /* unread message helper */
  thereAreUnreadMessages: function () {
      return thereAreUnreadMessages.get();
    }
  });

  /*chat window scrolling*/
    Template.message.onRendered(function () {
    if (autoScrollingIsActive) {
      scrollToBottom(250);
    }  else {
      if (Meteor.user() && this.data.username !== Meteor.user().username) {
        thereAreUnreadMessages.set(false);
      }
    }
  });


  /*events*/
    Template.body.events({
    "submit .new-message": function (event) {
      var text = event.target.text.value;

      Meteor.call("sendMessage", text);

      event.target.text.value = "";
      event.preventDefault();
    },

    /* scroll event */
        "scroll .message-window": function () {
      var howClose = 80;  // # pixels leeway to be considered "at Bottom"
      var messageWindow = $(".message-window");
      var scrollHeight = messageWindow.prop("scrollHeight");
      var scrollBottom = messageWindow.prop("scrollTop") + messageWindow.height();
      var atBottom = scrollBottom > (scrollHeight - howClose);
      autoScrollingIsActive = atBottom ? true : false;
 if (atBottom) {        // <--new
        thereAreUnreadMessages.set(false);
   }
 },
      "click .more-messages": function () {
      scrollToBottom(500);
      thereAreUnreadMessages.set(false);
    }
  });




  /*account config*/
   Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
 }
