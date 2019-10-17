const program = require('commander');
const lineReader = require('line-reader');
const fs = require('fs');
program
  .option('-f, --file <filename>', 'filename')
  .option('-p, --print [regex]', 'add the specified type of regex');
program.parse(process.argv);
const fileName = program.file;
const regex = program.regex;

if (program.print !== undefined) {
  main();
}

const transactions = {};

function handleFile(file) {
  lineReader.eachLine(file, line => {
    if (line.includes('!include')) {
      handleFile(line.split(' ')[1]);
    } else {
      if (!line.includes(';')) {
        console.log(line);
      }
    }
  });
}

function main() {
  handleFile(fileName);
}
/**
 * Es leer el index y llamarlo recursivo para que se vaya leyendo
 * a los otros archivos
 * Meter los datos leidos a un lugar para despues leerla
 * Parsear correctamente la informacion
 */
