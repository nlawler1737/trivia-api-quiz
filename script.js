showQuizCreator();

function showQuizCreator() {
    const container = document.createElement("div");
    container.classList = "creator--container";

    const title = document.createElement("h1");
    title.innerText = "Create Quiz";

    const error = document.createElement("div");
    error.classList = "creator--error";

    const amount = document.createElement("input");
    amount.id = "select-amount";
    amount.dataset.query = "amount";
    amount.name = "amount";
    amount.type = "number";
    amount.value = "10";
    amount.pattern = "[1-9][0-9]*";
    amount.placeholder = "Question Amount";

    const selects = OPTIONS.map((category) => {
        const selectElem = document.createElement("select");
        selectElem.id = "select-" + category.id;
        selectElem.name = category.id;
        selectElem.dataset.query = category.id;
        const options = category.values.map((option) => {
            const optionElem = document.createElement("option");
            optionElem.innerText = option[0];
            optionElem.value = option[1];
            return optionElem;
        });
        selectElem.append(...options);
        return selectElem;
    });

    const submit = document.createElement("input");
    submit.innerText = "START";
    submit.type = "submit";
    submit.onclick = startQuiz;

    container.append(title, error, amount, ...selects, submit);
    setContent(container);
}

function getApiUrl() {
    const url = new URL("https://opentdb.com/api.php");
    const params = Array.from(
        document.querySelectorAll("select, #select-amount")
    )
        .map((e) => {
            if (e.dataset.query === "amount" && (e.value == 0 || !e.value)) {
                e.value = "10";
            }
            if (!e.value || e.value === "any") return "";
            return [e.dataset.query, e.value];
        })
        .filter((a) => a)
        .forEach((a) => url.searchParams.append(...a));
    return url.href;
}

function startQuiz() {
    fetch(getApiUrl())
        .then((data) => data.json())
        .then((json) => {
            if (json.response_code !== 0) {
                showCreatorError(json.response_code);
                return;
            }
            createQuiz(json);
        })
        .catch((error) => {
            showCreatorError(-1);
        });
}

function showCreatorError(code) {
    const error = document.querySelector(".creator--error");
    switch (code) {
        case -1:
            error.innerText = "Error: Try Again Later / Use Different Options";
            break;
        case 1:
            error.innerText = "No Results For Selection";
            break;
        case 2:
            error.innerText = "Invalid Parameter";
        default:
            break;
    }
}

function createQuiz(json) {
    const results = json.results;
    console.log(json);
    let correct = 0;
    const questions = [];

    results.forEach((e, i, arr) => {
        let checked = false;

        const container = document.createElement("div");
        container.classList = "question--container";

        const title = document.createElement("h1");
        title.innerText = "Trivia";

        const header = document.createElement("div");
        header.classList = "question--header";

        const category = document.createElement("div");
        category.classList - "question--category";
        category.innerText = e.category;

        const difficulty = document.createElement("div");
        difficulty.classList = "question--difficulty";

        const diffText = e.difficulty.split("");
        diffText[0] = diffText[0].toUpperCase();
        difficulty.innerText = diffText.join("");

        const question = document.createElement("div");
        question.classList = "question--question";
        question.innerHTML = `${i + 1}. ${e.question}`;

        const possibleAnswers = document.createElement("div");
        possibleAnswers.classList = "question--possible-answers";

        const answers = [];
        const selected = [];
        answers.push(createAnswer(e.correct_answer, 0, selected));
        e.incorrect_answers.forEach((a, b) =>
            answers.push(createAnswer(a, b + 1, selected))
        );

        const random = Array(answers.length)
            .fill()
            .map((a, b) => [Math.random(), answers[b], b == answers.length - 1])
            .sort((a, b) => a[0] - b[0]);

        random.forEach((a) => possibleAnswers.append(a[1]));
        const check = document.createElement("div");
        const next = document.createElement("div");
        check.classList = "question--check question--button";
        check.innerText = "Check";
        check.onclick = function () {
            if (checked || !selected.length) return;

            answers[0].classList.add("question--correct");
            if (selected[0] !== 0) {
                answers[selected[0]].classList.add("question--incorrect");
            } else correct++;
            next.style.display = "flex";
            checked = true;
        };
        next.classList = "question--next question--button";
        next.innerText = "Next";
        next.onclick = function () {
            setContent(
                i + 1 != questions.length
                    ? questions[i + 1]
                    : showScore(correct, questions.length)
            );
        };

        header.append(category, difficulty, question);
        container.append(title, header, possibleAnswers, check, next);
        questions.push(container);
    });
    setContent(questions[0]);
}

function setContent(...content) {
    const oldMain = document.querySelector("main");
    if (oldMain) oldMain.remove();
    const main = document.createElement("main");
    main.append(...content);
    document.body.insertAdjacentElement("afterbegin", main);
}

function createAnswer(text, index, selected) {
    const answer = document.createElement("div");
    answer.classList = "question--possible-answer question--button";
    answer.innerText = text;
    answer.onclick = function () {
        Array.from(answer.parentElement.children).forEach((a) =>
            a.classList.remove("question--selected")
        );
        answer.classList.add("question--selected");
        selected[0] = index;
    };
    return answer;
}

function showScore(correct, total) {
    const container = document.createElement("div");
    container.classList = "score--container";
    const score = document.createElement("div");
    score.classList = "score--score";
    score.innerText = `\
    ${correct}/${total} Correct
    ${((correct / total) * 100).toFixed(2)}%`;
    const refresh = document.createElement("div");
    refresh.innerText = "Back To Creator";
    refresh.onclick = () => {
        window.location.reload();
    };
    refresh.classList = "score--refresh";
    container.append(score, refresh);
    return container;
}
