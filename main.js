const { Command } = require('commander'); 
const fs = require('fs');
const program = new Command(); 

program
  .option('-i, --input <path>', 'шлях до файлу для читання (обов’язковий)')
  .option('-o, --output <path>', 'шлях до файлу для запису результату') 
  .option('-d, --display', 'вивести результат у консоль') 
  .option('-h, --humidity', 'відображати вологість вдень (Humidity3pm)') 
  .option('-r, --rainfall <number>', 'фільтрувати за кількістю опадів (Rainfall)');

program.parse(process.argv);
const options = program.opts();


if (!options.input) {
  console.error("Please, specify input file"); 
  process.exit(1);
}

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

  const result = data.map(item => {
    let line = `${item.Rainfall} ${item.Pressure3pm}`;
    if (options.humidity) {
      line += ` ${item.Humidity3pm}`;
    }
    return line;
  }).join('\n');

  if (options.display) {
    console.log(result || "Нічого не знайдено за заданими фільтрами.");
  }

  if (options.output) {
    fs.writeFileSync(options.output, result || "", 'utf8');
    console.log(`Успіх! Результат записано у файл: ${options.output}`);
  }

} catch (err) {
  console.error("Помилка при опрацюванні JSON");
  process.exit(1);
}