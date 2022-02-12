let userName = prompt("Digite seu nome");
let userNameObject = {name: userName}

let userNameInputPromisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", userNameObject);
userNameInputPromisse.then(userNameAvailable);
userNameInputPromisse.catch(userNameInUse);

function userNameInUse (serverError) {
    userName = prompt("Nome já está em uso, digite outro.");
    userNameObject.name = userName;
    userNameInputPromisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/participants", userNameObject);
    userNameInputPromisse.then(userNameAvailable);
    userNameInputPromisse.catch(userNameInUse);
}

function statusUpdater () {
    axios.post("https://mock-api.driven.com.br/api/v4/uol/status", userNameObject);
}

function userNameAvailable (serverAnswer) {
    const threeSeconds = 3000;
    const fiveSeconds = 5000;
    setInterval(getMessages, threeSeconds); 
    setInterval(statusUpdater. fiveSeconds);
}

function getMessages () {
    let getMessagesPromisse = axios.get("https://mock-api.driven.com.br/api/v4/uol/messages");
    getMessagesPromisse.then(lookForNewMessages);
}

function lookForNewMessages (serverAnswer) {
    const messagesObject = serverAnswer.data;
    messagesObject.forEach(messageRenderer);
}

function messageRenderer (message) {
    const messagesSection = document.querySelector(".messages");
    if (message.type === "status") {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="statusMessage"><span>(${message.time})</span>
        <p><b>${message.from}</b> ${message.text}</p></article>`
    } 
    else if (message.type === "message") {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="message"><span>(${message.time})</span>
        <p><b>${message.from}</b> para <b>Todos</b> ${message.text}</p></article>`
    }
    else {
        messagesSection.innerHTML = messagesSection.innerHTML + 
        `<article class="privateMessage"><span>(${message.time})</span>
        <p><b>${message.from}</b> para <b>${message.to}</b> ${message.text}</p></article>`
    }
    const lastMessage = document.querySelector(".messages article:last-child");
    lastMessage.scrollIntoView();
}

function sendMessage () {
    let message = document.querySelector("input").value;
    const messagesObject = {
        from: userName,
        to: "Todos",
        text: message,
        type: "message"
    }
    document.querySelector("input").value = "";
    const sendMessagePromisse = axios.post("https://mock-api.driven.com.br/api/v4/uol/messages", messagesObject);
    sendMessagePromisse.then(getMessages)
    sendMessagePromisse.catch(couldntSendMessage)
}

function couldntSendMessage (resposta) {
    alert("Você foi desconectado, a página será atualizada");
    window.location.reload();
}
