const program = require('commander');
const lineByLine = require('n-readlines');
const colors = require('colors');
const numeral = require('numeral');
program
  .option('-f, --file <filename>', 'Filename')
  .option('print, --print [regex]', 'add the specified type of regex')
  .option('--sort, --sort <d>', 'sort the given output', false)
  .option('--price-db, --price_db <filename>', 'passes the info to the program')
  .option('register, register', 'show all transactions and a running total')
  .option('balance, balance', 'find the balances of all of your accounts');
program.parse(process.argv);

const price_db = program.price_db;
const fileName = program.file;
const rePttrn = /^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}/;
let defaultCommodity;
if (program.price_db !== undefined) {
  main();
}

function main() {
  let transactions = [];
  handlePrices(price_db);
  handleFile(fileName.replace('\r',''), transactions);
  if (program.register) {
    register(transactions);
  }
  if (program.print) {
    console.log(colors.rainbow('Printing'));
    print(transactions, program.print, program.sort);
  }
  if(program.balance){
    console.log(colors.rainbow('Balance'));
    balance(transactions);
  }
}
function handlePrices(file) {
  const liner = new lineByLine(file.replace('\r',''));
  while ((line = liner.next())) {
    let lineStr = line.toString();
    if (lineStr.includes('N')) {
      defaultCommodity = lineStr.split(' ')[1];
    }
  }
}
function handleFile(file, transactions) {
  const liner = new lineByLine(file.replace('\r',''));
  let transaction;
  while ((line = liner.next())) {
    let lineStr = line.toString();
    if (lineStr.includes('!include')) {
      handleFile(lineStr.split(' ')[1], transactions);
    }
    if (!lineStr.includes(';') && !lineStr.includes('!')) {
      if (lineStr.match(rePttrn)) {
        transaction = {};
        transactions.push(transaction);
        let dateString = new Date(lineStr.split(' ')[0]);
        transaction.date = dateString; // TODO: format date correctly
        transaction.description = lineStr
          .replace(lineStr.split(' ')[0], '')
          .trim();
      } else {
        // format line
        let posting = {};
        let strArr = lineStr
          .replace('\t', '')
          .split('\t')
          .filter(x => x.length > 1);
        


        posting.Account = strArr[0];
        if(strArr.length>1){
          if (strArr.length === 2) {
            const lenPrice = strArr[1].split(' ').length;
            posting.Account = strArr[0];
            if (lenPrice === 2) {
              // btc or any currency at its right
              let commodity = strArr[1].split(' ');
              posting.price = parseFloat(commodity[0]);
              posting.commodity = commodity[1];
            } else {
              // parsing price $300, -$300, $-400
              let value = numeral(strArr[1]).value();
              posting.price = value;
              posting.commodity = defaultCommodity;
            }
          } 
        }else{
          posting.commodity = transaction.postings[0].commodity;
          posting.price = -transaction.postings[0].price;
        }
        if (transaction.postings) {
          transaction.postings.push(posting);
        } else {
          transaction.postings = [posting];
        }
      }
    }
  }
}

function print(transactions, regex, sort) {
  let sortedTrans = transactions.sort(function(a, b) {
    return a.date - b.date;
  });
  if (sort) {
    console.log(colors.rainbow('sorted'));
    sortedTrans.forEach(element => {
      if (regex.length) {
        if (element.description.includes(regex)) {
          console.log(colors.blue('given regex', colors.green(regex)));
          console.log(colors.blue(element.date), element.description);
          element.postings.forEach(element => {
            console.log('\t', element.Account);
            if (element.price !== undefined) {
              element.price < 0
                ? console.log(
                    '\t',
                    colors.red(element.price),
                    element.commodity
                  )
                : console.log(
                    '\t',
                    colors.green(element.price),
                    element.commodity
                  );
            }
          });
        }
      } else {
        console.log(colors.blue(element.date), element.description);
        element.postings.forEach(element => {
          console.log('\t', element.Account);
          if (element.price !== undefined) {
            element.price < 0
              ? console.log('\t', colors.red(element.price), element.commodity)
              : console.log(
                  '\t',
                  colors.green(element.price),
                  element.commodity
                );
          }
        });
      }
    });
    return;
  }
  transactions.forEach(element => {
    if (regex.length) {
      if (element.description.includes(regex)) {
        console.log(colors.blue('given regex', colors.green(regex)));
        console.log(colors.blue(element.date), element.description);
        element.postings.forEach(element => {
          console.log('\t', element.Account);
          if (element.price !== undefined) {
            element.price < 0
              ? console.log('\t', colors.red(element.price), element.commodity)
              : console.log(
                  '\t',
                  colors.green(element.price),
                  element.commodity
                );
          }
        });
      }
    } else {
      console.log(colors.blue(element.date), element.description);
      element.postings.forEach(element => {
        console.log('\t', element.Account);
        if (element.price !== undefined) {
          element.price < 0
            ? console.log('\t', colors.red(element.price), element.commodity)
            : console.log('\t', colors.green(element.price), element.commodity);
        }
      });
    }
  });
}
function balance(transactions){
  let tree ={};
  let node = {};
  node.subAccounts=[];
  node.priceBalance={};
  node.account='root';
  tree.root =node;
  let currentNode = tree.root;
  transactions.forEach(transaction =>{
    transaction.postings.forEach(posting=>{
      if(!(posting.commodity in currentNode.priceBalance )){
        currentNode.priceBalance[posting.commodity]=0;
      }
      currentNode.priceBalance[posting.commodity]+=posting.price
      posting.Account.split(':').forEach(account=>{
        let nextNode;
        // Check if subaccount exists
          currentNode.subAccounts.forEach(subAccount =>{
            if(subAccount.account==account){
              nextNode = subAccount;
            }
          })


          if(nextNode){
            currentNode= nextNode;
          }else{
            let newNode ={};
            newNode.subAccounts=[];
            newNode.priceBalance ={};
            newNode.account = account;
            currentNode.subAccounts.push(newNode);
            currentNode = newNode;
          }
          
          if(!(posting.commodity in currentNode.priceBalance )){
            currentNode.priceBalance[posting.commodity]=0;
          }
          currentNode.priceBalance[posting.commodity]+=posting.price


      })
      currentNode = tree.root;
    })
  })



  
  console.log(JSON.stringify(tree,null,2))
}
function register(transactions) {
  let monies = [];
  transactions.forEach(transaction => {
    console.log(colors.blue(transaction.date), colors.yellow(transaction.description));
    transaction.postings.forEach(posting => {
      console.log('\t', posting.Account);
      if (posting.price !== undefined) {
        posting .price < 0
          ? console.log('\t', colors.red(posting.price), posting.commodity)
          : console.log('\t', colors.green(posting.price), posting.commodity);
          
        if(!(posting.commodity in monies)){
          monies[posting.commodity]=0;
        }
        monies[posting.commodity]+=posting.price;
      }
      //console.log(monies)
    });
  });
  // format this shizzle up this shizzle up 
  console.log(colors.yellow(monies))
}
