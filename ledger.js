const program = require('commander');
const lineByLine = require('n-readlines');
const colors = require('colors');
const numeral = require('numeral');
program
  .option('-f, --file <filename>', 'filename')
  .option('-p, --print', 'add the specified type of regex')
  .option('--price-db, --price_db <filename>', 'filename')
  .option('register, register', 'show all transactions and a running total');
program.parse(process.argv);

const price_db = program.price_db;
const fileName = program.file;
const regex = program.regex;
const rePttrn = /^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}/;
let defaultCommodity;
if (program.price_db !== undefined) {
  main();
}

function main() {
  let transactions = [];
  handlePrices(price_db);
  handleFile(fileName, transactions);
  if (program.register) {
    register(transactions);
  }
  if (program.print) {
    console.log('printea');
  }
  //   register(transactions);
  //   console.log(transactions);
}
function handlePrices(file) {
  const liner = new lineByLine(file);
  while ((line = liner.next())) {
    let lineStr = line.toString();
    if (lineStr.includes('N')) {
      defaultCommodity = lineStr.split(' ')[1];
    }
  }
}
function handleFile(file, transactions) {
  const liner = new lineByLine(file);
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
        transaction.description = lineStr.replace(dateString, '').trim();
      } else {
        // format line
        let posting = {};
        let strArr = lineStr
          .replace('\t', '')
          .split('\t')
          .filter(x => x.length > 1);
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
        } else {
          posting.Account = strArr[0];
        }
        // console.log(posting);
        // adds posting to transaction
        if (transaction.postings) {
          transaction.postings.push(posting);
        } else {
          transaction.postings = [posting];
        }
      }
    }
  }
}

function register(transactions) {
  let monies = [];
  transactions.forEach(element => {
    console.log(element.date, element.description);
    element.postings.forEach(element => {
      console.log(element.Account);
      console.log(element.price, element.commodity);
      if (!(element.price in monies)) {
        monies[element.commodity] = 0;
      }
      monies[element.commodity] += element.price;
      //   monies.forEach(price, ammount => {
      //     if (ammount === 0) {
      //       console.log(ammount + price);
      //     }
      //   });
    });
  });
}
