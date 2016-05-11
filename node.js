var net = require('net');
var Peer = require('./peer');
var BlockChain = require('./blockchain');
var protocol = require('./protocol');
var Block = require('./block');
var Transaction = require('./transaction');

var PORT = 10000;

function Node(i) {
  this.id = i;
  this.peerIds = [];
  this.peers = {};

  this.server = net.createServer(this.onConnection_.bind(this));
  this.server.listen(PORT + i, function() {
    console.log('node ' + i + ' ready to accept');
  });

  this.blockchain = new BlockChain();
  this.blockchain.on('new-message', this.broadcast.bind(this));
}

Node.prototype.connect = function() {
  for (var i = 0; i < 5; ++i) {
    var rand = Math.floor(Math.random() * 10);
    if (rand !== this.id && !this.peers[rand]) {
      var peer = new Peer(rand, PORT + rand, this.id);
      peer.setMessageCb(this.processMessage_.bind(this));
      this.peerIds.push(rand);
      this.peers[rand] = peer;
    }
  }
}

Node.prototype.start = function() {
  this.blockchain.start();
}

Node.prototype.stop = function() {
}

Node.prototype.broadcast = function(msg) {
  for (var i in this.peers) {
    this.peers[i].send(msg);
  }
}

Node.prototype.onConnection_ = function(socket) {
  var peer = new Peer(socket, this.id);
  peer.setMessageCb(this.processMessage_.bind(this));
}

Node.prototype.processMessage_ = function(peer, msg) {
  var peerId = peer.getId();
  if (this.peers[peerId]) {
    this.peers[peerId].close();
  }
  this.peers[peerId] = peer;
  switch (msg.type) {
    case protocol.MessageType.Transaction:
      var trs = new Transaction(msg);
      if (!blockchain.hasTransaction(trs)) {
        if (blockchain.validateTransaction(trs)) {
          this.broadcast(msg);
          blockchain.addTransaction(trs);
        }
      }
      break;
    case protocol.MessageType.Block:
      var block = new Block(msg);
      if (!blockchain.hasBlock(block)) {
        if (blockchain.validateBlock(block)) {
          this.broadcast(msg);
          blockchain.addBlock(block);
        }
      }
      break;
    default:
      blockchain.processMessage(msg);
      break;
  }
}

module.exports = Node;