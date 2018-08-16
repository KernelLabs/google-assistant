'use strict';

const EventEmitter = require('events');
const util = require('util');

const Assistant = require('./components/assistant');
const Auth = require('./components/auth');
const Conversation = require('./components/conversation');

function GoogleAssistant(authConfig, callback) {
  if (authConfig === undefined) {
    const error = new Error('Missing auth config object!');
    this.emit('error', error);
    if (callback) callback(error);
    return;
  }

  let assistant;

  // we need to auth with Google right out of the gate
  const auth = new Auth(authConfig);

  auth.on('ready', (client) => {
    assistant = new Assistant(client);
    this.emit('ready', assistant);
    if (callback) callback(assistant);
  });

  let me = this;
  this.start = (conversationConfig, callback) => {
    return new Promise((resolve, reject) => {
      if (assistant === undefined) {
        const error = new Error('Tried calling start() before the ready event!');
        me.emit('error', error);
        reject(error);
      }

      const conversation = new Conversation(assistant, conversationConfig);
      me.emit('started', conversation);
      resolve(conversation);
    });
  };

  return this;
}

util.inherits(GoogleAssistant, EventEmitter);
module.exports = GoogleAssistant;
