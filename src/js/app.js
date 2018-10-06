App={
  web3Provider:null,
  contracts:{},
  account:'0x0',

  
  init:function(){
    return App.initWeb3();
  },
  //Initialize client side application to local block chain
  initWeb3: function(){
    if(typeof web3 !=='undefined'){
      //If a web3 instance is ready provided by Meta Masl--
      App.web3Provider=web3.currentProvider;
      web3=new Web3(web3.currentProvider);
    }else{
      App.web3Provider=new Web3.providers.HttpProvider('HTTP://127.0.0.1:8545');
      web3=new web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract:function(){
    $.getJSON("Verifier.json",function(verifier){
      //Instantiate a new truffle contract from the artifactes
      App.contracts.Verifier=TruffleContract(verifier);
      //Coonnect provider to intrect with contract
      App.contracts.Verifier.setProvider(App.web3Provider);
      
    });
  },
  toHex:function(str){
    var hex = ''
    for(var i=0;i<str.length;i++) {
    hex += ''+str.charCodeAt(i).toString(16)
    }
    return hex
  },
  sign:function(){
    let msg=$('#msg').val();
    let addr=web3.eth.accounts[0]
    $('#signAddress').text(addr)
    web3.personal.sign(web3.toHex(msg),addr, (err,signature) => $("#sign").val(signature))

  },
  verify:function(){
    var signature = $("#sign").val().substr(2); //remove 0x
    const r = '0x' + signature.slice(0, 64)
    const s = '0x' + signature.slice(64, 128)
    const v = '0x' + signature.slice(128, 130)
    var v_decimal = web3.toDecimal(v)
    if(v_decimal != 27 || v_decimal != 28) {
      v_decimal += 27
    }
    let msg=$("#VerifyMsg")
    App.contracts.Verifier.deployed().then(instance => {
      let fixed_msg = `\x19Ethereum Signed Message:\n${msg.length}${msg}`
      let fixed_msg_sha = web3.sha3(fixed_msg)
      return instance.recoverAddr.call(
        fixed_msg_sha,
        v_decimal,
        r,
        s
      )
    })
    .then(data => {
      $('#CheckAddress').text(data)
      console.log('-----data------')
      console.log(`input addr ==> ${web3.eth.accounts[0]}`)
      console.log(`output addr => ${data}`)
    })
    .catch(e => {
      console.error(e)
  });
  }
  

  
};

$(function(){
  $(window).load(function(){
    App.init();
  });
});






