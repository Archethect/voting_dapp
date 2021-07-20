App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  signer: null,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = new ethers.providers.Web3Provider(window.ethereum)
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new ethers.providers.getDefaultProvider();
    }
    return App.initContract();
  },

  initContract: async function() {
      abi = JSON.parse('[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"votedEvent","type":"event"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"addCandidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidates","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"candidatesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"voters","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]');
      await App.web3Provider.send("eth_requestAccounts", []);
      App.signer = App.web3Provider.getSigner();
      App.contracts.Election = new ethers.Contract('0xB31c72b802dc1a60E506fbd0267Dd4e1fB2B9e4E', abi, App.signer);
      await App.contracts.Election.deployed();

      App.listenForEvents();

      return App.render();
  },

  render: async function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    App.account = await App.signer.getAddress();
    $("#accountAddress").html("Your Account: " + App.account);
    

    // Load contract data
      electionInstance = App.contracts.Election;
      var candidatesCount = await electionInstance.candidatesCount();
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        var candidate = await electionInstance.candidates(i);
        var id = candidate[0];
        var name = candidate[1];
        var voteCount = candidate[2];

        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        candidatesResults.append(candidateTemplate);

        var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
        candidatesSelect.append(candidateOption);
      }

      var hasVoted = await electionInstance.voters(App.account);
      if(hasVoted) {
        $('#castVote').hide();
      }      

      loader.hide();
      content.show();
  },

  castVote: async function() {
    $("#content").hide();
    $("#loader").show();
    var candidateId = $('#candidatesSelect').val();
    const electionInstance = App.contracts.Election;
    await electionInstance.vote(candidateId);
  },

  listenForEvents: async function() {
    const electionInstance = App.contracts.Election;
    electionInstance.on("votedEvent", (candidateId) => {
      console.log("New vote for candidate " + candidateId);
      App.render();
    }); 
  },

  addCandidate: async function() {

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});