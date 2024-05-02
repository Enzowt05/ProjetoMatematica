const { readFile } = require('fs');

readFile('questions.json', 'utf8', (err, jsonString) => {
    const jsonObject = JSON.parse(jsonString);
    const category = jsonObject.quiz.category.find(c => c["@name"] === "Fácil");
    const questions = category.question[0];
    const question = questions.text;
    const answers = questions.answers;
    const alternativa = answers;
    console.log(alternativa)

});