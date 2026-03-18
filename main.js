const { Command } = require('commander');
const fs = require('fs');
const program = new Command();

// Налаштування програми згідно з твоїм зразком
program
  .exitOverride() // Дозволяє перехоплювати помилки в try-catch
  .configureOutput({
    writeErr: () => {}, // Приховуємо стандартний вивід помилок
    writeOut: () => {}  // Приховуємо стандартний вивід повідомлень
  })
  .requiredOption('-i, --input <path>', 'шлях до файлу для читання')
  .option('-o, --output <path>', 'шлях до файлу для запису результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('-h, --humidity', 'відображати вологість вдень (Humidity3pm)')
  .option('-r, --rainfall <number>', 'фільтрувати за кількістю опадів (Rainfall)');

// Перехоплення помилок парсингу (наприклад, відсутність -i)
try {
  program.parse(process.argv);
} catch (err) {
  // Якщо параметр -i не вказано, виводимо саме цей текст
  console.error("Please, specify input file");
  process.exit(1);
}

const options = program.opts();

// Перевірка наявності файлу на диску
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

try {
  // Читання та парсинг даних про погоду
  const rawData = fs.readFileSync(options.input, 'utf8');
  let data = JSON.parse(rawData);

  // Логіка Варіанту 7: фільтрація за опадами (Rainfall)
  if (options.rainfall) {
    const minRain = parseFloat(options.rainfall);
    data = data.filter(item => parseFloat(item.Rainfall) > minRain);
  }

  // Формування результату: Rainfall Pressure3pm [Humidity3pm]
  const resultLines = data.map(item => {
    let line = `${item.Rainfall} ${item.Pressure3pm}`;
    if (options.humidity) {
      line += ` ${item.Humidity3pm}`;
    }
    return line;
  });

  const finalResult = resultLines.join('\n');

  // Вивід у консоль за запитом (-d)
  if (options.display) {
    console.log(finalResult || "Нічого не знайдено за заданими фільтрами.");
  }

  // Запис у файл за запитом (-o)
  if (options.output) {
    fs.writeFileSync(options.output, finalResult || "", 'utf8');
  }

} catch (err) {
  console.error("Помилка при опрацюванні JSON");
  process.exit(1);
}