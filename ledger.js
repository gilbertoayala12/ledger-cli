const program = require('commander');
const lineByLine = require('n-readlines');
program
  .option('-f, --file <filename>', 'filename')
  .option('-p, --print', 'add the specified type of regex');
program.parse(process.argv);
const fileName = program.file;
const regex = program.regex;
const rePttrn = /^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}/;

if (program.print !== undefined) {
  main();
}

function main() {
  let transactions = [];
  handleFile(fileName, transactions);
  //   console.log(transactions);
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
      //   console.log(lineStr);
      if (lineStr.match(rePttrn)) {
        transaction = {};
        transactions.push(transaction);
        let dateString = lineStr.split(' ')[0];
        transaction.date = dateString; // TODO: format date correctly
        transaction.description = lineStr.replace(dateString, '').trim();
      } else {
        /**
         * TODO: Format postings because
         *  {
         *     Account: Bank:Paypal,
         *     Price: 500, (maybe null)
         *     Commodity: $
         *  }
         */
        // format line
        let posting = {};
        let strFormat = lineStr.replace('\t', '');
        console.log(strFormat);
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

/**
 * Es leer el index y llamarlo recursivo para que se vaya leyendo
 * a los otros archivos
 * Meter los datos leidos a un lugar para despues leerla
 * Parsear correctamente la informacion
 */
