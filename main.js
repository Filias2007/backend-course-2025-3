const { Command } = require('commander');
const fs = require('fs');
const program = new Command();

program
  .exitOverride()
  .configureOutput({
    writeErr: () => {}, 
    writeOut: () => {}  
  })
  .requiredOption('-i, --input <path>', 'шлях до файлу для читання')
  .option('-o, --output <path>', 'шлях до файлу для запису результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('-h, --humidity', 'відображати вологість вдень (Humidity3pm)')
  .option('-r, --rainfall <number>', 'фільтрувати за кількістю опадів (Rainfall)');


try {
  program.parse(process.argv);
} catch (err) {
  
  console.error("Please, specify input file");
  process.exit(1);
}

const options = program.opts();


if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

try {
  const rawData = fs.readFileSync(options.input, 'utf8');
  let data = JSON.parse(rawData);


  if (options.rainfall) {
    const minRain = parseFloat(options.rainfall);
    data = data.filter(item => parseFloat(item.Rainfall) > minRain);
  }

  const resultLines = data.map(item => {
    let line = `${item.Rainfall} ${item.Pressure3pm}`;
    if (options.humidity) {
      line += ` ${item.Humidity3pm}`;
    }
    return line;
  });

  const finalResult = resultLines.join('\n');

  if (options.display) {
    console.log(finalResult || "Нічого не знайдено за заданими фільтрами.");
  }


  if (options.output) {
    fs.writeFileSync(options.output, finalResult || "", 'utf8');
  }

} catch (err) {
  console.error("Помилка при опрацюванні JSON");
  process.exit(1);
}