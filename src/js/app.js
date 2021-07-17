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
      abi = JSON.parse('[ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, {"inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],"name": "candidates", "outputs": [ { "internalType": "uint256", "name": "id","type": "uint256" }, { "internalType": "string", "name": "name", "type":"string" }, { "internalType": "uint256", "name": "voteCount", "type":"uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs":[], "name": "candidatesCount", "outputs": [ { "internalType": "uint256","name": "", "type": "uint256" } ], "stateMutability": "view", "type":"function" } ]');
      await App.web3Provider.send("eth_requestAccounts", []);
      App.signer = App.web3Provider.getSigner();
      App.contracts.Election = new ethers.Contract('0x71918aA91162326f1d024e8B57Ec294A718030F4', abi, App.signer);

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

      for (var i = 1; i <= candidatesCount; i++) {
        var candidate = await electionInstance.candidates(i);
        var id = candidate[0];
        var name = candidate[1];
        var voteCount = candidate[2];

        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        candidatesResults.append(candidateTemplate);
      }

      loader.hide();
      content.show();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});