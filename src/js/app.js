import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Election from '../../deployments/localhost/Election.json';

window.App = {
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
      await App.web3Provider.send("eth_requestAccounts", []);
      App.signer = App.web3Provider.getSigner();
      App.contracts.Election = new ethers.Contract(Election.address, Election.abi, App.signer);
      await App.contracts.Election.deployed();
      App.listenForEvents();

      return App.render();
  },

  render: async function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    var candidateBlock = $("#addCandidate");

    loader.show();
    candidateBlock.hide();
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

      var contractOwner = await electionInstance.owner()
      if(contractOwner == App.account) {
        candidateBlock.show();
      }

      loader.hide();
      content.show();
  },

  castVote: async function() {
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
    electionInstance.on("addCandidateEvent", (candidateCount) => {
      console.log("New candidate added with ID: " + candidateCount);
      App.render();
    });
  },

  addCandidate: async function() {
    var candidateName = $('#candidateName').val();
    const electionInstance = App.contracts.Election;
    await electionInstance.addCandidate(candidateName);
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});