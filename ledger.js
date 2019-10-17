const program = require('commander');
const lineReader = require('line-reader');
const fs = require('fs');
program.option('-f, --file <filename>', 'filename');
program.parse(process.argv);
const fileName = program.file;
const transactions = {};
main();
function handleFile(file) {
  lineReader.eachLine(file, line => {
    if (line.includes('!include')) {
      handleFile(line.split(' ')[1]);
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
